"use client";

import { useEffect, useRef, useState } from "react";

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

interface SnakeSegment {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 30;
const INITIAL_SPEED = 150; // ms between moves

export default function SnakeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [snake, setSnake] = useState<SnakeSegment[]>([
    { x: 10, y: 10 },
    { x: 9, y: 10 },
    { x: 8, y: 10 },
  ]);
  const [food, setFood] = useState<SnakeSegment>({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(INITIAL_SPEED);

  // Initialize canvas size and draw on mount/resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = GRID_SIZE * CELL_SIZE;
      canvas.height = GRID_SIZE * CELL_SIZE;
    }
  }, []); // Empty deps - runs once on mount

  useEffect(() => {
    // Keyboard controls
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      switch (key) {
        case "ArrowUp":
          if (direction !== "DOWN") setDirection("UP");
          break;
        case "ArrowDown":
          if (direction !== "UP") setDirection("DOWN");
          break;
        case "ArrowLeft":
          if (direction !== "RIGHT") setDirection("LEFT");
          break;
        case "ArrowRight":
          if (direction !== "LEFT") setDirection("RIGHT");
          break;
        case " ":
          // Space to restart if game over
          if (gameOver) {
            setSnake([{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
            setDirection("RIGHT");
            setFood({ x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) });
            setScore(0);
            setGameOver(false);
            setSpeed(INITIAL_SPEED);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [direction, gameOver]);

  useEffect(() => {
    // Game loop
    if (gameOver) return;

    let timeoutId: NodeJS.Timeout;

    const moveSnake = () => {
      const head = snake[0];
      let newHead: SnakeSegment;

      // Calculate new head position based on direction
      switch (direction) {
        case "UP":
          newHead = { x: head.x, y: head.y - 1 };
          break;
        case "DOWN":
          newHead = { x: head.x, y: head.y + 1 };
          break;
        case "LEFT":
          newHead = { x: head.x - 1, y: head.y };
          break;
        case "RIGHT":
          newHead = { x: head.x + 1, y: head.y };
          break;
      }

      // Check wall collision (wrap around)
      let wrappedX = newHead.x;
      let wrappedY = newHead.y;
      if (wrappedX < 0) wrappedX = GRID_SIZE - 1;
      if (wrappedX >= GRID_SIZE) wrappedX = 0;
      if (wrappedY < 0) wrappedY = GRID_SIZE - 1;
      if (wrappedY >= GRID_SIZE) wrappedY = 0;
      newHead = { x: wrappedX, y: wrappedY };

      // Check self-collision
      const hitSelf = snake.slice(1).some(segment => segment.x === newHead.x && segment.y === newHead.y);
      if (hitSelf) {
        setGameOver(true);
        return;
      }

      // Check food collision
      const ateFood = newHead.x === food.x && newHead.y === food.y;
      if (ateFood) {
        setScore(prev => prev + 1);
        // Generate new food
        let newFood: SnakeSegment;
        do {
          newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
        } while (snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        setFood(newFood);
        // Increase speed slightly and grow snake
        const newSpeed = Math.max(20, speed - 5);
        setSpeed(newSpeed);
        // Don't remove tail - snake grows
        setSnake(prev => [newHead, ...prev]);
      } else {
        // Move snake normally (remove tail, add new head)
        setSnake(prev => [newHead, ...prev.slice(0, -1)]);
      }
    };

    timeoutId = setTimeout(() => {
      moveSnake();
      // Recursive game loop
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, speed);

    return () => clearTimeout(timeoutId);
  }, [direction, speed, gameOver, snake, food]);

  // Draw the game - called from canvas init and on state changes
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.fillStyle = "#0a0a0c";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = "#1f2937";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, canvas.height);
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(canvas.width, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = "#a855f7";
    ctx.beginPath();
    const foodX = food.x * CELL_SIZE + CELL_SIZE / 2;
    const foodY = food.y * CELL_SIZE + CELL_SIZE / 2;
    const radius = CELL_SIZE / 3;
    ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw snake
    ctx.fillStyle = "#ef4444";
    snake.forEach((segment, index) => {
      const x = segment.x * CELL_SIZE;
      const y = segment.y * CELL_SIZE;
      if (index === 0) {
        // Head with slightly different color
        ctx.fillStyle = "#ef4444";
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 6);
        ctx.fill();
        // Eyes
        ctx.fillStyle = "#0a0a0c";
        const eyeSize = 4;
        if (direction === "UP") {
          ctx.fillRect(x + CELL_SIZE / 3 + 2, y + 2, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE * 2 / 3 + 2, y + 2, eyeSize, eyeSize);
        } else if (direction === "DOWN") {
          ctx.fillRect(x + CELL_SIZE / 3 + 2, y + CELL_SIZE - eyeSize - 4, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE * 2 / 3 + 2, y + CELL_SIZE - eyeSize - 4, eyeSize, eyeSize);
        } else if (direction === "LEFT") {
          ctx.fillRect(x + 2, y + CELL_SIZE / 3 + 2, eyeSize, eyeSize);
          ctx.fillRect(x + 2, y + CELL_SIZE * 2 / 3 + 2, eyeSize, eyeSize);
        } else if (direction === "RIGHT") {
          ctx.fillRect(x + CELL_SIZE - eyeSize - 4, y + CELL_SIZE / 3 + 2, eyeSize, eyeSize);
          ctx.fillRect(x + CELL_SIZE - eyeSize - 4, y + CELL_SIZE * 2 / 3 + 2, eyeSize, eyeSize);
        }
      } else {
        ctx.beginPath();
        ctx.roundRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4, 4);
        ctx.fill();
      }
    });
  }, [snake, food, direction]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-border/40 rounded-md bg-background/80 backdrop-blur-md"
    />
  );
}