import { createHash } from "node:crypto";

// Fingerprint the exam rather than its Vietnamese controls and feedback. Generated
// from the pre-localization papers at de5ee6b955e11d97cc3b3b9b457caa31188b92c7.
export function fingerprint(t) {
  const core = [t.durationMin];
  if (t.task1) core.push(t.task1.prompt, t.task2.prompt);
  else
    for (const p of t.sections || t.passages) {
      core.push(
        p.id,
        p.audio || null,
        p.passage?.title ?? null,
        p.passage?.paras ?? null,
      );
      for (const g of p.groups) {
        core.push(g.kind, g.answerSet || null);
        for (const q of g.questions)
          core.push([
            q.id,
            q.no,
            q.q ?? null,
            q.options ?? null,
            q.answer ?? null,
          ]);
      }
    }
  return createHash("sha256").update(JSON.stringify(core)).digest("hex");
}
