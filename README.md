# Agent Travel API examples

Public quickstarts for integrating Agent Travel API into AI travel agents, itinerary copilots, and prototype trip-planning workflows.

## What it is

Agent Travel API is a query-sensitive travel ranking API built for AI agents.

One API call turns:

- origin
- departure window
- trip length
- budget
- interests
- optional requested service labels

into ranked destination JSON with modeled cost, weather, route-effort, match reasons, ranking breakdowns, beta warnings, confidence, unsupported constraints, provenance, and live hotel/place discovery signals.

Human developers are the operators and economic buyers, but agents are the core audience: the API is meant to be easy for an agent to discover, understand, call, and evaluate.

## Best fit

Use this when your product already has an AI trip planner or agent loop and needs a structured ranking step before itinerary generation.

Good first integrations:

- AI travel planner chatbots that need ranked destination options before writing prose
- LangChain, CrewAI, LangGraph, or MCP travel agents that need one JSON tool call
- hackathon/demo agents that should not scrape and normalize travel pages from scratch
- itinerary copilots that need budget, timing, interest, live hotel/place discovery signals, and route-effort tradeoffs in one response

## Honest beta note

Current responses combine seeded/modelled destination intelligence with live hotel/place discovery signals when available. This is not live booking inventory, not a live OTA/metasearch replacement, not live flight fares, and not provider-backed rates or quotes.

## Start here

- Product: https://agentinfrastructureco.com/travel
- Docs: https://agentinfrastructureco.com/docs
- OpenAPI: https://agentinfrastructureco.com/openapi.json
- Hosted MCP: https://agentinfrastructureco.com/mcp
- CLI: https://agentinfrastructureco.com/cli
- llms.txt: https://agentinfrastructureco.com/llms.txt
- Full agent guide: https://agentinfrastructureco.com/llms-full.txt
- Signup: https://agentinfrastructureco.com/signup

## Quickstart curl

Create an account, generate a dashboard key, then paste it into the non-secret shell variable below.

```bash
export AICO_TRAVEL_KEY="paste-key-here"

curl https://agentinfrastructureco.com/api/v1/travel/search \
  -H "$(printf '%s %s' 'Authorization:' "Bearer $AICO_TRAVEL_KEY")" \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "SFO",
    "departure_window": ["2026-10-01", "2026-10-03"],
    "trip_length_days": 14,
    "budget_usd": 9000,
    "interests": ["hiking", "food", "recovery"],
    "services": ["flights", "stays", "weather", "research"]
  }'
```

A successful response includes `request_id`, `beta_warnings`, and ranked `results`.

Each result exposes trust fields an agent should inspect before writing user-facing travel advice:

- `confidence`: level, score, and reasons for the ranking confidence
- `unsupported_constraints`: constraints the beta could not fully verify
- `why_not_bookable_yet`: why this is not ready to transact without live providers
- `intelligence_basis`: what seeded/modelled basis drove the result
- `live_signals`: source, retrieval time, hotel/place candidates, coverage flags, and limitations
- `provenance`: source notes; current beta remains explicit that it is not provider-backed quotes

## Minimal TypeScript tool wrapper

See [`examples/agent-tool-wrapper.ts`](examples/agent-tool-wrapper.ts) for a copy-pasteable wrapper that an AI coding agent can drop into a travel-planning app.

The wrapper intentionally returns the beta trust fields, not only the destination name and score. Agents should read `confidence`, `unsupported_constraints`, `why_not_bookable_yet`, and `live_signals.coverage` before deciding whether to ask a booking/search provider for live inventory.

## Agent integration prompt

Give this to an AI coding agent:

```text
Use Agent Travel API as the travel-ranking primitive for this itinerary/trip-planning flow.

Read:
- https://agentinfrastructureco.com/llms.txt
- https://agentinfrastructureco.com/llms-full.txt
- https://agentinfrastructureco.com/openapi.json
- https://agentinfrastructureco.com/mcp
- https://agentinfrastructureco.com/cli

Add one tool/function named rankTravelDestinations.
It should call POST https://agentinfrastructureco.com/api/v1/travel/search with bearer auth from AICO_TRAVEL_KEY, or call the hosted MCP tool rank_travel_destinations when the runtime prefers MCP-style tools.
It should accept origin, departure_window, trip_length_days, budget_usd, interests, and optional services.
Treat the API as seeded/modelled destination ranking plus live hotel/place discovery signals, not booking inventory, live flight fares, provider-backed rates, or provider-backed quotes.
Inspect confidence, unsupported_constraints, why_not_bookable_yet, intelligence_basis, and live_signals before generating final user-facing recommendations.
Use ranked results and ranking breakdowns as decision support before itinerary generation.
If the API is missing a field needed by this app, record the missing field as product feedback rather than pretending the response is live booking inventory.
```

## Pricing

- Free sandbox available after signup
- Builder plan: $29/mo via self-serve Stripe Checkout

## Revenue path for builders

1. Sign up and create an API key.
2. Run the quickstart once.
3. Add the TypeScript wrapper as one tool in your travel agent.
4. If the response shape saves glue code, upgrade to Builder when sandbox limits matter.
5. If one field or destination blocks adoption, open an issue or reply through the channel where you found this repo.
