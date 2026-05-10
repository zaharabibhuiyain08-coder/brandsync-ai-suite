import { Bell, Search, Sparkles, ChevronDown, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = [
  "Generate Q4 brand campaign brief",
  "Analyze competitor sentiment vs us",
  "Pause underperforming TikTok ads",
  "Draft 5 IG captions in viral tone",
  "Predict ROI for $20k Meta launch",
  "Find micro-influencers in EdTech",
];

export function Topbar() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState(true);

  return (
    <>
      <header className="sticky top-0 z-20 h-16 border-b border-white/5 bg-[#0a0d16]/70 backdrop-blur-xl">
        <div className="flex h-full items-center justify-between px-6 gap-4">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                onFocus={() => setOpen(true)}
                placeholder="Search campaigns, leads, creatives, insights…"
                className="w-full h-10 rounded-lg bg-white/5 border border-white/10 pl-10 pr-20 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:border-indigo-400/50"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-white/5 border border-white/10 px-1.5 py-0.5 rounded">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="group relative inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 px-3.5 h-10 text-sm font-medium text-white glow-primary hover:scale-[1.02] transition"
            >
              <Sparkles className="h-4 w-4" />
              Magic Action
            </button>

            <button onClick={() => setNotifs(false)} className="relative h-10 w-10 grid place-items-center rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
              <Bell className="h-4 w-4" />
              {notifs && <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-rose-500 animate-pulse" />}
            </button>

            <div className="flex items-center gap-2 pl-2 ml-1 border-l border-white/10">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center text-xs font-semibold">AK</div>
              <div className="hidden md:block leading-tight">
                <div className="text-xs font-medium">Aisha K.</div>
                <div className="text-[10px] text-muted-foreground">CMO · Acme Co</div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {notifs && (
            <motion.div
              initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
              className="px-6 -mt-px"
            >
              <div className="flex items-center gap-3 rounded-b-lg border border-rose-500/30 bg-rose-500/10 px-4 py-2 text-xs">
                <AlertTriangle className="h-4 w-4 text-rose-400 animate-pulse" />
                <span className="text-rose-200">Crisis radar:</span>
                <span className="text-foreground/80">Negative mention spike (+412%) for keyword "shipping delay" in last 30 min.</span>
                <button onClick={() => setNotifs(false)} className="ml-auto text-muted-foreground hover:text-white">dismiss</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-[#0d1120]/95 border-white/10 max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-indigo-400" /> AI Command Palette
            </DialogTitle>
          </DialogHeader>
          <Input placeholder="Ask BrandSync to do anything…" className="bg-white/5 border-white/10" />
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Suggestions</div>
          <div className="space-y-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-left text-foreground/80 hover:bg-white/5 hover:text-white">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" /> {s}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
