"use client";

import { ExternalLink } from "lucide-react";
import { PersonaAvatar } from "@/components/chat/persona-avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { PersonaProfile } from "@/lib/personas/types";

interface PersonaCardProps {
  persona: PersonaProfile;
  active: boolean;
  onSelect: () => void;
}

export function PersonaCard({ persona, active, onSelect }: PersonaCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group relative w-full text-left transition-colors",
        "border-b border-border last:border-b-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        active ? "bg-muted/40" : "hover:bg-muted/20",
      )}
      aria-pressed={active}
      aria-label={`Switch to ${persona.name}`}
    >
      <div className="flex items-start gap-3 p-4">
        <PersonaAvatar persona={persona} size="md" active={active} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={cn(
                "truncate text-sm font-semibold",
                active ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {persona.name}
            </h3>
            {active ? (
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: persona.accentMuted,
                  color: persona.accent,
                }}
              >
                Live
              </span>
            ) : null}
          </div>

          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {persona.tagline}
          </p>

          <div className="flex flex-wrap gap-1">
            {persona.topics.slice(0, 3).map((topic) => (
              <Badge
                key={topic}
                variant="outline"
                className="border-border/60 px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
              >
                {topic}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div
        className={cn(
          "absolute bottom-0 left-0 top-0 w-0.5 transition-opacity",
          active ? "opacity-100" : "opacity-0",
        )}
        style={{ backgroundColor: persona.accent }}
      />
    </button>
  );
}

interface PersonaSidebarProps {
  personas: PersonaProfile[];
  activeId: string;
  onSelect: (id: PersonaProfile["id"]) => void;
}

export function PersonaSidebar({
  personas,
  activeId,
  onSelect,
}: PersonaSidebarProps) {
  return (
    <aside className="flex h-full flex-col bg-card/30">
      <div className="border-b border-border px-4 py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Mentor Channel
        </p>
        <h2 className="mt-1 font-display text-lg font-semibold tracking-tight">
          Pick your guide
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        {personas.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            active={persona.id === activeId}
            onSelect={() => onSelect(persona.id)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border p-4">
        {(() => {
          const active = personas.find((p) => p.id === activeId);
          return (
            <>
              {active?.website ? (
                <a
                  href={active.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  Official site
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
              {active?.github ? (
                <a
                  href={active.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  GitHub
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : null}
            </>
          );
        })()}
      </div>
    </aside>
  );
}
