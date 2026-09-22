import { NextRequest, NextResponse } from 'next/server';
import { generateJSON, AIRateLimitError } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const { destination, days = 5, preferences = '' } = await req.json();
  // Cap at 14 days to avoid token exhaustion
  const tripDays = Math.min(Math.max(1, Number(days)), 14);

  const systemPrompt = `You are an expert travel planner with deep local knowledge. Return ONLY valid JSON in this exact format, no markdown:
{
  "destination": "City, Country",
  "duration": 5,
  "days": [
    {
      "day": 1,
      "date": "Day 1",
      "theme": "Arrival & Old Town",
      "activities": [
        {
          "time": "09:00",
          "title": "Activity name",
          "description": "Brief engaging description of the activity",
          "location": "Specific place name",
          "coordinates": [longitude, latitude],
          "duration": "1-2 hours",
          "price": "$5",
          "category": "Culture",
          "tips": "One practical insider tip for visiting"
        }
      ]
    }
  ]
}

CRITICAL PLANNING RULES — you must follow all of these:

GEOGRAPHIC LOGIC:
- Each day's activities must be geographically clustered. Group activities by neighbourhood or district so the traveller is not crossing the city back and forth.
- Activities within the same day should be walkable or at most one short transit hop (under 20 minutes) from each other.
- Never plan activities on opposite sides of a city on the same day.
- Order the day's activities in a logical geographic sequence — a route, not a scatter.

TIME FEASIBILITY:
- Respect realistic opening hours. Museums typically open 09:00–10:00 and close 17:00–18:00. Restaurants have lunch and dinner service windows. Markets are morning-only. Bars/nightlife are evening only.
- Account for travel time between each activity. If two locations are 20 minutes apart, the next activity should start at least 20–30 minutes after the previous activity ends.
- Each activity has a duration field — use it honestly. A "1–2 hour" activity starting at 14:00 should have the next activity no earlier than 15:30.
- Do not schedule more than 4 activities per day. 3 is ideal for a comfortable pace.
- A typical day runs 09:00–22:00. Do not schedule activities before 08:00 or after 23:00 unless specifically nightlife.

ACTIVITY VARIETY & SENSE:
- Do not repeat the same type of activity twice in one day (e.g. two museums, two food markets).
- Structure the day naturally: lighter/outdoor activities in the morning, major attractions midday, food and relaxed/cultural experiences in the afternoon and evening.
- Lunch should fall between 12:00–14:00 and dinner between 19:00–21:30.
- Coordinates must be accurate [longitude, latitude] for the specific named location. Do not use city centre coordinates for every activity.`;

  const prefsClause = preferences ? `

User preferences: ${preferences}. Tailor the activities to match.` : '';
  const userPrompt = `Plan a ${tripDays} day trip to ${destination} with 3 activities per day. Make sure each day is geographically coherent — activities should be in the same area of the city so the itinerary is actually walkable and practical. Each day should feel like a real, well-paced day out, not a list of disconnected highlights.${prefsClause}`;

  try {
    // Scale tokens with trip length. 14 days needs ~2.5x the tokens of 5 days.
    const data = await generateJSON(systemPrompt, userPrompt, Math.min(16000, 4000 + tripDays * 800));
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof AIRateLimitError) {
      return NextResponse.json(
        {
          error: 'rate_limit',
          message: "We've hit the AI usage limit for now. Please try again in a few minutes.",
          retryAfter: 300,
        },
        { status: 429 },
      );
    }
    console.error('[itinerary] generation failed:', err);
    return NextResponse.json(
      { error: 'failed', message: "Couldn't plan this trip right now. Please try again." },
      { status: 500 },
    );
  }
}
