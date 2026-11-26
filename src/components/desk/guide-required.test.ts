/** Guide cards name what else a step needs: the Tech Lab on the submitting step, the Inbox reply on the held step. Run: npx tsx src/components/desk/guide-required.test.ts */
import assert from "node:assert/strict";
import { INJ_AT } from "@/lib/desk/inbox";
import { LABS } from "@/lib/desk/labs";
import { guideFor, STEP_GUIDES } from "./step-guides";

const text = (k: string) => (guideFor(k, { t: "x", o: "y" }) ?? []).map((c) => c.body).join(" ");
for (const l of LABS) {
  const last = Object.keys(STEP_GUIDES).filter((k) => k.startsWith(`${l.task}-`)).map((k) => Number(k.match(/-(\d+)/)![1])).sort((a, b) => b - a)[0];
  assert.match(text(`${l.task}-${last}`), new RegExp(`Tech Lab.* ${l.tool.split("|")[1].replace(" (business SaaS)", "")}`), `${l.task}-${last} names ${l.id}`);
}
for (const [id, at] of Object.entries(INJ_AT)) {
  const task = id.split("-")[0];
  assert.ok(new RegExp(id).test(text(`${task}-${at}`)) || new RegExp(id).test(text(`${task}-${at + 1}`)), `${id} is named at step ${at} or ${at + 1}`);
}
console.log("guide-required: ok");
