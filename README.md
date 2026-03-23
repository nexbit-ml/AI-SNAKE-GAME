# AI Snake Game

## 🐍 Overview

A sophisticated, web-based implementation of the classic Snake game featuring an artificial intelligence solver. This project serves as a practical demonstration of **Data Structures and Algorithms (DSA)**, specifically graph traversal and pathfinding algorithms, applied in a real-time environment.

The application is built using **React**, **TypeScript**, and **Tailwind CSS**, offering a modern, responsive, and interactive user interface.

## 🚀 Features

-   **🤖 AI Autopilot**: Watch the AI solve the game using advanced pathfinding algorithms.
-   **🎮 Manual Mode**: Classic gameplay with responsive keyboard controls.
-   **⚡ Speed Control**: Adjust the simulation speed from slow motion to super-fast.
-   **📊 Real-time Stats**: Tracks current score and high score.
-   **🎨 Modern UI**: Beautiful dark-themed interface with vector icons and smooth rendering.

## 🧠 Algorithms & Data Structures

This project implements the following DSA concepts directly in the frontend:

### 1. Breadth-First Search (BFS)
-   **Concept**: Graph Traversal.
-   **Usage**: Finds the **shortest guaranteed path** from the snake's head to the food.
-   **Complexity**: Time `O(V+E)`, Space `O(V)`.
-   **Behavior**: Creates a queue of coordinates to explore the grid level-by-level. It ensures the snake takes the most optimal route but treats all open cells equally.

### 2. A* Search (A-Star)
-   **Concept**: Informed Search Algorithm.
-   **Usage**: Finds the shortest path more efficiently than BFS by using a heuristic.
-   **Heuristic Used**: **Manhattan Distance** (`|x1 - x2| + |y1 - y2|`). This estimates the distance to the food, guiding the search direction.
-   **Behavior**: Prioritizes nodes that are closer to the target, resulting in fewer explored nodes and faster decision-making.

### 3. Survival Heuristic (Longest Path Approximation)
-   **Concept**: Greedy Algorithm / Flood Fill.
-   **Usage**: When the snake is trapped (no path to food exists due to its own body), it switches to **Survival Mode**.
-   **Behavior**: The algorithm calculates the "open space" accessible from each possible move using a Flood Fill-like approach (limited BFS). It chooses the move that leads to the largest connected component of empty space, allowing the snake to "stall" and chase its own tail until a path to the food clears up.

## 🛠️ Tech Stack

-   **Frontend Framework**: React 18
-   **Language**: TypeScript (for strong typing of coordinates and game state)
-   **Styling**: Tailwind CSS (Utility-first CSS)
-   **Build Tool**: Vite
-   **Icons**: Lucide React

## 📦 Installation & Setup

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/ai-snake-game.git
    cd ai-snake-game
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open `http://localhost:5173` in your browser.

4.  **Build for Production**:
    ```bash
    npm run build
    ```
    The output will be in the `dist` folder.

## 🎮 Controls

| Key | Action |
| :--- | :--- |
| **Arrow Keys** | Move Snake (Manual Mode) |
| **Space** | Pause / Resume |
| **R** | Reset Game |

## 📂 Project Structure

-   `src/game/algorithms.ts`: Contains the core BFS, A*, and heuristic logic.
-   `src/game/constants.ts`: Configuration for board size, speeds, and directions.
-   `src/game/types.ts`: TypeScript definitions for coordinates and game state.
-   `src/components/SnakeGame.tsx`: Main React component handling the game loop and rendering.
-   `src/App.tsx`: Root component.

---
*Created for Data Structures and Algorithms Project Showcase.*
