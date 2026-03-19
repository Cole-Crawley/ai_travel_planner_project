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
  const { destination } = await req.json();

  const systemPrompt = `You are a travel expert. Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "alternatives": ["City, Country", "City, Country", "City, Country"]
}
Return exactly 3 alternative destination strings. Nothing else.`;

  const userPrompt = `Someone is planning a trip to ${destination}. Suggest 3 similar destinations they might also enjoy. Return only the JSON.`;

  for (const model of MODEL_FALLBACK_CHAIN) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: userPrompt },
        ],
      });

      const text         = completion.choices[0].message.content || '';
      const clean        = text.replace(/```json|```/g, '').trim();
      const finishReason = completion.choices[0].finish_reason;

      if (finishReason === 'length') {
        console.warn(`[alternatives] model ${model} hit token limit, trying next…`);
        continue;
      }

      let data: unknown;
      try {
        data = JSON.parse(clean);
      } catch {
        console.warn(`[alternatives] model ${model} returned unparseable JSON, trying next…`);
        continue;
      }

      return NextResponse.json(data);

    } catch (err) {
      if (!isRateLimitError(err)) {
        console.error(`[alternatives] model ${model} failed:`, err);
        continue;
      }
      console.warn(`[alternatives] model ${model} rate-limited, trying next…`);
    }
  }

  // All models failed — return empty alternatives gracefully (non-fatal)
  return NextResponse.json({ alternatives: [] });
}