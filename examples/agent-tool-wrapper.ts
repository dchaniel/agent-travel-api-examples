type RankTravelInput = {
  origin: string;
  departure_window: [string, string];
  trip_length_days: number;
  budget_usd: number;
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
  hotel_candidates: LiveSignalCandidate[];
  coverage: {
    live_hotel_listings: boolean;
    live_booking_inventory: boolean;
    provider_backed_rates: boolean;
    live_flight_fares: boolean;
  };
  limitations: string[];
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
  why_not_bookable_yet: string;
  intelligence_basis: string[];
  live_signals?: LiveSignals;
  match_reasons: string[];
  beta_warnings?: string[];
  provenance?: {
    source: string;
    notes: string;
  };
};

type AgentTravelResponse = {
  request_id: string;
  requested_services: string[];
  beta_warnings: string[];
  results: AgentTravelResult[];
};

export async function rankTravelDestinations(input: RankTravelInput): Promise<AgentTravelResponse> {
  const key = process.env.AICO_TRAVEL_KEY;

  if (!key) {
    throw new Error("Set AICO_TRAVEL_KEY to a dashboard API key before calling Agent Travel API.");
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
      decision: "ask_for_more_constraints",
      summary: "No ranked destination returned; ask the user for clearer dates, budget, origin, or interests.",
    };
  }

  const coverage = top.live_signals?.coverage;
  const needsLiveProviderHandoff = Boolean(
    coverage &&
      (!coverage.live_booking_inventory || !coverage.provider_backed_rates || !coverage.live_flight_fares),
  );

  return {
    requestId: response.request_id,
    decision: "use_ranked_destination_as_planning_start",
    topDestination: top.name,
    confidence: top.confidence,
    unsupportedConstraints: top.unsupported_constraints,
    intelligenceBasis: top.intelligence_basis,
    liveSignalsSource: top.live_signals?.source,
    needsLiveProviderHandoff,
    summary: [
      `Start itinerary generation from ${top.name}; score ${top.score}.`,
      `Reasons: ${top.match_reasons.join(" | ")}`,
      top.why_not_bookable_yet,
    ].join(" "),
  };
}

// Example usage inside an AI trip-planning copilot.
async function example() {
  const ranked = await rankTravelDestinations({
    origin: "SFO",
    departure_window: ["2026-10-01", "2026-10-03"],
    trip_length_days: 14,
    budget_usd: 9000,
    interests: ["hiking", "food", "recovery"],
    services: ["flights", "stays", "weather", "research"],
  });

  return summarizeForPlanner(ranked);
}

void example;
