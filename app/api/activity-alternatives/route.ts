import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const MODEL_FALLBACK_CHAIN = [
  'llama-3.1-8b-instant',
  'llama3-8b-8192',
  'gemma2-9b-it',
];

function isRateLimitError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'status' in err &&
    (err as { status: number }).status === 429
  );
}

export async function POST(req: NextRequest) {
  const { destination, currentActivity, currentCoordinates, timeSlot, dayActivities, theme } = await req.json();

  const scheduleContext = dayActivities && dayActivities.length > 0
    ? `The other activities already planned for this day are: ${dayActivities
        .filter((a: { title: string }) => a.title !== currentActivity)
        .map((a: { time: string; title: string; location: string; duration: string }) =>
          `"${a.title}" at ${a.location} (${a.time}, ${a.duration})`
        )
        .join('; ')}.`
    : '';

  const locationContext = currentCoordinates
    ? `The activity being replaced is at coordinates [${currentCoordinates[0]}, ${currentCoordinates[1]}].`
    : '';

  const timeContext = timeSlot ? `It fills the ${timeSlot} time slot.` : '';

  const systemPrompt = `You are a local travel expert with deep knowledge of ${destination}. Return ONLY valid JSON, no markdown. Format:
{ "alternatives": [
  {
    "time": "09:00",
    "title": "...",
    "description": "...",
    "location": "...",
    "coordinates": [longitude, latitude],
    "duration": "1-2 hours",
    "price": "Free or price estimate",
    "category": "Culture/Food/Nature/Shopping/Adventure/Relaxation",
    "tips": "One practical insider tip"
  }
]}

CRITICAL RULES for suggesting alternatives:

PROXIMITY:
- Alternatives MUST be in the same neighbourhood or district as the activity being replaced, or within a 15–20 minute walk/transit of the other activities already planned that day.
- Never suggest an activity on the other side of the city.
- Coordinates must be accurate [longitude, latitude] for the specific named location.

TIME SLOT FIT:
- The alternative must fit the same time slot as the activity it replaces.
- Respect opening hours. Do not suggest a museum that closes at 17:00 for an evening slot, or a dinner restaurant for a 10:00 slot.
- The duration of the alternative should be similar to the one it replaces so the rest of the day's schedule is not disrupted.

DAY COHERENCE:
- Do not suggest a category already covered elsewhere in the day.
- The alternative should complement the day's theme and the other activities.
- Suggest genuinely distinct options.`;

  const userPrompt = `Someone is visiting ${destination} and wants to replace "${currentActivity}" on their "${theme}" day. ${locationContext} ${timeContext} ${scheduleContext}

Suggest 3 alternative activities they could realistically do instead. Each must be near the same area of the city, fit the same time slot, and make sense given what else is planned that day.`;

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        max_tokens: 3000,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      });

      const text         = completion.choices[0].message.content || '';
      const clean        = text.replace(/```json|```/g, '').trim();
      const finishReason = completion.choices[0].finish_reason;

      if (finishReason === 'length') {
        console.warn(`[activity-alternatives] model ${model} hit token limit, trying next…`);
        continue;
      }

      let data: unknown;
      try {
        data = JSON.parse(clean);
      } catch (parseErr) {
        console.warn(`[activity-alternatives] model ${model} returned unparseable JSON, trying next…`, parseErr);
        continue;
      }

      return NextResponse.json(data);

    } catch (err) {
      if (!isRateLimitError(err)) {
        console.error(`[activity-alternatives] model ${model} failed:`, err);
        continue;
      }
      console.warn(`[activity-alternatives] model ${model} rate-limited, trying next…`);
    }
  }

  return NextResponse.json(
    {
      error: 'rate_limit',
      message: 'Unable to load alternatives right now. Please try again in a few minutes.',
    },
    { status: 429 },
  );
}