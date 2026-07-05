import { ChatStudio } from "@/components/chat/chat-studio";

export default function Home() {
  return (
    <div className="relative flex h-dvh flex-col overflow-hidden">
      <div className="studio-grid pointer-events-none absolute inset-0 opacity-30" />

      <div className="relative z-10 flex h-full w-full flex-col px-4 sm:px-6 lg:px-8">
        <div className="flex h-full min-h-0 flex-col border-x border-border">
          <header className="flex shrink-0 items-center justify-between border-b border-border px-3 py-3 sm:px-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                GenAI Persona Lab
              </p>
              <h1 className="font-display text-lg font-bold tracking-tight sm:text-xl">
                Mentor Studio
              </h1>
            </div>
            <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-[#f59e0b]" />
                Hitesh
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-[#06b6d4]" />
                Piyush
              </span>
            </div>
          </header>

          <ChatStudio />
        </div>
      </div>
    </div>
  );
}
