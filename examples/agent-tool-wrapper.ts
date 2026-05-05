type DestinationConstraint = {
  type: "city" | "state" | "region" | "country" | "theme" | string;
  value: string;
  hard?: boolean;
};

type SearchTravelInput = {
  user_request?: string;
  origin: string;
  departure_window: [string, string];
  trip_length_days: number;
  budget_usd: number;
  destination_constraints?: DestinationConstraint[];
  required_themes?: string[];
  strict_mode?: boolean;
  interests: string[];
  services?: string[];
};

type Confidence = {
  level: "low" | "medium" | "high" | string;
  score: number;
  reasons: string[];
};

type LiveSignalCandidate = {
  name: string;
  source: string;
  maps_url?: string;
  latitude?: number;
  longitude?: number;
};

type LiveSignals = {
  status: "live" | "degraded" | "unavailable" | string;
  source: string;
  retrieved_at?: string;
  hotel_candidates?: LiveSignalCandidate[];
  place_candidates?: Record<string, LiveSignalCandidate[]>;
  coverage: {
    live_hotel_listings?: boolean;
    live_place_categories?: string[];
    live_booking_inventory: boolean;
    provider_backed_rates: boolean;
    live_flight_fares: boolean;
  };
  limitations: string[];
};

type BookingReadiness = {
  status?: "rankable" | "handoff_required" | "not_bookable" | string;
  requires_live_validation: boolean;
  live_search_or_booking_provider?: string;
  blocked_reasons: string[];
  required_external_checks?: string[];
};

type ProviderHandoffs = {
  bookability_status?: string;
  required_external_checks?: string[];
  flight_handoff?: Record<string, unknown>;
  hotel_handoff?: Record<string, unknown>;
  place_handoff?: Record<string, unknown>;
};

type AgentTravelResult = {
  id: string;
  name: string;
  score: number;
  trip_style?: string;
  total_trip_estimate_usd: number;
  ranking_breakdown: Record<string, number>;
  confidence: Confidence;
  unsupported_constraints: string[];
  why_not_bookable_yet?: string;
  intelligence_basis?: string[];
  interpreted_constraints?: Record<string, unknown>;
  source_tiers?: Array<"curated_baseline" | "model_estimate" | "live_places" | "handoff_required" | "unsupported" | string>;
  live_signals?: LiveSignals;
  booking_readiness?: BookingReadiness;
  bookability_status?: string;
  provider_handoffs?: ProviderHandoffs;
  match_reasons: string[];
  beta_warnings?: string[];
  provenance?: {
    source: "curated_baseline" | "model_estimate" | "live_places" | "handoff_required" | "unsupported" | string;
    notes: string;
  };
};

type AgentTravelResponse = {
  request_id: string;
  requested_services: string[];
  beta_warnings: string[];
  interpreted_constraints?: Record<string, unknown>;
  constraint_conflicts?: Array<Record<string, unknown>>;
  results: AgentTravelResult[];
  commercial_next_step?: CommercialNextStep | null;
};

type CommercialNextStep = {
  reason: "coherent_first_value_or_provider_handoff_ready" | string;
  recommended_plan: "builder" | string;
  paid_signup_url: string;
  paid_login_url: string;
  billing_url_after_login: string;
  checkout_source_path: "/api/v1/travel/search/commercial-next-step" | string;
  limits_delta?: Record<string, unknown>;
  source_attribution?: Record<string, unknown>;
  truth_boundaries: {
    live_booking_inventory: false;
    provider_backed_rates: false;
    live_flight_fares: false;
    booking_supported: false;
  };
};

type CommercialIntentResponse = {
  commercial_intent_id: string;
  event: "commercial_intent_requested";
  request_id: string;
  source_path: "/api/v1/travel/search/commercial-next-step" | string;
  requires_browser_billing_account: true;
  billing_bridge: {
    status: "browser_billing_account_required" | string;
    paid_signup_url: string;
    paid_login_url: string;
    billing_url_after_login: string;
  };
  next_action: {
    type: "open_browser_authenticated_billing" | string;
    signup_url: string;
    login_url: string;
  };
  truth_boundaries: {
    live_booking_inventory: false;
    provider_backed_rates: false;
    live_flight_fares: false;
    booking_supported: false;
  };
};

type ProviderHandoffPrimitiveResponse = {
  beta_caveat?: string;
  interpreted_constraints?: Record<string, unknown>;
  constraint_conflicts?: Array<Record<string, unknown>>;
  match_status?: { status: "matched" | "no_match" | string; reason?: string };
  selected_candidate?: { id: string; name: string; source_tiers?: string[] };
  bookability_status: "handoff_required" | "not_bookable" | "provider_live_partial" | "provider_live_verified" | string;
  provider_handoffs: ProviderHandoffs;
  required_external_checks: string[];
  truth_boundaries: {
    live_airfare: false;
    live_booking_inventory: false;
    provider_backed_rates: false;
    booking_supported?: false;
  };
  next_step?: string;
};

