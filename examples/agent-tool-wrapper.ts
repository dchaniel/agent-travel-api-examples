type RankTravelInput = {
  origin: string;
  departure_window: [string, string];
  trip_length_days: number;
  budget_usd: number;
  interests: string[];
  services?: string[];
};

type AgentTravelResult = {
  id: string;
  name: string;
  score: number;
  trip_style?: string;
  total_trip_estimate_usd: number;
  ranking_breakdown: Record<string, number>;
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

  const top = ranked.results[0];

  return {
    requestId: ranked.request_id,
    betaWarnings: ranked.beta_warnings,
    recommendationForPlanner: top
      ? `Start itinerary generation from ${top.name}; score ${top.score}; reasons: ${top.match_reasons.join(" | ")}`
      : "No ranked destination returned; ask user for clearer dates, budget, origin, or interests.",
  };
}

void example;
