import { describe, it, expect, beforeEach } from 'vitest';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINOES,
  createEmptyBoard,
  getRandomTetromino,
  rotateTetromino,
  checkCollision,
  mergeTetromino,
  clearLines,
  calculateScore,
  calculateLevel,
  getDropSpeed,
  Cell,
  Tetromino,
} from '@/lib/tetris';

describe('Tetris Game Logic', () => {
  let emptyBoard: Cell[][];

  beforeEach(() => {
    emptyBoard = createEmptyBoard();
  });

  describe('Board Creation', () => {
    it('should create an empty board with correct dimensions', () => {
      const board = createEmptyBoard();
      expect(board.length).toBe(BOARD_HEIGHT);
      expect(board[0].length).toBe(BOARD_WIDTH);
    });

    it('should create all cells as empty and unfilled', () => {
      const board = createEmptyBoard();
      board.forEach(row => {
        row.forEach(cell => {
          expect(cell.filled).toBe(false);
          expect(cell.color).toBe('');
        });
      });
    });
  });

  describe('Tetromino Creation', () => {
    it('should generate a valid tetromino', () => {
      const tetromino = getRandomTetromino();
      expect(tetromino.type).toBeDefined();
      expect(['I', 'O', 'T', 'S', 'Z', 'J', 'L']).toContain(tetromino.type);
      expect(tetromino.shape).toBeDefined();
      expect(tetromino.color).toBeDefined();
      expect(tetromino.position).toBeDefined();
    });

    it('should position tetromino at the top center of the board', () => {
      const tetromino = getRandomTetromino();
      expect(tetromino.position.y).toBe(0);
      expect(tetromino.position.x).toBeGreaterThanOrEqual(0);
      expect(tetromino.position.x).toBeLessThan(BOARD_WIDTH);
    });

    it('should have correct shape for each tetromino type', () => {
      const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;
      types.forEach(type => {
        const tetromino = TETROMINOES[type];
        expect(tetromino.shape).toBeDefined();
        expect(tetromino.color).toBeDefined();
        expect(tetromino.shape.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Tetromino Rotation', () => {
    it('should rotate a tetromino shape', () => {
      const tetromino = getRandomTetromino();
      const originalShape = tetromino.shape.map(row => [...row]);
      const rotated = rotateTetromino(tetromino);
      
      expect(rotated).toBeDefined();
      expect(rotated.length).toBe(originalShape.length);
    });

    it('should rotate square tetromino without visible change', () => {
      const tetromino: Tetromino = {
        type: 'O',
        shape: TETROMINOES.O.shape.map(row => [...row]),
        color: TETROMINOES.O.color,
        position: { x: 4, y: 0 },
      };
      
      const rotated = rotateTetromino(tetromino);
      expect(JSON.stringify(rotated)).toBe(JSON.stringify(tetromino.shape));
    });
  });

  describe('Collision Detection', () => {
    it('should detect collision with left wall', () => {
      const tetromino: Tetromino = {
        type: 'I',
        shape: TETROMINOES.I.shape.map(row => [...row]),
        color: TETROMINOES.I.color,
        position: { x: 0, y: 0 },
      };
      
      const hasCollision = checkCollision(emptyBoard, tetromino, -1, 0);
      expect(hasCollision).toBe(true);
    });

    it('should detect collision with right wall', () => {
      const tetromino: Tetromino = {
        type: 'I',
        shape: TETROMINOES.I.shape.map(row => [...row]),
        color: TETROMINOES.I.color,
        position: { x: BOARD_WIDTH - 1, y: 0 },
      };
      
      const hasCollision = checkCollision(emptyBoard, tetromino, 1, 0);
      expect(hasCollision).toBe(true);
    });

    it('should detect collision with bottom wall', () => {
      const tetromino: Tetromino = {
        type: 'I',
        shape: TETROMINOES.I.shape.map(row => [...row]),
        color: TETROMINOES.I.color,
        position: { x: 3, y: BOARD_HEIGHT - 1 },
      };
      
      const hasCollision = checkCollision(emptyBoard, tetromino, 0, 1);
      expect(hasCollision).toBe(true);
    });

    it('should detect collision with placed pieces', () => {
      const board = createEmptyBoard();
      board[19][5] = { filled: true, color: 'red' };
      
      const tetromino: Tetromino = {
        type: 'O',
        shape: TETROMINOES.O.shape.map(row => [...row]),
        color: TETROMINOES.O.color,
        position: { x: 4, y: 18 },
      };
      
      const hasCollision = checkCollision(board, tetromino, 0, 1);
      expect(hasCollision).toBe(true);
    });

    it('should not detect collision in empty space', () => {
      const tetromino: Tetromino = {
        type: 'O',
        shape: TETROMINOES.O.shape.map(row => [...row]),
        color: TETROMINOES.O.color,
        position: { x: 3, y: 5 },
      };
      
      const hasCollision = checkCollision(emptyBoard, tetromino, 1, 1);
      expect(hasCollision).toBe(false);
    });
  });

  describe('Merge Tetromino', () => {
    it('should merge tetromino into the board', () => {
      const tetromino: Tetromino = {
        type: 'O',
        shape: TETROMINOES.O.shape.map(row => [...row]),
        color: TETROMINOES.O.color,
        position: { x: 5, y: 10 },
      };
      
      const newBoard = mergeTetromino(emptyBoard, tetromino);
      expect(newBoard[10][5].filled).toBe(true);
      expect(newBoard[10][6].filled).toBe(true);
      expect(newBoard[11][5].filled).toBe(true);
      expect(newBoard[11][6].filled).toBe(true);
    });

    it('should not modify the original board', () => {
      const tetromino: Tetromino = {
        type: 'O',
        shape: TETROMINOES.O.shape.map(row => [...row]),
        color: TETROMINOES.O.color,
        position: { x: 5, y: 10 },
      };
      
      const originalBoard = emptyBoard.map(row => [...row]);
      mergeTetromino(emptyBoard, tetromino);
      
      expect(JSON.stringify(emptyBoard)).toBe(JSON.stringify(originalBoard));
    });

  });

  describe('Clear Lines', () => {
    it('should clear a full line', () => {
      const board = createEmptyBoard();
      // Fill bottom line completely
      for (let i = 0; i < BOARD_WIDTH; i++) {
        board[BOARD_HEIGHT - 1][i] = { filled: true, color: 'red' };
      }
      
      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(1);
      expect(newBoard.length).toBe(BOARD_HEIGHT);
      expect(newBoard[BOARD_HEIGHT - 1].every(cell => !cell.filled)).toBe(true);
    });

    it('should clear multiple full lines', () => {
      const board = createEmptyBoard();
      // Fill last two lines completely
      for (let row = BOARD_HEIGHT - 2; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
          board[row][col] = { filled: true, color: 'red' };
        }
      }
      
      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(2);
      expect(newBoard.length).toBe(BOARD_HEIGHT);
    });

    it('should not clear partial lines', () => {
      const board = createEmptyBoard();
      // Fill most of the last line but leave one empty
      for (let i = 0; i < BOARD_WIDTH - 1; i++) {
        board[BOARD_HEIGHT - 1][i] = { filled: true, color: 'red' };
      }
      
      const { newBoard, linesCleared } = clearLines(board);
      expect(linesCleared).toBe(0);
      expect(newBoard[BOARD_HEIGHT - 1][BOARD_WIDTH - 1].filled).toBe(false);
    });

    it('should maintain board height after clearing', () => {
      const board = createEmptyBoard();
      for (let i = 0; i < BOARD_WIDTH; i++) {
        board[BOARD_HEIGHT - 1][i] = { filled: true, color: 'red' };
      }
      
      const { newBoard } = clearLines(board);
      expect(newBoard.length).toBe(BOARD_HEIGHT);
    });
  });

  describe('Scoring', () => {
    it('should calculate correct score for single line', () => {
      const score = calculateScore(1, 1);
      expect(score).toBe(100);
    });

    it('should calculate correct score for multiple lines', () => {
      expect(calculateScore(1, 1)).toBe(100);
      expect(calculateScore(2, 1)).toBe(300);
      expect(calculateScore(3, 1)).toBe(500);
      expect(calculateScore(4, 1)).toBe(800);
    });

    it('should apply level multiplier to score', () => {
      const scoreLevel1 = calculateScore(1, 1);
      const scoreLevel2 = calculateScore(1, 2);
      expect(scoreLevel2).toBe(scoreLevel1 * 2);
    });

    it('should return 0 for no lines cleared', () => {
      const score = calculateScore(0, 1);
      expect(score).toBe(0);
    });
  });

  describe('Level Calculation', () => {
    it('should start at level 1 with 0-9 lines', () => {
      for (let i = 0; i < 10; i++) {
        expect(calculateLevel(i)).toBe(1);
      }
    });

    it('should increase level every 10 lines', () => {
      expect(calculateLevel(10)).toBe(2);
      expect(calculateLevel(20)).toBe(3);
      expect(calculateLevel(30)).toBe(4);
    });

    it('should handle high line counts', () => {
      const level = calculateLevel(100);
      expect(level).toBe(11);
    });
  });

  describe('Drop Speed', () => {
    it('should return valid drop speed', () => {
      const speed = getDropSpeed(1);
      expect(speed).toBeGreaterThan(0);
      expect(speed).toBeLessThanOrEqual(1000);
    });

    it('should increase speed with level', () => {
      const speed1 = getDropSpeed(1);
      const speed2 = getDropSpeed(2);
      expect(speed2).toBeLessThan(speed1);
    });

    it('should maintain minimum drop speed', () => {
      const highLevel = getDropSpeed(100);
      expect(highLevel).toBeGreaterThanOrEqual(100);
    });

    it('should decrease by 100ms per level', () => {
      const speed1 = getDropSpeed(1);
      const speed2 = getDropSpeed(2);
      expect(speed1 - speed2).toBe(100);
    });
  });

  describe('Constants', () => {
    it('should have correct board dimensions', () => {
      expect(BOARD_WIDTH).toBe(10);
      expect(BOARD_HEIGHT).toBe(20);
    });
  });
});
