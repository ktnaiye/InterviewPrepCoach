// Shared helper for Cloudflare Pages Functions
import Anthropic from '@anthropic-ai/sdk';

export async function askClaude(apiKey, system, user, useSearch = false) {
  const anthropic = new Anthropic({ apiKey });
  
  const params = {
    model: 'claude-sonnet-4-6',
    max_tokens: 1500,
    system: system,
    messages: [{ role: 'user', content: user }]
  };

  if (useSearch) {
    params.tools = [{
      type: 'web_search_20250305',
      name: 'web_search',
      max_uses: 4,
      allowed_domains: [
        'glassdoor.co.uk',
        'indeed.co.uk',
        'totaljobs.com',
        'reed.co.uk',
        'thestudentroom.co.uk',
        'wikijob.co.uk',
        'prospects.ac.uk'
      ]
    }];
  }

  const response = await anthropic.messages.create(params);
  
  const text = response.content
    .filter(block => block.type === 'text')
    .map(block => block.text)
    .join('\n');
  
  const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
  return JSON.parse(cleaned);
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export function handleOptionsRequest() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
