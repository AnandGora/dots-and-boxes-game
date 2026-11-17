# Dots and Boxes (Dot Connecting Strategy Game)

A modern, responsive, feature-rich web implementation of the classic pencil-and-paper game **Dots and Boxes** built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**.

Play solo against an intelligent computer AI with 4 distinct difficulty modes, conquer progressive Campaign challenge levels, customize your grid size, and track your match history and stats.

---

## 🎮 How to Play

1. **Taking Turns**: Players take turns drawing a single horizontal or vertical line between two adjacent dots.
2. **Capturing a Box**: When a player draws the 4th line that encloses a 1×1 square, they claim that box! The box is filled with their color and initials/avatar.
3. **Bonus Turn Rule (Crucial)**: Whenever you capture a box, you receive an **immediate EXTRA TURN**! If that line closes another box (or closes two boxes at once), you keep going!
4. **Winning**: Once all boxes on the grid have been claimed, the player who captured the most boxes wins the game!

---

## ✨ Features

- 🤖 **Computer Opponent (AI Engine)**:
  - **Novice (Easy)**: Casual bot for beginners; takes boxes when it spots them, plays relaxed moves.
  - **Casual (Medium)**: Always captures open boxes; strictly avoids handing 3-sided boxes to the player.
  - **Challenger (Hard)**: Evaluates sacrifice chains, prioritizes safe perimeter lines, and minimizes territory given away when forced to concede.
  - **Grandmaster (Master)**: Implements Dots & Boxes double-dealing control techniques, cycle analysis, and endgame minimax search.
- 🏆 **Campaign Levels Progression**:
  - 8 Handcrafted campaign challenges ranging from 2×2 up to 6×6 grids.
  - Star rating system (1 to 3 stars per level based on victory margin).
  - Progressive unlocking system as stars are accumulated.
- 🎛️ **Custom Match & Pass & Play**:
  - Customizable grid dimensions from 2×2 up to 7×7.
  - Option to play solo against any AI difficulty or local 2-Player ("Pass & Play") on the same screen.
  - Coin toss option for first turn.
- 📜 **Match History & Statistics**:
  - Saved persistently in browser `localStorage`.
  - Detailed match log with date/time, score, grid dimensions, outcome, and duration.
  - Career stats: Games played, win rate, best win streak, and total boxes captured.
  - Milestones and achievements.
- 🎨 **Visuals, Sound & Themes**:
  - Responsive SVG board with generous touch/click hitboxes for mobile and desktop.
  - Dynamic themes: Midnight Dark, Blueprint, Cyber Neon, and Light.
  - Interactive Web Audio API sound synthesizer (no external asset latency/failure).
  - Confetti burst on victories.
  - Move undo support and rematch button.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Celebration FX**: Canvas Confetti
- **Audio**: Web Audio API (native browser synthesis)

---

## 🚀 Getting Started

Run the development server locally:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create a production build:

```bash
npm run build
npm run start
```
