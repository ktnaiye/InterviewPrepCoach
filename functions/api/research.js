// POST /api/research - Research company interview experiences
import { askClaude, jsonResponse, handleOptionsRequest } from '../_shared.js';

export async function onRequestPost(context) {
  try {
    const { company, jobDescription } = await context.request.json();
    
    if (!company) {
      return jsonResponse({ summary: '' });
    }

    const systemPrompt = `You are researching interview experiences for a UK job search. Search for real interview experiences for this company from UK-relevant sources:
- Glassdoor UK
- Indeed UK
- TotalJobs
- Reed
- TheStudentRoom
- WikiJob
- Prospects.ac.uk

Prioritise UK-specific and recent (last 2 years) sources.

Pay attention to:
- Interview format: Is it UK competency-based / STAR-method? Assessment centre? Success Profiles framework (for public sector)?
- Specific things candidates say to watch out for
- Company-specific interview quirks or patterns

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"summary": "3-5 sentence research summary", "found_specific_info": true or false}`;

    const userPrompt = `Company: ${company}${jobDescription ? `\n\nJob description:\n${jobDescription}` : ''}

Research recent UK interview experiences for this company.`;

    const result = await askClaude(context.env.ANTHROPIC_API_KEY, systemPrompt, userPrompt, true);
    return jsonResponse(result);
  } catch (error) {
    console.error('Research endpoint error:', error);
    return jsonResponse({ summary: '', found_specific_info: false }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptionsRequest();
}
