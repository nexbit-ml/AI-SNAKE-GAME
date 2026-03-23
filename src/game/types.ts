export type Point = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Algorithm = 'BFS' | 'DFS' | 'A_STAR' | 'HAMILTONIAN' | 'MANUAL';
