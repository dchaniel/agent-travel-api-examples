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
