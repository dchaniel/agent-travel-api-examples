# Agent Travel API examples

Public quickstarts for integrating Agent Travel API into AI travel agents, itinerary copilots, and provider-fanout travel workflows.

## What it is

Agent Travel API is an agent-native travel search and validation API built for AI agents.

One API call turns a messy trip prompt plus optional hard constraints into source-aware destination JSON with interpreted constraints, conflict handling, ranking breakdowns, beta warnings, confidence, unsupported constraints, provenance, live hotel/place discovery signals where available, and provider-ready handoffs. Hosted MCP also exposes composable primitives such as `travel.intent.parse` and `travel.provider_handoffs.generate` for agents that need parsing or handoff setup without a ranked itinerary response.

Human developers are the operators and economic buyers, but agents are the core audience: the API is meant to be easy for an agent to discover, understand, activate, call, and evaluate.

## Best fit

Use this when your product already has an AI trip planner or agent loop and needs a structured search/validation step before itinerary generation, Google Places/weather fanout, or live booking-provider validation.

Good first integrations:

- AI travel planner chatbots that need ranked, in-scope destination options before writing prose
- LangChain, CrewAI, LangGraph, Vercel AI SDK, or MCP travel agents that need one JSON tool call
- provider-fanout workflows that want to reduce low-fit Google Places, weather, search, hotel, or flight calls
- itinerary copilots that need budget, timing, interest, source/provenance, live place evidence, and route-effort tradeoffs in one response

## Honest beta note

Current responses combine source-tiered destination search/validation with live hotel/place discovery signals when available. Cold-start and fallback evidence is labeled with tiers such as `curated_baseline`, `model_estimate`, `live_places`, and `handoff_required`.

This is not live booking inventory, not a live OTA/metasearch replacement, not live flight fares, and not provider-backed hotel rates, room availability, or quotes.

## Start here

- Product: https://agentinfrastructureco.com/travel
- Docs: https://agentinfrastructureco.com/docs
- OpenAPI: https://agentinfrastructureco.com/openapi.json
- Hosted MCP: https://agentinfrastructureco.com/mcp
- CLI: https://agentinfrastructureco.com/cli
- llms.txt: https://agentinfrastructureco.com/llms.txt
- Full agent guide: https://agentinfrastructureco.com/llms-full.txt
- Signup: https://agentinfrastructureco.com/signup

## One-request activation

Shell-only evaluator agents can request a low-quota sandbox key without browser signup. Store the returned key immediately; it is returned once.

Endpoint: `POST /api/v1/activation`

```bash
curl https://agentinfrastructureco.com/api/v1/activation \
  -H "Content-Type: application/json" \
  -d '{
    "agent_name": "my-travel-planner-agent",
    "intended_use": "Evaluate Agent Travel API before provider fanout."
  }'
```

## Quickstart curl

Paste a dashboard or activation key into the non-secret shell variable below.

```bash
export AICO_TRAVEL_KEY="paste-key-here"

curl https://agentinfrastructureco.com/api/v1/travel/search \
  -H "$(printf '%s %s' 'Authorization:' "Bearer $AICO_TRAVEL_KEY")" \
  -H "Content-Type: application/json" \
  -d '{
    "user_request": "Northern California Memorial Day weekend with redwoods, rugged coast, food, and recovery time before Google Places/weather fanout.",
    "origin": "SFO",
    "departure_window": ["2026-05-22", "2026-05-25"],
    "trip_length_days": 3,
    "budget_usd": 2500,
    "destination_constraints": [{ "type": "region", "value": "Northern California", "hard": true }],
    "required_themes": ["redwoods", "rugged coast"],
    "strict_mode": true,
    "interests": ["hiking", "food", "recovery"],
    "services": ["flights", "stays", "weather", "research"]
  }'
```

A successful response includes `request_id`, `beta_warnings`, and ranked `results`.

Each result exposes trust fields an agent should inspect before writing user-facing travel advice:

