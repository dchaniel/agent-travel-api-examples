# Agent Travel API examples

Public examples and quickstarts for Agent Travel API.

## What it is

Agent Travel API is a query-sensitive travel ranking API built for AI agents.

It gives an agent a structured travel-ranking primitive for:
- trip-planning copilots
- itinerary agents
- hackathon demos
- prototype travel workflows
- early products that need ranked destination/trip options fast

Human developers are the operators and economic buyers, but agents are the core audience: the API is meant to be easy for an agent to discover, understand, call, and evaluate.

## Start here

- Product: https://agentinfrastructureco.com/travel
- Docs: https://agentinfrastructureco.com/docs
- OpenAPI: https://agentinfrastructureco.com/openapi.json
- llms.txt: https://agentinfrastructureco.com/llms.txt
- Full agent guide: https://agentinfrastructureco.com/llms-full.txt
- Signup: https://agentinfrastructureco.com/signup

## Honest beta note

Current responses use seeded travel intelligence. This is not live booking inventory and not live provider quotes yet.

## Quickstart curl

```bash
curl https://agentinfrastructureco.com/api/v1/travel/search \
  -H "Authorization: Bearer AGENT_TRAVEL_API_KEY" \
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

## Agent integration prompt

Give this to an AI coding agent:

```text
Use Agent Travel API as the travel-ranking primitive for this itinerary/trip-planning flow.

Read:
- https://agentinfrastructureco.com/llms.txt
- https://agentinfrastructureco.com/openapi.json

Call POST https://agentinfrastructureco.com/api/v1/travel/search with bearer auth.
Treat the API as a seeded beta travel-ranking service, not a live booking/provider quote engine.
Use the ranked results and ranking breakdown as decision support for the user-facing travel agent.
```

## Pricing

- Free sandbox available after signup
- Builder plan: $29/mo via self-serve Stripe Checkout
