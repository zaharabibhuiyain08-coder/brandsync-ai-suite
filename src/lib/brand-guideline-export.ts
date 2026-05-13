import jsPDF from "jspdf";
import pptxgen from "pptxgenjs";
import type { Guideline } from "./brand-guideline.functions";

const safe = (s: string | undefined) => (s ?? "").trim();

export async function exportGuidelinePDF(brandName: string, g: Guideline) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensureSpace = (h: number) => {
    if (y + h > H - M) {
      doc.addPage();
      y = M;
    }
  };

  const heading = (text: string, size = 18) => {
    ensureSpace(size + 14);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(30, 27, 75);
    doc.text(text, M, y);
    y += size + 6;
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1.5);
    doc.line(M, y, M + 60, y);
    y += 14;
    doc.setTextColor(40);
  };

  const para = (text: string, size = 11) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(safe(text), W - M * 2);
    ensureSpace(lines.length * (size + 4));
    doc.text(lines, M, y);
    y += lines.length * (size + 4) + 8;
  };

  const bullets = (items: string[], size = 11) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    items.forEach((it) => {
      const lines = doc.splitTextToSize("•  " + safe(it), W - M * 2 - 14);
      ensureSpace(lines.length * (size + 4));
      doc.text(lines, M + 6, y);
      y += lines.length * (size + 4) + 4;
    });
    y += 6;
  };

  // Cover
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, W, H, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(brandName, M, H / 2 - 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(16);
  doc.setTextColor(165, 180, 252);
  doc.text("Brand Guidelines", M, H / 2);
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184);
  doc.text(`Version 1.0 · ${new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}`, M, H / 2 + 22);
  doc.text(safe(g.tagline), M, H - M);

  // Reset for content
  doc.addPage();
  y = M;

  heading("01. Brand Story");
  para(g.brandStory);

  heading("02. Mission & Vision");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Mission", M, y); y += 14;
  para(g.mission);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Vision", M, y); y += 14;
  para(g.vision);

  heading("03. Current Position vs. Recommended Direction");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Where you are today", M, y); y += 14;
  para(g.currentPosition);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Where you should go", M, y); y += 14;
  para(g.recommendedDirection);

  heading("04. Brand Personality");
  bullets(g.brandPersonality);

  heading("05. Brand Voice");
  para(`Tone: ${g.brandVoice.tone}`);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Do", M, y); y += 14;
  bullets(g.brandVoice.do);
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text("Don't", M, y); y += 14;
  bullets(g.brandVoice.dont);

  heading("06. Target Audience");
  g.targetAudience.forEach((a) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(a.segment, M, y); y += 14;
    para(a.description);
  });

  heading("07. Color Palette");
  const swatchSize = 60;
  let cx = M;
  ensureSpace(swatchSize + 40);
  g.colorPalette.forEach((c) => {
    if (cx + swatchSize > W - M) { cx = M; y += swatchSize + 40; ensureSpace(swatchSize + 40); }
    const rgb = hexToRgb(c.hex);
    doc.setFillColor(rgb.r, rgb.g, rgb.b);
    doc.roundedRect(cx, y, swatchSize, swatchSize, 6, 6, "F");
    doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(40);
    doc.text(c.name, cx, y + swatchSize + 12);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(100);
    doc.text(c.hex, cx, y + swatchSize + 24);
    cx += swatchSize + 18;
  });
  y += swatchSize + 40;

  heading("08. Typography");
  doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(`Heading: ${g.typography.headingFont}`, M, y); y += 16;
  doc.text(`Body: ${g.typography.bodyFont}`, M, y); y += 16;
  doc.setFont("helvetica", "normal");
  para(g.typography.rationale);

  heading("09. Logo Usage");
  bullets(g.logoUsage);

  heading("10. Visual Style");
  para(g.visualStyle);

  heading("11. Messaging Pillars");
  g.messagingPillars.forEach((p) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(p.title, M, y); y += 14;
    para(p.description);
  });

  heading("12. Improvement Roadmap");
  bullets(g.improvements);

  doc.save(`${brandName.replace(/[^a-z0-9]+/gi, "-")}-brand-guidelines.pdf`);
}