type ProposedTravelPlan = {
  candidate_id?: string;
  destination_name: string;
  departure_window?: [string, string];
  trip_length_days?: number;
  themes?: string[];
  claims?: string[];
};

type ValidateTravelPlanInput = SearchTravelInput & {
  proposed_plan: ProposedTravelPlan;
};

type PlanValidationPrimitiveResponse = {
  beta_caveat?: string;
  interpreted_constraints?: Record<string, unknown>;
  constraint_conflicts?: Array<Record<string, unknown>>;
  plan_validation: {
    status: "coherent" | "needs_revision" | "blocked" | string;
    candidate_intent_coherence: {
      status: "coherent" | "mismatch_detected" | string;
      selected_candidate?: string;
      mismatch_signals?: string[];
    };
    unsupported_live_claims: string[];
    provider_validation_required: boolean;
    required_external_checks: string[];
  };
  truth_boundaries: {
    live_airfare: false;
    live_booking_inventory: false;
    provider_backed_rates: false;
    booking_supported: false;
  };
  next_step?: string;
};

type LivePlacesPrimitiveResponse = {
  beta_caveat?: string;
  selected_candidate?: { id: string; name: string; source_tiers?: string[] };
  match_status?: { status: "matched" | "no_match" | string; reason?: string };
  live_places: {
    source?: string;
    retrieved_at?: string;
    coverage?: Record<string, unknown>;
    place_candidates?: Record<string, LiveSignalCandidate[]>;
  };
  truth_boundaries: {
    live_booking_inventory: false;
    provider_backed_rates: false;
    live_flight_fares: false;
    booking_supported?: false;
  };
};

export async function searchTravelDestinations(input: SearchTravelInput): Promise<AgentTravelResponse> {
  const key = process.env.AICO_TRAVEL_KEY;

  if (!key) {
    throw new Error("Set AICO_TRAVEL_KEY to a dashboard or activation API key before calling Agent Travel API.");
  }

  const response = await fetch("https://agentinfrastructureco.com/api/v1/travel/search", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ["Bearer", key].join(" "),
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(`Agent Travel API returned ${response.status}: ${await response.text()}`);
  }

  return (await response.json()) as AgentTravelResponse;
}

export async function recordCommercialIntent(
  requestId: string,
  sourcePath = "/api/v1/travel/search/commercial-next-step",
): Promise<CommercialIntentResponse> {
  const key = process.env.AICO_TRAVEL_KEY;

  if (!key) {
    throw new Error("Set AICO_TRAVEL_KEY before recording Agent Travel API commercial intent.");
  }

  const response = await fetch("https://agentinfrastructureco.com/api/v1/commercial/intent", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ["Bearer", key].join(" "),
    },
    body: JSON.stringify({
      request_id: requestId,
      source_path: sourcePath,
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent Travel API commercial intent returned ${response.status}: ${await response.text()}`);
  }

  const body = (await response.json()) as CommercialIntentResponse;
  if (body.requires_browser_billing_account !== true) {
    throw new Error("Unexpected commercial intent response: expected browser-authenticated billing boundary.");
  }
  return body;
}

async function callHostedMcpTool<TResponse>(name: string, input: object, id: string): Promise<TResponse> {
  const key = process.env.AICO_TRAVEL_KEY;

  if (!key) {
    throw new Error("Set AICO_TRAVEL_KEY to a dashboard or activation API key before calling Agent Travel API MCP.");
  }

  const response = await fetch("https://agentinfrastructureco.com/mcp", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: ["Bearer", key].join(" "),
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id,
      method: "tools/call",
      params: {
        name,
        arguments: input,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Agent Travel API MCP returned ${response.status}: ${await response.text()}`);
  }

  const envelope = (await response.json()) as {
    result?: TResponse | { content?: Array<{ type: string; text?: string }> };
    error?: { message?: string };
  };

  if (envelope.error) {
    throw new Error(envelope.error.message ?? "Agent Travel API MCP returned an error.");
  }

  const result = envelope.result;
  if (!result) {
    throw new Error(`Agent Travel API MCP returned no result payload for ${name}.`);
  }

  if (typeof result === "object" && "content" in result && Array.isArray(result.content)) {
    const text = result.content.find((item) => item.type === "text")?.text;
    if (!text) {
      throw new Error(`Agent Travel API MCP returned no text payload for ${name}.`);
    }
    return JSON.parse(text) as TResponse;
  }

  return result as TResponse;
}

