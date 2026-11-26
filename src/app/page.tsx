import SnakeCanvas from "@/components/SnakeCanvas";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center bg-gradient-to-b from-neutral-950 via-neutral-100/10 to-neutral-950">
      <h1 className="text-3xl font-semibold tracking-title text-neutral-100">
        🐍 Snake Game
      </h1>
      <p className="text-neutral-400/70">
        Use Arrow Keys to move. Eat the pink food to grow!
      </p>
      <SnakeCanvas />
      { /* Score display will be added via Canvas visuals */ }
    </main>
  );
}