export default function Footer() {
  return (
    <footer className="relative border-t border-white/8 px-5 py-12 md:px-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
        <div>
          <p className="font-display text-lg font-semibold text-star-100">
            The Essence of Life
            <span className="zh ml-2 text-sm text-star-500">生命的本质</span>
          </p>
          <p className="mono mt-1 text-[0.66rem] uppercase tracking-[0.25em] text-star-500">
            Life · Information · Entropy · Mind · Cosmos
          </p>
        </div>
        <div className="flex items-center gap-6 text-sm text-star-400">
          <a href="#top" className="transition-colors hover:text-star-100">
            Back to top
          </a>
          <a
            href="https://psyverse.fun"
            className="transition-colors hover:text-star-100"
          >
            Psyverse ↗
          </a>
        </div>
      </div>
      <p className="mx-auto mt-8 max-w-7xl text-center text-xs text-star-600 md:text-left">
        A cinematic meditation on what life is — part of the{" "}
        <a href="https://psyverse.fun" className="underline-offset-2 hover:underline">
          Psyverse
        </a>{" "}
        by Gewenbo. Scientifically inspired, philosophically open. © {new Date().getFullYear()}
      </p>
    </footer>
  );
}