- `interpreted_constraints` and `constraint_conflicts`: how hard user scope was interpreted and whether copied sample fields conflicted with the prompt
- `confidence`: level, score, and reasons for ranking confidence
- `unsupported_constraints`: constraints the beta could not fully verify
- `booking_readiness` and `bookability_status`: whether the result is rankable now or must be handed to live providers before purchase decisions
- `provider_handoffs`: flight, hotel, and place validation tasks/params for the next provider call
- `live_signals`: source, retrieval time, hotel/place candidates, coverage flags, and limitations
- `provenance` / `source_tiers`: whether evidence is `curated_baseline`, `model_estimate`, `live_places`, `handoff_required`, or unsupported

## Minimal TypeScript tool wrapper

See [`examples/agent-tool-wrapper.ts`](examples/agent-tool-wrapper.ts) for copy-pasteable wrappers that an AI coding agent can drop into a travel-planning app.

The wrapper intentionally returns the trust and handoff fields, not only the destination name and score. Agents should read `interpreted_constraints`, `confidence`, `unsupported_constraints`, `booking_readiness`, `bookability_status`, `provider_handoffs`, and `live_signals.coverage` before deciding whether to ask a booking/search provider for live inventory.

## Hosted MCP primitive: provider handoff only

If your planner already has Amadeus, Booking, Google Places, Browserless, Serper, or another live provider layer, use the hosted MCP tool `travel.provider_handoffs.generate` when you want provider-ready setup without ranked destinations.

JSON-RPC shape:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "travel.provider_handoffs.generate",
    "arguments": {
      "user_request": "Generate provider-ready flight, hotel, and place handoffs for a 5-day SFO hiking and food trip under $4,500 before live provider fanout.",
      "origin": "SFO",
      "departure_window": ["2026-10-01", "2026-10-06"],
      "trip_length_days": 5,
      "budget_usd": 4500,
      "interests": ["hiking", "food"],
      "services": ["flights", "stays", "research"],
      "strict_mode": true
    }
  }
}
```

Expected handoff fields: `bookability_status: "handoff_required"`, `provider_handoffs.flight_handoff`, `provider_handoffs.hotel_handoff`, `provider_handoffs.place_handoff`, `required_external_checks`, and `truth_boundaries` with live airfare, live booking inventory, and provider-backed rates still false. This primitive is useful before provider fanout; it is not a fare, room, rate, or booking validation result.

## Agent integration prompt

Give this to an AI coding agent:

```text
Use Agent Travel API as the travel search/validation primitive for this itinerary/trip-planning flow.

Read:
- https://agentinfrastructureco.com/llms.txt
- https://agentinfrastructureco.com/llms-full.txt
- https://agentinfrastructureco.com/openapi.json
- https://agentinfrastructureco.com/mcp
- https://agentinfrastructureco.com/cli

Add one REST tool/function named searchTravelDestinations for ranked destination search.
It should call POST https://agentinfrastructureco.com/api/v1/travel/search with bearer auth from AICO_TRAVEL_KEY, or call the hosted MCP tool rank_travel_destinations when the runtime prefers MCP-style ranked tools.
Add a second MCP-only primitive named generateProviderHandoffs when the planner already has live provider integrations and only needs setup for downstream validation. It should call the hosted MCP tool `travel.provider_handoffs.generate`, require user_request, and return handoff fields without ranked destinations.
It should accept user_request, origin, departure_window, trip_length_days, budget_usd, destination_constraints, required_themes, strict_mode, interests, and optional services.
Treat the API as source-tiered destination search/validation plus live hotel/place discovery signals where available, not booking inventory, live flight fares, provider-backed rates, room availability, provider-backed quotes, or booking rails.
Inspect interpreted_constraints, constraint_conflicts, confidence, unsupported_constraints, booking_readiness, bookability_status, provider_handoffs, provenance/source_tiers, and live_signals before generating final user-facing recommendations.
Use ranked results and handoff fields as decision support before itinerary generation or provider fanout.
If the API is missing a field needed by this app, record the missing field as product feedback rather than pretending the response is live booking inventory.
```

## Pricing

- Free sandbox via one-request activation or signup
- Builder plan: $29/mo via self-serve Stripe Checkout

## Revenue path for builders

1. Activate a sandbox key or sign up and create an API key.
2. Run the quickstart once.
3. Add the TypeScript wrapper as one tool in your travel agent.
4. If the response shape saves glue code or provider calls, upgrade to Builder when sandbox limits matter.
5. If one field or destination blocks adoption, open an issue or reply through the channel where you found this repo.
