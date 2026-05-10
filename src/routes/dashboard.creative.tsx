import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Image as ImageIcon, Send, Wand2, FlaskConical, Heart, MessageCircle, Bookmark, MoreHorizontal } from "lucide-react";
import { PageHeader, GlassCard, Pill } from "@/components/app/ui";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/creative")({
  component: Creative,
  head: () => ({ meta: [{ title: "Creative Engine — BrandSync AI" }] }),
});

function Creative() {
  const [type, setType] = useState("instagram");
  const [tone, setTone] = useState([60]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(true);

  const generate = () => {
    setGenerated(false);
    setLoading(true);
    setTimeout(() => { setLoading(false); setGenerated(true); }, 1400);
  };

  return (
    <div>
      <PageHeader eyebrow="Creative Engine" title="AI Creative Studio"
        subtitle="Multi-platform content production — from voiceovers to landing pages, all on-brand."
        actions={<Button onClick={generate} className="bg-gradient-to-r from-indigo-500 to-purple-600 glow-primary"><Sparkles className="h-4 w-4 mr-2" />Generate</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
        <GlassCard>
          <div className="text-sm font-medium mb-3">Parameters</div>
          <div className="space-y-4 text-sm">
            <div>
              <label className="text-xs text-muted-foreground">Output Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="mt-1 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram Post</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp Broadcast</SelectItem>
                  <SelectItem value="video">Video Ad Script</SelectItem>
                  <SelectItem value="voiceover">Voiceover</SelectItem>
                  <SelectItem value="landing">Landing Page</SelectItem>
                  <SelectItem value="blog">Blog Article</SelectItem>
                  <SelectItem value="email">Email Sequence</SelectItem>
                  <SelectItem value="product">Product Description</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Tone · {tone[0] < 33 ? "Professional" : tone[0] < 66 ? "Conversational" : "Viral"}</label>
              <Slider value={tone} onValueChange={setTone} max={100} step={1} className="mt-3" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1"><span>Professional</span><span>Viral</span></div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Audience</label>
              <Select defaultValue="hv">
                <SelectTrigger className="mt-1 bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hv">High-Value Customers</SelectItem>
                  <SelectItem value="cold">Cold (Awareness)</SelectItem>
                  <SelectItem value="cart">Abandoned Cart</SelectItem>
                  <SelectItem value="ll">Lookalike Audience</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Brief</label>
              <textarea className="mt-1 w-full h-28 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm" defaultValue="Promote our predictive simulation engine. Highlight 60% cost savings vs traditional MarTech stacks. Tease 14-day free trial."/>
            </div>
            <Button onClick={generate} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600">
              <Wand2 className="h-4 w-4 mr-2" /> Generate (✨)
            </Button>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <Tabs defaultValue="v1">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white/5 border border-white/10"><TabsTrigger value="v1">Variation 1</TabsTrigger><TabsTrigger value="v2">Variation 2</TabsTrigger><TabsTrigger value="v3">Variation 3</TabsTrigger></TabsList>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => toast.success("3 A/B variants ready to launch")}><FlaskConical className="h-4 w-4 mr-1" /> A/B Test</Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Sent to Campaign Automation")}><Send className="h-4 w-4 mr-1" /> Send to Campaigns</Button>
              </div>
            </div>

            <TabsContent value="v1" className="mt-4">
              {loading ? <Skeleton /> : generated && (type === "whatsapp" ? <WhatsAppMock /> : <InstagramMock />)}
            </TabsContent>
            <TabsContent value="v2" className="mt-4"><InstagramMock variant /></TabsContent>
            <TabsContent value="v3" className="mt-4"><InstagramMock /></TabsContent>
          </Tabs>

          <GlassCard>
            <div className="flex items-center gap-2 text-sm text-indigo-300"><Sparkles className="h-4 w-4" /> AI Critique</div>
            <ul className="mt-3 text-sm space-y-1.5 text-foreground/80">
              <li>· Hook strength: <span className="text-emerald-300">8.4/10</span> — strong scroll-stop</li>
              <li>· Brand voice match: <span className="text-emerald-300">96%</span></li>
              <li>· Predicted CTR: <span className="text-emerald-300">3.6%</span> (above benchmark 2.1%)</li>
              <li>· Suggestion: shorten line 2 by 7 words for mobile preview.</li>
            </ul>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="glass rounded-xl p-4 max-w-sm">
      <div className="h-72 bg-white/5 rounded relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
      <div className="mt-3 h-3 bg-white/10 rounded relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
      <div className="mt-2 h-3 w-2/3 bg-white/10 rounded relative overflow-hidden"><div className="shimmer absolute inset-0" /></div>
    </div>
  );
}

function InstagramMock({ variant = false }: { variant?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm rounded-2xl bg-[#0d1120] border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 p-3">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        <div className="text-sm font-medium">brandsync.ai</div>
        <MoreHorizontal className="ml-auto h-4 w-4 text-muted-foreground" />
      </div>
      <div className={`relative aspect-square ${variant ? "bg-gradient-to-br from-emerald-600 via-indigo-700 to-purple-700" : "bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600"}`}>
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="absolute inset-0 flex items-center justify-center text-center px-8">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-white/70 mb-2">stop juggling tools</div>
            <div className="text-3xl font-semibold leading-tight text-white">{variant ? "Run Marketing as One." : "One AI. Ten Channels.\nZero chaos."}</div>
            <div className="mt-3 inline-block rounded-full bg-white text-black text-xs font-medium px-3 py-1">Try BrandSync free →</div>
          </div>
        </div>
      </div>
      <div className="p-3 flex items-center gap-3 text-foreground/80"><Heart className="h-5 w-5" /><MessageCircle className="h-5 w-5" /><Send className="h-5 w-5" /><Bookmark className="ml-auto h-5 w-5" /></div>
      <div className="px-3 pb-3 text-sm">
        <div><span className="font-medium">brandsync.ai</span> The MarTech stack is broken. We rebuilt it as one OS — predictive, on-brand, auto-pilot. ✨</div>
        <div className="text-muted-foreground mt-1 text-xs">#martech #ai #marketing #brandsync</div>
      </div>
    </motion.div>
  );
}

function WhatsAppMock() {
  return (
    <div className="max-w-md rounded-xl bg-[#0c1418] border border-emerald-900/40 p-4 space-y-2">
      <div className="text-xs text-emerald-400 font-medium flex items-center gap-1"><ImageIcon className="h-3 w-3" /> BrandSync AI · Business</div>
      <div className="rounded-2xl rounded-tl-sm bg-emerald-900/30 px-3 py-2 text-sm max-w-[85%]">
        Hey Aarav 👋 Quick one — your team is still using 8 separate tools, right? We just built the OS that replaces them.
      </div>
      <div className="rounded-2xl rounded-tl-sm bg-emerald-900/30 px-3 py-2 text-sm max-w-[85%]">
        Want to see how Nimbus Realty could save <b>$1,840/mo</b> and 12 hrs/week? 14-day trial, no card.
      </div>
      <div className="flex gap-2"><div className="rounded-full border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1">Show me a demo</div><div className="rounded-full border border-emerald-500/40 text-emerald-300 text-xs px-3 py-1">Send pricing</div></div>
    </div>
  );
}
