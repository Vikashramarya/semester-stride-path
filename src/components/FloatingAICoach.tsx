import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Zap, Brain, FileQuestion, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FloatingAICoachProps {
  suggestion?: string;
  onNavigate?: (path: string) => void;
}

const quickActions = [
  { label: "Generate Important Q's", icon: Sparkles, path: "/important-questions" },
  { label: "Start Revision", icon: Zap, path: "/revision" },
  { label: "Take a Test", icon: Brain, path: "/test-series" },
  { label: "Practice PYQs", icon: FileQuestion, path: "/pyq" },
];

export function FloatingAICoach({ suggestion, onNavigate }: FloatingAICoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowPulse(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50" ref={panelRef}>
      {/* Expanded Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 glass-strong rounded-2xl shadow-2xl overflow-hidden animate-slide-in-bottom">
          <div className="sankalp-gradient p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Bot className="h-5 w-5" />
              <span className="font-display font-semibold text-sm">AI Study Coach</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="p-4 space-y-3">
            {/* AI Suggestion */}
            {suggestion && (
              <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
                <p className="text-xs font-medium text-primary mb-1 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI Insight
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">{suggestion}</p>
              </div>
            )}

            {/* Quick Actions */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Quick Actions</p>
              {quickActions.map((action) => (
                <button
                  key={action.path}
                  onClick={() => {
                    onNavigate?.(action.path);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all duration-200 group text-left"
                >
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xs font-medium group-hover:text-primary transition-colors">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Chat CTA */}
            <button
              onClick={() => {
                onNavigate?.("/chatbot");
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl sankalp-gradient text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              <Send className="h-3.5 w-3.5" />
              Open Full Chat
            </button>
          </div>
        </div>
      )}

      {/* FAB Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); setShowPulse(false); }}
        className={cn(
          "h-14 w-14 rounded-2xl sankalp-gradient flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95",
          isOpen && "rotate-0",
          showPulse && "animate-pulse-glow"
        )}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-primary-foreground transition-transform" />
        ) : (
          <Bot className="h-6 w-6 text-primary-foreground transition-transform" />
        )}
      </button>

      {/* Notification dot */}
      {!isOpen && suggestion && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-sankalp-amber border-2 border-background animate-scale-bounce" />
      )}
    </div>
  );
}
