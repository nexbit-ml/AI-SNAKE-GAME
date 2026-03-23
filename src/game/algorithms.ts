import { Point } from './types';
import { BOARD_SIZE, DIRECTIONS_ARRAY } from './constants';

// Helper to check if a point is on the board
export const isValid = (p: Point): boolean => {
  return p.x >= 0 && p.x < BOARD_SIZE && p.y >= 0 && p.y < BOARD_SIZE;
};

// Check if point is in snake body
export const isCollision = (p: Point, snake: Point[]): boolean => {
  return snake.some(s => s.x === p.x && s.y === p.y);
};

// BFS to find shortest path from head to target
export const getBFSPath = (start: Point, target: Point, snake: Point[]): Point[] | null => {
  const queue: { pos: Point; path: Point[] }[] = [];
  const visited = new Set<string>();
  
  // Snake body as obstacles
  const obstacles = new Set(snake.map(p => `${p.x},${p.y}`));

  queue.push({ pos: start, path: [] });
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { pos, path } = queue.shift()!;

    if (pos.x === target.x && pos.y === target.y) {
      return path;
    }

    for (const dir of DIRECTIONS_ARRAY) {
      const nextPos = { x: pos.x + dir.x, y: pos.y + dir.y };
      const key = `${nextPos.x},${nextPos.y}`;

      if (isValid(nextPos) && !visited.has(key)) {
        // It's valid if it's not an obstacle OR it's the target (even if target is technically "on" something, though usually food isn't on snake)
        if (!obstacles.has(key) || (nextPos.x === target.x && nextPos.y === target.y)) {
            visited.add(key);
            queue.push({ pos: nextPos, path: [...path, nextPos] });
        }
      }
    }
  }

  return null;
};

// Simple Manhattan distance heuristic
const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

// A* Algorithm
export const getAStarPath = (start: Point, target: Point, snake: Point[]): Point[] | null => {
  // Priority queue would be better, but array sort is okay for small board
  const openSet: { pos: Point; path: Point[]; f: number; g: number }[] = [];
  const closedSet = new Set<string>();
  const obstacles = new Set(snake.map(p => `${p.x},${p.y}`));

  openSet.push({ pos: start, path: [], f: 0, g: 0 });

  while (openSet.length > 0) {
    openSet.sort((a, b) => a.f - b.f);
    const current = openSet.shift()!;

    if (current.pos.x === target.x && current.pos.y === target.y) {
      return current.path;
    }

    closedSet.add(`${current.pos.x},${current.pos.y}`);

    for (const dir of DIRECTIONS_ARRAY) {
      const nextPos = { x: current.pos.x + dir.x, y: current.pos.y + dir.y };
      const key = `${nextPos.x},${nextPos.y}`;

      if (isValid(nextPos) && !closedSet.has(key) && !obstacles.has(key)) {
        const g = current.g + 1;
        const h = heuristic(nextPos, target);
        const f = g + h;

        const existingIdx = openSet.findIndex(n => n.pos.x === nextPos.x && n.pos.y === nextPos.y);
        
        if (existingIdx !== -1) {
          if (g < openSet[existingIdx].g) {
            openSet[existingIdx].g = g;
            openSet[existingIdx].f = f;
            openSet[existingIdx].path = [...current.path, nextPos];
          }
        } else {
          openSet.push({ pos: nextPos, path: [...current.path, nextPos], f, g });
        }
      }
    }
  }

  return null;
};

// Count reachable open spaces (limited depth BFS)
const countOpenSpace = (start: Point, snake: Point[]): number => {
  const queue = [start];
  const visited = new Set<string>();
  const obstacles = new Set(snake.map(p => `${p.x},${p.y}`));
  visited.add(`${start.x},${start.y}`);
  
  let count = 0;
  const LIMIT = 400; // Look ahead limit (full board)

  while(queue.length > 0 && count < LIMIT) {
    const curr = queue.shift()!;
    count++;

    for (const dir of DIRECTIONS_ARRAY) {
       const nextPos = { x: curr.x + dir.x, y: curr.y + dir.y };
       const key = `${nextPos.x},${nextPos.y}`;
       
       if (isValid(nextPos) && !obstacles.has(key) && !visited.has(key)) {
         visited.add(key);
         queue.push(nextPos);
       }
    }
  }
  return count;
};

// Get the best survival move
export const getSafeMove = (head: Point, snake: Point[]): Point | null => {
  const obstacles = new Set(snake.map(p => `${p.x},${p.y}`));
  let bestMove: Point | null = null;
  let maxSpace = -1;

  for (const dir of DIRECTIONS_ARRAY) {
    const nextPos = { x: head.x + dir.x, y: head.y + dir.y };
    const key = `${nextPos.x},${nextPos.y}`;

    if (isValid(nextPos) && !obstacles.has(key)) {
      const space = countOpenSpace(nextPos, snake);
      if (space > maxSpace) {
        maxSpace = space;
        bestMove = nextPos;
      }
    }
  }
  return bestMove;
};

export const getNextMove = (
  algorithm: 'BFS' | 'A_STAR',
  head: Point,
  food: Point,
  snake: Point[]
): Point | null => {
  let path: Point[] | null = null;

  if (algorithm === 'BFS') {
    path = getBFSPath(head, food, snake);
  } else {
    path = getAStarPath(head, food, snake);
  }

  if (path && path.length > 0) {
    return path[0];
  }
  
  // If no path to food, try to survive
  return getSafeMove(head, snake);
};
