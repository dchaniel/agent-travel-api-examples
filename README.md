# Agent Travel API examples

Public examples and quickstarts for Agent Travel API.

What it is:
- query-sensitive travel ranking API for AI agents
- useful for trip-planning copilots, demos, prototypes, and early travel workflows
- self-serve signup and Stripe billing live

Start here:
- Product: https://agentinfrastructureco.com/travel
- Docs: https://agentinfrastructureco.com/docs
- OpenAPI: https://agentinfrastructureco.com/openapi.json
- llms.txt: https://agentinfrastructureco.com/llms.txt
- Signup: https://agentinfrastructureco.com/signup

Honest beta note:
- current responses use seeded travel intelligence
- not live booking/provider quotes yet

Quickstart curl:
```bash
curl https://agentinfrastructureco.com/api/v1/travel/search \
  -H "Authorization: Bearer YOUR_API_KEY" \
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
