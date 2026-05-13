import { createServerFn } from "@tanstack/react-start";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";
import { generateText, Output } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  brandName: z.string().min(1).max(120),
  industry: z.string().min(1).max(80),
  websiteUrl: z.string().max(255).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  mode: z.enum(["existing", "new"]).default("new"),
});

export const GuidelineSchema = z.object({
  tagline: z.string(),
  brandStory: z.string(),
  mission: z.string(),
  vision: z.string(),
  currentPosition: z.string().describe("Honest assessment of where the brand stands today"),
  recommendedDirection: z.string().describe("What the brand SHOULD become — strategic guidance"),
  brandPersonality: z.array(z.string()).min(3).max(6),
  brandVoice: z.object({
    tone: z.string(),
    do: z.array(z.string()).min(3).max(6),
    dont: z.array(z.string()).min(3).max(6),
  }),
  targetAudience: z.array(z.object({
    segment: z.string(),
    description: z.string(),
  })).min(2).max(4),
  colorPalette: z.array(z.object({
    name: z.string(),
    hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    usage: z.string(),
  })).min(4).max(6),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
    rationale: z.string(),
  }),
  logoUsage: z.array(z.string()).min(3).max(5),
  visualStyle: z.string(),
  messagingPillars: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).min(3).max(4),
  improvements: z.array(z.string()).min(3).max(6).describe("Concrete next-step improvements"),
});

export type Guideline = z.infer<typeof GuidelineSchema>;

export const generateBrandGuideline = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY is missing");

    const gateway = createLovableAiGatewayProvider(key);
    const model = gateway("google/gemini-3-flash-preview");

    const prompt = `You are a senior brand strategist. Build a complete, professional brand guideline for the following company.

Company: ${data.brandName}
Industry: ${data.industry}
Website: ${data.websiteUrl || "N/A"}
Mode: ${data.mode === "existing" ? "Refining an EXISTING brand" : "Building a NEW brand from scratch"}
Notes: ${data.description || "None provided"}

Requirements:
- "currentPosition" must honestly describe where the brand likely stands today (assumptions OK).
- "recommendedDirection" must explain what the brand SHOULD evolve into and WHY.
- Color palette: 4-6 real hex codes that fit the industry and personality. No generic blue defaults.
- Typography: pick distinctive font pairings (avoid Inter/Poppins).
- Improvements: concrete, actionable next steps an SME owner can execute.

Return strict JSON matching the provided schema.`;

    try {
      const { experimental_output: output } = await generateText({
        model,
        prompt,
        experimental_output: Output.object({ schema: GuidelineSchema }),
      });
      return { guideline: output, error: null };
    } catch (e) {
      console.error("generateBrandGuideline failed:", e);
      const msg = e instanceof Error ? e.message : "Generation failed";
      return { guideline: null, error: msg };
    }
  });