export async function searchLivePlaces(
  input: SearchTravelInput & { selected_candidate?: { id?: string; name?: string } },
): Promise<LivePlacesPrimitiveResponse> {
  if (!input.user_request) {
    throw new Error("travel.places.search requires user_request so live-place evidence stays scoped to the user's intent.");
  }

  return callHostedMcpTool<LivePlacesPrimitiveResponse>("travel.places.search", input, "places-search-1");
}

export async function validateTravelPlan(input: ValidateTravelPlanInput): Promise<PlanValidationPrimitiveResponse> {
  if (!input.user_request) {
    throw new Error("travel.plan.validate requires user_request so validation preserves the user's hard scope.");
  }

  if (!input.proposed_plan?.destination_name) {
    throw new Error("travel.plan.validate requires proposed_plan.destination_name.");
  }

  return callHostedMcpTool<PlanValidationPrimitiveResponse>("travel.plan.validate", input, "plan-validate-1");
}

export async function generateProviderHandoffs(input: SearchTravelInput): Promise<ProviderHandoffPrimitiveResponse> {
  if (!input.user_request) {
    throw new Error("travel.provider_handoffs.generate requires user_request so handoff setup preserves the user's hard scope.");
  }

  return callHostedMcpTool<ProviderHandoffPrimitiveResponse>(
    "travel.provider_handoffs.generate",
    input,
    "provider-handoffs-1",
  );
}

export function summarizeForPlanner(response: AgentTravelResponse) {
  const top = response.results[0];

  if (!top) {
    return {
      requestId: response.request_id,
      decision: "ask_for_more_constraints_or_handoff_to_live_search",
      interpretedConstraints: response.interpreted_constraints,
      constraintConflicts: response.constraint_conflicts ?? [],
      summary: "No in-scope destination returned; ask for clearer constraints or hand off to live search/provider tools.",
    };
  }

  const coverage = top.live_signals?.coverage;
  const readinessRequiresHandoff = Boolean(top.booking_readiness?.requires_live_validation);
  const missingProviderTruth = Boolean(
    coverage &&
      (!coverage.live_booking_inventory || !coverage.provider_backed_rates || !coverage.live_flight_fares),
  );
  const needsLiveProviderHandoff = readinessRequiresHandoff || missingProviderTruth;

  return {
    requestId: response.request_id,
    decision: needsLiveProviderHandoff
      ? "use_ranked_destination_then_validate_with_live_providers"
      : "use_ranked_destination_as_planning_start",
    topDestination: top.name,
    confidence: top.confidence,
    interpretedConstraints: top.interpreted_constraints ?? response.interpreted_constraints,
    unsupportedConstraints: top.unsupported_constraints,
    sourceTiers: top.source_tiers,
    liveSignalsSource: top.live_signals?.source,
    bookabilityStatus: top.bookability_status ?? top.provider_handoffs?.bookability_status,
    commercialNextStep: response.commercial_next_step
      ? {
          recommendedPlan: response.commercial_next_step.recommended_plan,
          paidSignupUrl: response.commercial_next_step.paid_signup_url,
          paidLoginUrl: response.commercial_next_step.paid_login_url,
          checkoutSourcePath: response.commercial_next_step.checkout_source_path,
          commercialIntentEndpoint: "/api/v1/commercial/intent",
          commercialIntentEvent: "commercial_intent_requested",
          requiresBrowserBillingAccount: true,
          truthBoundaries: response.commercial_next_step.truth_boundaries,
          note:
            "Surface this only after first value. Builder increases limits for production-shaped testing; it does not add live booking inventory, provider-backed rates, live flight fares, or booking support.",
        }
      : null,
    requiredExternalChecks:
      top.provider_handoffs?.required_external_checks ?? top.booking_readiness?.required_external_checks ?? [],
    needsLiveProviderHandoff,
    summary: [
      `Start itinerary generation from ${top.name}; score ${top.score}.`,
      `Reasons: ${top.match_reasons.join(" | ")}`,
      top.why_not_bookable_yet ?? "Validate live fares, rooms, rates, availability, and provider-specific terms before purchase decisions.",
    ].join(" "),
  };
}

// Example usage inside an AI trip-planning copilot.
async function example() {
  const ranked = await searchTravelDestinations({
    user_request:
      "Northern California Memorial Day weekend with redwoods, rugged coast, food, and recovery time before Google Places/weather fanout.",
    origin: "SFO",
    departure_window: ["2026-05-22", "2026-05-25"],
    trip_length_days: 3,
    budget_usd: 2500,
    destination_constraints: [{ type: "region", value: "Northern California", hard: true }],
    required_themes: ["redwoods", "rugged coast"],
    strict_mode: true,
    interests: ["hiking", "food", "recovery"],
    services: ["flights", "stays", "weather", "research"],
  });

  return summarizeForPlanner(ranked);
}

void example;
