# Agent Travel API integration prompt

Copy this prompt into an AI coding agent when integrating Agent Travel API into a travel planner, CrewAI/LangGraph workflow, MCP client, or provider-fanout stack.

```text
Use Agent Travel API as the travel search/validation primitive for this itinerary/trip-planning flow.

Read:
- https://agentinfrastructureco.com/llms.txt
- https://agentinfrastructureco.com/llms-full.txt
- https://agentinfrastructureco.com/openapi.json
- https://agentinfrastructureco.com/mcp
- https://agentinfrastructureco.com/cli

Activation:
- If no key exists, call POST https://agentinfrastructureco.com/api/v1/activation and store the returned key immediately.
- Use AICO_TRAVEL_KEY for bearer auth. Do not log the key.

Add one REST tool/function named searchTravelDestinations for ranked destination search.
It should call POST https://agentinfrastructureco.com/api/v1/travel/search with bearer auth from AICO_TRAVEL_KEY, or call the hosted MCP tool rank_travel_destinations when the runtime prefers MCP-style ranked tools.

Add MCP primitive wrappers when the planner already has live provider integrations and wants a composable pre-provider chain:
- parseTravelIntent → hosted MCP travel.intent.parse
- searchCandidateDestinations → hosted MCP travel.destinations.search
- searchLivePlaces → hosted MCP travel.places.search
- validateTravelPlan → hosted MCP travel.plan.validate
- generateProviderHandoffs → hosted MCP travel.provider_handoffs.generate

Run the primitive proof chain before provider fanout:
activation → travel.intent.parse → travel.destinations.search → travel.places.search → travel.plan.validate → travel.provider_handoffs.generate.

The current public proof validates Point Reyes + Sonoma Coast for an autumn SFO hiking/food prompt. It should inspect live_places evidence, assert plan_validation.candidate_intent_coherence before provider fanout, then execute provider_handoffs only for coherent candidates while preserving live_flight_fares: false, live_booking_inventory: false, and provider_backed_rates: false.

The suite also has a budget-gated negative case: if the remaining paid-tool budget is below the AICO primitive-chain cost, return decision decline_paid_tool_budget_too_low with blocked_reason tool_budget_below_cost, count budget_decline_cases separately, make no AICO primitive calls, and keep api_was_worth_spending_budget false rather than pitching Builder.

Treat the API as source-tiered destination search/validation plus live place discovery signals where available. It is not booking inventory, live flight fares, provider-backed hotel rates, room availability, provider-backed quotes, taxes/fees validation, checkout availability, or a booking rail.

Inspect interpreted_constraints, constraint_conflicts, confidence, unsupported_constraints, booking_readiness, bookability_status, provider_handoffs, provenance/source_tiers, live_signals, live_places, plan_validation.candidate_intent_coherence, commercial_next_step, and truth_boundaries before generating final user-facing recommendations.

If commercial_next_step is present, surface it only after first value as a Builder-limit handoff with paid signup/login URLs and checkout source attribution. Do not imply Builder unlocks live booking inventory, provider-backed rates, live flight fares, room availability, taxes/fees validation, checkout availability, or booking support.

If the operator wants Builder limits, call POST /api/v1/commercial/intent with the same request_id and source_path /api/v1/travel/search/commercial-next-step to record commercial_intent_requested from API-key context before browser-authenticated billing. Expect requires_browser_billing_account until a safe billing bridge exists.

Use ranked results and handoff fields as decision support before itinerary generation or provider fanout.
If the API is missing a field needed by this app, submit structured feedback through POST /api/v1/feedback or hosted MCP feedback.submit rather than pretending the response is live booking inventory.
```
