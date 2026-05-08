import { readFileSync } from "node:fs";
import { strict as assert } from "node:assert";

const files = [
  "README.md",
  "examples/agent-tool-wrapper.ts",
  "prompts/agent-integration-prompt.md",
];

const required = [
  "Hobby: $5 minimum usage/month with $5 credits included",
  "Pro: $20 minimum usage/month with $20 credits included",
  'pricing_model: "usage_token_minimum"',
  "minimum usage/month",
  "credits included",
];

const forbidden = [
  "$5/mo flat recurring subscription",
  "flat-recurring",
  "flat recurring",
  "flat_recurring_subscription",
  "not metered usage billing",
];

for (const file of files) {
  const body = readFileSync(file, "utf8");
  for (const marker of required) {
    assert.ok(body.includes(marker), `${file} missing required pricing marker: ${marker}`);
  }
  for (const marker of forbidden) {
    assert.ok(!body.includes(marker), `${file} contains stale pricing marker: ${marker}`);
  }
  assert.ok(body.includes("live_booking_inventory: false"), `${file} must keep branchable travel truth boundary`);
  assert.ok(body.includes("provider_backed_rates: false"), `${file} must keep branchable rate truth boundary`);
}

console.log(JSON.stringify({ ok: true, checked_files: files }, null, 2));
