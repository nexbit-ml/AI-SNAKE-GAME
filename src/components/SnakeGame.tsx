import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Zap, Activity, Brain, Gauge } from 'lucide-react';
import { Point, GameStatus, Algorithm } from '../game/types';
import { 
  BOARD_SIZE, 
  INITIAL_SNAKE, 
  INITIAL_DIRECTION, 
  TICK_RATE_MS, 
  AI_TICK_RATE_MS,
  DIRECTIONS_MAP,
} from '../game/constants';
import { getNextMove, isValid } from '../game/algorithms';

// Utility to generate random food
const generateFood = (snake: Point[]): Point => {
  let newFood: Point;
  while (true) {
    newFood = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
    // Check if food is on snake
    const onSnake = snake.some(s => s.x === newFood.x && s.y === newFood.y);
    if (!onSnake) break;
  }
  return newFood;
};

const SnakeGame: React.FC = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(DIRECTIONS_MAP[INITIAL_DIRECTION]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [status, setStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [algorithm, setAlgorithm] = useState<Algorithm>('MANUAL');
  const [speed, setSpeed] = useState(TICK_RATE_MS);
  
  // Ref for latest state to avoid stale closures in interval
  const snakeRef = useRef(snake);
  const directionRef = useRef(direction);
  const statusRef = useRef(status);
  const algorithmRef = useRef(algorithm);
  
  // Sync refs
  useEffect(() => {
    snakeRef.current = snake;
    directionRef.current = direction;
    statusRef.current = status;
    algorithmRef.current = algorithm;
  }, [snake, direction, status, algorithm]);

  // Initialize food on mount
  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(DIRECTIONS_MAP[INITIAL_DIRECTION]);
    setScore(0);
    setStatus('IDLE');
    setFood(generateFood(INITIAL_SNAKE));
  };

  const gameOver = () => {
    setStatus('GAME_OVER');
    if (score > highScore) {
      setHighScore(score);
    }
  };

  const tick = useCallback(() => {
    if (statusRef.current !== 'PLAYING') return;

    const currentSnake = snakeRef.current;
    const currentHead = currentSnake[0];
    let nextDir = directionRef.current;

    // AI Logic
    if (algorithmRef.current !== 'MANUAL') {
      const algo = algorithmRef.current === 'A_STAR' ? 'A_STAR' : 'BFS';
      // We pass the current snake.
      // Note: The AI calculates the move based on current state.
      const move = getNextMove(algo, currentHead, food, currentSnake);
      if (move) {
        // Calculate direction from head to move
        nextDir = { x: move.x - currentHead.x, y: move.y - currentHead.y };
        setDirection(nextDir);
      } else {
        // AI couldn't find a move (trapped?) - keep going current direction or die
        // Ideally getNextMove returns a safe move if no path to food.
        // If it returns null, we are really stuck.
      }
    }

    const nextHead = {
      x: currentHead.x + nextDir.x,
      y: currentHead.y + nextDir.y,
    };

    // Check Wall Collision
    if (!isValid(nextHead)) {
      gameOver();
      return;
    }

    // Check Self Collision
    // We ignore the tail because it will move forward, UNLESS we eat food.
    // But usually collision checks include tail.
    // If we just ate, tail didn't move.
    // Let's implement strict checking: if nextHead is in snake body (excluding tail for now)
    // If we are about to eat, tail stays, so we check full body.
    // If we are not eating, tail moves, so we can ignore last segment.
    
    const willEat = nextHead.x === food.x && nextHead.y === food.y;
    const segmentsToCheck = willEat ? currentSnake : currentSnake.slice(0, -1);
    
    if (segmentsToCheck.some(s => s.x === nextHead.x && s.y === nextHead.y)) {
      gameOver();
      return;
    }

    // Move
    const newSnake = [nextHead, ...currentSnake];
    
    if (willEat) {
      setScore(s => s + 1);
      setFood(generateFood(newSnake));
      // Don't pop tail
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [food]); // dependency on food because we read it

  // Game Loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (status === 'PLAYING') {
      intervalId = setInterval(tick, algorithm === 'MANUAL' ? speed : AI_TICK_RATE_MS);
    }
    return () => clearInterval(intervalId);
  }, [status, algorithm, speed, tick]);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (algorithm !== 'MANUAL') return;
      
      const currentDir = directionRef.current;
      let newDir = currentDir;

      switch (e.key) {
        case 'ArrowUp':
          if (currentDir.y !== 1) newDir = DIRECTIONS_MAP.UP;
          break;
        case 'ArrowDown':
          if (currentDir.y !== -1) newDir = DIRECTIONS_MAP.DOWN;
          break;
        case 'ArrowLeft':
          if (currentDir.x !== 1) newDir = DIRECTIONS_MAP.LEFT;
          break;
        case 'ArrowRight':
          if (currentDir.x !== -1) newDir = DIRECTIONS_MAP.RIGHT;
          break;
      }
      setDirection(newDir);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [algorithm]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-100 font-sans">
      <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
        AI Snake Game
      </h1>

      <div className="flex gap-8 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 w-48">
          <div className="text-slate-400 text-sm mb-1">Score</div>
          <div className="text-3xl font-mono text-green-400">{score}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg shadow-lg border border-slate-700 w-48">
          <div className="text-slate-400 text-sm mb-1">High Score</div>
          <div className="text-3xl font-mono text-blue-400">{highScore}</div>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-2 bg-slate-800 p-2 rounded-lg border border-slate-700 justify-center">
           <button 
             onClick={() => setAlgorithm('MANUAL')}
             className={`px-3 py-1 rounded flex items-center gap-2 ${algorithm === 'MANUAL' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
           >
             <Brain size={16} /> Manual
           </button>
           <button 
             onClick={() => setAlgorithm('BFS')}
             className={`px-3 py-1 rounded flex items-center gap-2 ${algorithm === 'BFS' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
           >
             <Zap size={16} /> AI (BFS)
           </button>
           <button 
             onClick={() => setAlgorithm('A_STAR')}
             className={`px-3 py-1 rounded flex items-center gap-2 ${algorithm === 'A_STAR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}
           >
             <Activity size={16} /> AI (A*)
           </button>
        </div>
        
        {algorithm === 'MANUAL' && (
          <div className="flex items-center gap-4 bg-slate-800 p-2 rounded-lg border border-slate-700 px-4">
            <Gauge size={20} className="text-slate-400" />
            <input 
              type="range" 
              min="50" 
              max="200" 
              step="10"
              value={200 - speed + 50} // Invert so right is faster
              onChange={(e) => setSpeed(200 - parseInt(e.target.value) + 50)}
              className="w-full accent-green-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-slate-400 text-sm w-12 text-right">
              {Math.round((200 - speed + 50) / 2)}%
            </span>
          </div>
        )}
      </div>

      <div 
        className="relative bg-slate-950 border-2 border-slate-700 shadow-2xl rounded-sm"
        style={{ 
          width: BOARD_SIZE * 20, 
          height: BOARD_SIZE * 20,
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`
        }}
      >
        {(() => {
          // Optimize rendering using a Set for O(1) lookup
          const snakeBodySet = new Set(snake.map(s => `${s.x},${s.y}`));
          const head = snake[0];

          return Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, i) => {
            const x = i % BOARD_SIZE;
            const y = Math.floor(i / BOARD_SIZE);
            const key = `${x},${y}`;
            
            const isHead = head.x === x && head.y === y;
            const isSnake = snakeBodySet.has(key);
            const isFood = food.x === x && food.y === y;

            return (
              <div 
                key={i} 
                className={`w-full h-full border-[0.5px] border-slate-900/50 
                  ${isHead ? 'bg-green-400 rounded-sm z-10' : ''}
                  ${isSnake && !isHead ? 'bg-green-600/80 rounded-sm' : ''}
                  ${isFood ? 'bg-red-500 rounded-full scale-75 shadow-[0_0_10px_rgba(239,68,68,0.6)]' : ''}
                `}
              />
            );
          });
        })()}
        
        {status === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center p-6 bg-slate-800 rounded-xl border border-slate-600 shadow-2xl">
              <h2 className="text-3xl font-bold text-red-500 mb-2">Game Over!</h2>
              <p className="text-slate-300 mb-6">Final Score: {score}</p>
              <button 
                onClick={resetGame}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition-colors flex items-center gap-2 mx-auto"
              >
                <RotateCcw size={18} /> Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-6">
        {status === 'IDLE' || status === 'GAME_OVER' ? (
          <button 
            onClick={() => setStatus('PLAYING')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition-colors flex items-center gap-2"
          >
            <Play size={20} /> Start Game
          </button>
        ) : status === 'PLAYING' ? (
           <button 
            onClick={() => setStatus('PAUSED')}
            className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded transition-colors flex items-center gap-2"
          >
            <Pause size={20} /> Pause
          </button>
        ) : (
          <button 
            onClick={() => setStatus('PLAYING')}
            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded transition-colors flex items-center gap-2"
          >
            <Play size={20} /> Resume
          </button>
        )}
        
        <button 
          onClick={resetGame}
          className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded transition-colors flex items-center gap-2"
        >
          <RotateCcw size={20} /> Reset
        </button>
      </div>

      <div className="mt-8 text-slate-500 text-sm max-w-md text-center">
        <p className="mb-2">
          <strong className="text-slate-300">DSA Project Showcase</strong><br/>
          Demonstrates Graph Traversal algorithms (BFS, A*) and Heuristics to solve the Snake Game in real-time.
        </p>
        <p>
          Controls (Manual): Arrow Keys to move.
        </p>
      </div>
    </div>
  );
};

export default SnakeGame;
