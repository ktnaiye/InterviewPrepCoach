// POST /api/evaluate - Evaluate candidate answer
import { askClaude, jsonResponse, handleOptionsRequest } from '../_shared.js';

export async function onRequestPost(context) {
  try {
    const { question, answer, role, level, type, company, researchNotes, jobDescription, supportingDocuments } = await context.request.json();

    const systemPrompt = `You are an experienced, encouraging UK interview coach giving direct, specific, actionable feedback. Be honest about weaknesses but constructive in tone.

Evaluate the answer's structure using the STAR method (Situation, Task, Action, Result) where the question calls for it.

If supporting documents (CV, cover letter) are provided, reference them to see if the candidate's answer aligns with their stated experience and skills.

If researchNotes mentions things this company's interviewers specifically probe for (e.g. "they look for evidence of teamwork", "they value data-driven decisions"), or Success Profiles elements for public sector roles (e.g. "Seeing the Big Picture", "Making Effective Decisions"), weigh the answer against those specific criteria rather than generic best practice.

Give 2-3 items each for strengths and improvements.

Also provide a revised version of their answer that incorporates all the improvements. When writing the revised answer:
- Use simple, clear sentences (avoid complex sentence structures)
- Write in a natural, conversational tone as if the candidate is speaking
- DO NOT use em-dashes (—) or other complex punctuation
- Keep it authentic and personal
- Use "I" statements and natural language
- Make it sound like how someone would actually speak in an interview
- Focus on clarity over formality

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"score": <integer 1-10>, "summary": "one or two sentence overall take", "strengths": ["short point", "short point"], "improvements": ["short point", "short point"], "revised_answer": "A revised version of their answer incorporating all improvements, using simple conversational language, natural tone, no em-dashes, and clear sentence structure that sounds like authentic speech"}`;

    const userPrompt = `Company: ${company}
Target role: ${role}
Experience level: ${level}
Interview type: ${type}
${researchNotes ? `\nResearch notes about this company's interview process:\n${researchNotes}\n` : ''}
${jobDescription ? `\nJob description:\n${jobDescription}\n` : ''}
${supportingDocuments ? `\nCandidate's background (from CV/Cover letter):\n${supportingDocuments}\n` : ''}
Interview question: "${question}"

Candidate's answer: "${answer}"

Evaluate this answer.`;

    const result = await askClaude(context.env.ANTHROPIC_API_KEY, systemPrompt, userPrompt, false);
    return jsonResponse(result);
  } catch (error) {
    console.error('Evaluate endpoint error:', error);
    return jsonResponse({
      score: 5,
      summary: 'Unable to evaluate at this time.',
      strengths: ['Answer provided'],
      improvements: ['Try again'],
      revised_answer: ''
    }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptionsRequest();
}