export async function exportGuidelinePPT(brandName: string, g: Guideline) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";
  pres.title = `${brandName} — Brand Guidelines`;

  const NAVY = "0F172A";
  const INDIGO = "6366F1";
  const SLATE = "475569";
  const LIGHT = "F8FAFC";

  // Cover
  let s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText(brandName, { x: 0.6, y: 2.6, w: 12, h: 1.2, fontSize: 54, bold: true, color: "FFFFFF", fontFace: "Calibri" });
  s.addText("Brand Guidelines", { x: 0.6, y: 3.9, w: 12, h: 0.6, fontSize: 24, color: "A5B4FC", fontFace: "Calibri" });
  s.addText(`Version 1.0 · ${new Date().toLocaleDateString(undefined, { month: "long", year: "numeric" })}`, { x: 0.6, y: 4.5, w: 12, h: 0.4, fontSize: 14, color: "94A3B8" });
  s.addText(g.tagline, { x: 0.6, y: 6.5, w: 12, h: 0.5, fontSize: 16, italic: true, color: "CBD5E1" });

  const titleSlide = (title: string) => {
    const sl = pres.addSlide();
    sl.background = { color: LIGHT };
    sl.addText(title, { x: 0.6, y: 0.4, w: 12, h: 0.7, fontSize: 28, bold: true, color: NAVY, fontFace: "Calibri" });
    sl.addShape(pres.ShapeType.rect, { x: 0.6, y: 1.15, w: 1.0, h: 0.06, fill: { color: INDIGO } });
    return sl;
  };

  let sl = titleSlide("Brand Story");
  sl.addText(g.brandStory, { x: 0.6, y: 1.5, w: 12, h: 5.5, fontSize: 16, color: SLATE, valign: "top" });

  sl = titleSlide("Mission & Vision");
  sl.addText("Mission", { x: 0.6, y: 1.5, w: 5.8, h: 0.5, fontSize: 16, bold: true, color: INDIGO });
  sl.addText(g.mission, { x: 0.6, y: 2.0, w: 5.8, h: 4.5, fontSize: 14, color: SLATE, valign: "top" });
  sl.addText("Vision", { x: 6.8, y: 1.5, w: 5.8, h: 0.5, fontSize: 16, bold: true, color: INDIGO });
  sl.addText(g.vision, { x: 6.8, y: 2.0, w: 5.8, h: 4.5, fontSize: 14, color: SLATE, valign: "top" });

  sl = titleSlide("Current Position → Recommended Direction");
  sl.addShape(pres.ShapeType.roundRect, { x: 0.6, y: 1.5, w: 5.8, h: 5.4, fill: { color: "FEE2E2" }, line: { color: "FCA5A5" }, rectRadius: 0.1 });
  sl.addText("Where you are today", { x: 0.8, y: 1.7, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: "B91C1C" });
  sl.addText(g.currentPosition, { x: 0.8, y: 2.2, w: 5.4, h: 4.5, fontSize: 13, color: "1F2937", valign: "top" });
  sl.addShape(pres.ShapeType.roundRect, { x: 6.8, y: 1.5, w: 5.8, h: 5.4, fill: { color: "DCFCE7" }, line: { color: "86EFAC" }, rectRadius: 0.1 });
  sl.addText("Where you should go", { x: 7.0, y: 1.7, w: 5.4, h: 0.4, fontSize: 14, bold: true, color: "15803D" });
  sl.addText(g.recommendedDirection, { x: 7.0, y: 2.2, w: 5.4, h: 4.5, fontSize: 13, color: "1F2937", valign: "top" });

  sl = titleSlide("Brand Personality");
  g.brandPersonality.forEach((trait, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    sl.addShape(pres.ShapeType.roundRect, { x: 0.6 + col * 4.1, y: 1.6 + row * 1.6, w: 3.9, h: 1.4, fill: { color: INDIGO }, rectRadius: 0.1 });
    sl.addText(trait, { x: 0.6 + col * 4.1, y: 1.6 + row * 1.6, w: 3.9, h: 1.4, fontSize: 18, bold: true, color: "FFFFFF", align: "center", valign: "middle" });
  });

  sl = titleSlide("Brand Voice");
  sl.addText(`Tone: ${g.brandVoice.tone}`, { x: 0.6, y: 1.5, w: 12, h: 0.5, fontSize: 16, italic: true, color: SLATE });
  sl.addText("Do", { x: 0.6, y: 2.2, w: 5.8, h: 0.4, fontSize: 14, bold: true, color: "15803D" });
  sl.addText(g.brandVoice.do.map((t) => ({ text: t, options: { bullet: true } })), { x: 0.6, y: 2.7, w: 5.8, h: 4.0, fontSize: 13, color: SLATE, valign: "top" });
  sl.addText("Don't", { x: 6.8, y: 2.2, w: 5.8, h: 0.4, fontSize: 14, bold: true, color: "B91C1C" });
  sl.addText(g.brandVoice.dont.map((t) => ({ text: t, options: { bullet: true } })), { x: 6.8, y: 2.7, w: 5.8, h: 4.0, fontSize: 13, color: SLATE, valign: "top" });

  sl = titleSlide("Color Palette");
  g.colorPalette.forEach((c, i) => {
    const x = 0.6 + i * 2.0;
    sl.addShape(pres.ShapeType.roundRect, { x, y: 1.7, w: 1.8, h: 2.4, fill: { color: c.hex.replace("#", "") }, line: { color: "E5E7EB" }, rectRadius: 0.06 });
    sl.addText(c.name, { x, y: 4.2, w: 1.8, h: 0.4, fontSize: 12, bold: true, color: NAVY, align: "center" });
    sl.addText(c.hex, { x, y: 4.6, w: 1.8, h: 0.3, fontSize: 10, color: SLATE, align: "center" });
    sl.addText(c.usage, { x, y: 4.95, w: 1.8, h: 1.2, fontSize: 9, color: SLATE, align: "center", valign: "top" });
  });

  sl = titleSlide("Typography");
  sl.addText(`Headings · ${g.typography.headingFont}`, { x: 0.6, y: 1.6, w: 12, h: 0.6, fontSize: 14, color: SLATE });
  sl.addText("Aa", { x: 0.6, y: 2.2, w: 6, h: 2.2, fontSize: 120, bold: true, color: NAVY, fontFace: g.typography.headingFont });
  sl.addText(`Body · ${g.typography.bodyFont}`, { x: 6.8, y: 1.6, w: 6, h: 0.6, fontSize: 14, color: SLATE });
  sl.addText("Aa", { x: 6.8, y: 2.2, w: 6, h: 2.2, fontSize: 120, color: NAVY, fontFace: g.typography.bodyFont });
  sl.addText(g.typography.rationale, { x: 0.6, y: 5.0, w: 12, h: 1.5, fontSize: 13, color: SLATE, italic: true, valign: "top" });

  sl = titleSlide("Messaging Pillars");
  g.messagingPillars.forEach((p, i) => {
    const x = 0.6 + i * (12 / g.messagingPillars.length);
    const w = (12 / g.messagingPillars.length) - 0.2;
    sl.addShape(pres.ShapeType.roundRect, { x, y: 1.6, w, h: 5.2, fill: { color: "FFFFFF" }, line: { color: "E2E8F0" }, rectRadius: 0.08 });
    sl.addShape(pres.ShapeType.rect, { x, y: 1.6, w, h: 0.12, fill: { color: INDIGO } });
    sl.addText(p.title, { x: x + 0.2, y: 1.9, w: w - 0.4, h: 0.7, fontSize: 16, bold: true, color: NAVY });
    sl.addText(p.description, { x: x + 0.2, y: 2.6, w: w - 0.4, h: 4.0, fontSize: 12, color: SLATE, valign: "top" });
  });

  sl = titleSlide("Improvement Roadmap");
  sl.addText(g.improvements.map((t, i) => ({ text: `${i + 1}. ${t}`, options: { bullet: false, breakLine: true } })), { x: 0.6, y: 1.6, w: 12, h: 5.5, fontSize: 16, color: SLATE, valign: "top", paraSpaceAfter: 12 });

  await pres.writeFile({ fileName: `${brandName.replace(/[^a-z0-9]+/gi, "-")}-brand-guidelines.pptx` });
}

function hexToRgb(hex: string) {
  const v = hex.replace("#", "");
  return {
    r: parseInt(v.substring(0, 2), 16),
    g: parseInt(v.substring(2, 4), 16),
    b: parseInt(v.substring(4, 6), 16),
  };
}
