import { NextRequest, NextResponse } from 'next/server';
import { rateLimit } from '@/lib/rateLimit';
import { generateJSON } from '@/lib/claude';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'alternatives', 30);
  if (limited) return limited;

  const { destination } = await req.json();

  const systemPrompt = `You are a travel expert. Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "alternatives": ["City, Country", "City, Country", "City, Country"]
}
Return exactly 3 alternative destination strings. Nothing else.`;

  const userPrompt = `Someone is planning a trip to ${destination}. Suggest 3 similar destinations they might also enjoy. Return only the JSON.`;

  try {
    const data = await generateJSON(systemPrompt, userPrompt, 1000);
    return NextResponse.json(data);
  } catch (err) {
    // Alternatives are a nice-to-have, so fail quietly with an empty list
    console.warn('[alternatives] generation failed:', err);
    return NextResponse.json({ alternatives: [] });
  }
}
