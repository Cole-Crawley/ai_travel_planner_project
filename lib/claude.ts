import Anthropic from '@anthropic-ai/sdk';

// Reads ANTHROPIC_API_KEY from the environment (.env.local locally, Vercel env vars in production).
// Created on first request, not at import, so `next build` never needs the key.
let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

// Same model Distill uses. Low effort keeps responses fast enough for an interactive page;
// these routes produce structured JSON rather than needing deep reasoning.
const MODEL = 'claude-sonnet-5';

export class AIRateLimitError extends Error {}

// The account's monthly spend limit (or its credit) has run out. Anthropic reports this
// as a 400, and retrying won't help until the limit resets.
export class AIDemoLimitError extends Error {}

export const DEMO_LIMIT_MESSAGE =
  "The live demo has used up this month's planning allowance. It resets at the start of next month.";

// Asks Claude for a JSON response and parses it. Throws AIRateLimitError on 429s
// (the SDK has already retried twice by then) and a plain Error for anything else.
export async function generateJSON(system: string, user: string, maxTokens: number): Promise<unknown> {
  let message: Anthropic.Message;
  try {
    message = await getClient().messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      output_config: { effort: 'low' },
      system,
      messages: [{ role: 'user', content: user }],
    });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) throw new AIRateLimitError(err.message);
    if (err instanceof Anthropic.APIError && err.status === 400 && /usage limit|credit balance/i.test(err.message)) {
      throw new AIDemoLimitError(err.message);
    }
    throw err;
  }

  if (message.stop_reason === 'max_tokens') throw new Error('Response was cut off at max_tokens');
  if (message.stop_reason === 'refusal') throw new Error('Request was declined');

  // Adaptive thinking can put a thinking block before the text, so don't read content[0].
  const text = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map((block) => block.text)
    .join('');

  const clean = text.replace(/```json|```/g, '').trim();
  const start = clean.indexOf('{');
  const end = clean.lastIndexOf('}');
  return JSON.parse(start >= 0 && end > start ? clean.slice(start, end + 1) : clean);
}
