'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  GameBoardState,
  createInitialGameBoard,
  makeMove,
} from '@/lib/gameEngine';
import { getComputerMove } from '@/lib/aiEngine';
import { CAMPAIGN_LEVELS, calculateStarsEarned, CampaignLevel } from '@/lib/levels';
import { sound } from '@/lib/audio';
import {
  loadSettings,
  saveSettings,
  loadStats,
  loadHistory,
  recordGameResult,
  clearHistory as clearStoredHistory,
} from '@/lib/storage';
import { GameSettings, HistoryRecord, OverallStats, Difficulty, GameMode } from '@/types/game';

import { GameBoard } from '@/components/GameBoard';
import { ScoreBoard } from '@/components/ScoreBoard';
import { LevelSelect } from '@/components/LevelSelect';
import { HistoryModal } from '@/components/HistoryModal';
import { StatsModal } from '@/components/StatsModal';
import { HowToPlayModal } from '@/components/HowToPlayModal';
import { CustomGameModal } from '@/components/CustomGameModal';
import { GameOverModal } from '@/components/GameOverModal';
import { Navbar } from '@/components/Navbar';

import { RotateCcw, Undo2, Sliders, Grid } from 'lucide-react';

export default function DotsAndBoxesGame() {
  // Settings & Storage State
  const [settings, setSettings] = useState<GameSettings>(() => loadSettings());
  const [stats, setStats] = useState<OverallStats>(() => loadStats());
  const [history, setHistory] = useState<HistoryRecord[]>(() => loadHistory());

  // Views & Modals
  const [activeView, setActiveView] = useState<'game' | 'levels'>('game');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isCustomGameOpen, setIsCustomGameOpen] = useState(false);
  const [isGameOverOpen, setIsGameOverOpen] = useState(false);

  // In-Game Board State
  const [boardState, setBoardState] = useState<GameBoardState>(() => {
    const s = loadSettings();
    return createInitialGameBoard(s.rows, s.cols, s.firstTurn === 'player2' ? 'player2' : 'player1');
  });

  const [isAiThinking, setIsAiThinking] = useState(false);
  const gameStartTimeRef = useRef<number>(0);
  const isAiLoopRunningRef = useRef<boolean>(false);

  // Initialize start time on client mount
  useEffect(() => {
    gameStartTimeRef.current = Date.now();
  }, []);

  // Sync theme with HTML data-theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Sync sound setting
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Find current campaign level if in campaign mode
  const currentCampaignLevel = settings.mode === 'campaign'
    ? CAMPAIGN_LEVELS.find((l) => l.id === settings.levelId) || CAMPAIGN_LEVELS[0]
    : undefined;

  // Start a fresh game with specific parameters
  const startNewGame = useCallback((
    rows: number,
    cols: number,
    difficulty: Difficulty,
    mode: GameMode,
    levelId?: number,
    firstTurnChoice?: 'player1' | 'player2' | 'random'
  ) => {
    isAiLoopRunningRef.current = false;
    setIsAiThinking(false);
    setIsGameOverOpen(false);

    const chosenFirstTurn = firstTurnChoice
      ? (firstTurnChoice === 'random' ? (Math.random() > 0.5 ? 'player1' : 'player2') : firstTurnChoice)
      : 'player1';

    const newBoard = createInitialGameBoard(rows, cols, chosenFirstTurn);
    setBoardState(newBoard);
    gameStartTimeRef.current = Date.now();

    const updated = saveSettings({
      rows,
      cols,
      difficulty,
      mode,
      levelId,
    });
    setSettings(updated);
    setActiveView('game');
  }, []);

  // Handle Game Over
  const handleGameEnd = useCallback((finalState: GameBoardState) => {
    const durationSeconds = Math.max(1, Math.round((Date.now() - gameStartTimeRef.current) / 1000));
    const totalBoxes = finalState.rows * finalState.cols;

    let starsEarned = 0;
    if (settings.mode === 'campaign') {
      starsEarned = calculateStarsEarned(finalState.scores.player1, finalState.scores.player2, totalBoxes);
    }

    const record: HistoryRecord = {
      id: `match-${Date.now()}`,
      date: new Date().toISOString(),
      mode: settings.mode,
      levelId: settings.levelId,
      levelName: currentCampaignLevel?.name,
      rows: finalState.rows,
      cols: finalState.cols,
      difficulty: settings.difficulty,
      player1Score: finalState.scores.player1,
      player2Score: finalState.scores.player2,
      winner: finalState.winner || 'tie',
      durationSeconds,
      movesCount: finalState.moveHistory.length,
      starsEarned,
    };

    const updatedStats = recordGameResult(record, starsEarned);
    setStats(updatedStats);
    setHistory(loadHistory());

    if (finalState.winner === 'player1') {
      sound.playVictory();
    } else if (finalState.winner === 'player2') {
      sound.playDefeat();
    }

    setIsGameOverOpen(true);
  }, [settings.mode, settings.levelId, settings.difficulty, currentCampaignLevel]);

  // AI Turn Loop Trigger
  useEffect(() => {
    if (
      boardState.isGameOver ||
      settings.mode === 'pvp' ||
      boardState.currentPlayer !== 'player2' ||
      isAiLoopRunningRef.current
    ) {
      return;
    }

    isAiLoopRunningRef.current = true;
    setIsAiThinking(true);

    const delay = settings.difficulty === 'easy' ? 450 : settings.difficulty === 'medium' ? 550 : 650;

    const timer = setTimeout(() => {
      setBoardState((prev) => {
        if (prev.isGameOver || prev.currentPlayer !== 'player2') {
          isAiLoopRunningRef.current = false;
          setIsAiThinking(false);
          return prev;
        }

        const aiLineId = getComputerMove(prev, settings.difficulty);
        if (!aiLineId) {
          isAiLoopRunningRef.current = false;
          setIsAiThinking(false);
          return prev;
        }

        sound.playLineDraw();
        const nextState = makeMove(prev, aiLineId, 'player2');

        const boxesWon = nextState.lastMove?.boxesClaimed.length || 0;
        if (boxesWon >= 2) {
          sound.playDoubleBoxCapture();
        } else if (boxesWon === 1) {
          sound.playBoxCapture();
        }

        if (nextState.lastMove?.isExtraTurn && !nextState.isGameOver) {
          sound.playExtraTurn();
        }

        if (nextState.isGameOver) {
          handleGameEnd(nextState);
        }

        isAiLoopRunningRef.current = false;
        setIsAiThinking(false);
        return nextState;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [boardState, settings.difficulty, settings.mode, handleGameEnd]);

  // Human Player Move
  const handleLineClick = (lineId: string) => {
    if (boardState.isGameOver || isAiThinking) return;
    if (settings.mode !== 'pvp' && boardState.currentPlayer !== 'player1') return;

    sound.playLineDraw();
    const nextState = makeMove(boardState, lineId);

    const boxesWon = nextState.lastMove?.boxesClaimed.length || 0;
    if (boxesWon >= 2) {
      sound.playDoubleBoxCapture();
    } else if (boxesWon === 1) {
      sound.playBoxCapture();
    }

    if (nextState.lastMove?.isExtraTurn && !nextState.isGameOver) {
      sound.playExtraTurn();
    }

    setBoardState(nextState);

    if (nextState.isGameOver) {
      handleGameEnd(nextState);
    }
  };

  // Undo Move (reverts player move + computer's response)
  const handleUndo = () => {
    if (boardState.moveHistory.length === 0 || boardState.isGameOver || isAiThinking) return;

    sound.playClick();
    setBoardState((prev) => {
      const historyCopy = [...prev.moveHistory];
      if (historyCopy.length === 0) return prev;

      if (settings.mode !== 'pvp') {
        while (historyCopy.length > 0 && historyCopy[historyCopy.length - 1].player === 'player2') {
          historyCopy.pop();
        }
        if (historyCopy.length > 0 && historyCopy[historyCopy.length - 1].player === 'player1') {
          historyCopy.pop();
        }
      } else {
        historyCopy.pop();
      }

      let rebuilt = createInitialGameBoard(prev.rows, prev.cols, 'player1');
      for (const move of historyCopy) {
        rebuilt = makeMove(rebuilt, move.lineId, move.player);
      }
      return rebuilt;
    });
  };

  // Restart Current Level / Match
  const handleRestart = () => {
    sound.playClick();
    startNewGame(
      settings.rows,
      settings.cols,
      settings.difficulty,
      settings.mode,
      settings.levelId,
      settings.firstTurn
    );
  };

  // Handle Campaign Level Select
  const handleSelectCampaignLevel = (level: CampaignLevel) => {
    sound.playClick();
    startNewGame(
      level.rows,
      level.cols,
      level.difficulty,
      'campaign',
      level.id,
      'player1'
    );
  };

  // Next Level in Campaign
  const handleNextLevel = () => {
    if (!currentCampaignLevel) return;
    const nextLevel = CAMPAIGN_LEVELS.find((l) => l.id === currentCampaignLevel.id + 1);
    if (nextLevel) {
      handleSelectCampaignLevel(nextLevel);
    }
  };

  const hasNextCampaignLevel = !!(
    currentCampaignLevel &&
    CAMPAIGN_LEVELS.some((l) => l.id === currentCampaignLevel.id + 1)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)]">
      {/* Top Navbar */}
      <Navbar
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const toggled = !settings.soundEnabled;
          sound.setEnabled(toggled);
          const updated = saveSettings({ soundEnabled: toggled });
          setSettings(updated);
        }}
        currentTheme={settings.theme}
        onChangeTheme={(newTheme) => {
          const updated = saveSettings({ theme: newTheme });
          setSettings(updated);
        }}
        onOpenHowToPlay={() => setIsHowToPlayOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenLevels={() => setActiveView(activeView === 'levels' ? 'game' : 'levels')}
      />

      {/* Main Container */}
      <main className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-3 sm:p-6">
        {activeView === 'levels' ? (
          <LevelSelect
            userStars={stats.stars}
            currentLevelId={settings.levelId}
            onSelectLevel={handleSelectCampaignLevel}
            onBackToGame={() => setActiveView('game')}
            onOpenCustomGame={() => {
              setActiveView('game');
              setIsCustomGameOpen(true);
            }}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-between space-y-4">
            {/* Live Score & Status Board */}
            <ScoreBoard
              boardState={boardState}
              mode={settings.mode}
              difficulty={settings.difficulty}
              isAiThinking={isAiThinking}
              levelName={currentCampaignLevel?.name}
            />

            {/* Interactive Dots and Boxes Game Board */}
            <div className="w-full flex-1 flex items-center justify-center my-auto">
              <GameBoard
                boardState={boardState}
                onLineClick={handleLineClick}
                disabled={isAiThinking || boardState.isGameOver}
                theme={settings.theme}
              />
            </div>

            {/* In-Game Bottom Action Bar */}
            <div className="w-full max-w-[560px] flex items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRestart}
                  title="Restart Game"
                  className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Restart</span>
                </button>

                <button
                  onClick={handleUndo}
                  disabled={boardState.moveHistory.length === 0 || isAiThinking || boardState.isGameOver}
                  title="Undo Move"
                  className="p-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 text-gray-300 hover:text-white border border-gray-800 cursor-pointer disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Undo2 className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Undo</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsCustomGameOpen(true)}
                  className="px-3 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-800 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-semibold"
                >
                  <Sliders className="w-3.5 h-3.5 text-purple-400" />
                  <span>Custom Grid</span>
                </button>

                <button
                  onClick={() => setActiveView('levels')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs cursor-pointer shadow-md shadow-cyan-600/20 transition-all flex items-center gap-1.5"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Levels</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onClearHistory={() => {
          clearStoredHistory();
          setHistory([]);
        }}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <CustomGameModal
        isOpen={isCustomGameOpen}
        onClose={() => setIsCustomGameOpen(false)}
        currentSettings={settings}
        onStartCustomGame={(customConfig) => {
          startNewGame(
            customConfig.rows,
            customConfig.cols,
            customConfig.difficulty,
            customConfig.mode,
            undefined,
            customConfig.firstTurn
          );
        }}
      />

      <GameOverModal
        isOpen={isGameOverOpen}
        onClose={() => setIsGameOverOpen(false)}
        boardState={boardState}
        mode={settings.mode}
        levelName={currentCampaignLevel?.name}
        starsEarned={
          settings.mode === 'campaign'
            ? calculateStarsEarned(boardState.scores.player1, boardState.scores.player2, boardState.rows * boardState.cols)
            : 0
        }
        hasNextLevel={hasNextCampaignLevel}
        onPlayAgain={handleRestart}
        onNextLevel={handleNextLevel}
        onLevelSelect={() => {
          setIsGameOverOpen(false);
          setActiveView('levels');
        }}
      />
    </div>
  );
}
