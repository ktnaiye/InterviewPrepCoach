// POST /api/summary - Summarise full session
import { askClaude, jsonResponse, handleOptionsRequest } from '../_shared.js';

export async function onRequestPost(context) {
  try {
    const { history, company, role, level, type, researchNotes, jobDescription } = await context.request.json();

    const systemPrompt = `You are an experienced UK interview coach summarising a full practice session. 

Call out whether the candidate's answers matched what researchNotes suggests this company or sector looks for (e.g. if researchNotes says "they focus on teamwork", did the candidate demonstrate that? If it mentions Success Profiles for public sector, did they address those competencies?).

Be encouraging but honest about patterns across the session.

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"headline": "short encouraging headline, under 8 words", "summary": "two sentence overall summary", "consistent_strengths": ["point", "point"], "focus_areas": ["point", "point"]}`;

    const historyText = history.map((h, i) =>
      `Q${i + 1}: ${h.question}\nAnswer: ${h.answer}\nScore: ${h.score}/10\nStrengths noted: ${h.strengths.join('; ')}\nImprovements noted: ${h.improvements.join('; ')}`
    ).join('\n\n');

    const userPrompt = `Company: ${company}
Target role: ${role}
Experience level: ${level}
Interview type: ${type}
${researchNotes ? `\nResearch notes about this company's interview process:\n${researchNotes}\n` : ''}
${jobDescription ? `\nJob description:\n${jobDescription}\n` : ''}
Full session:
${historyText}

Summarise this practice session.`;

    const result = await askClaude(context.env.ANTHROPIC_API_KEY, systemPrompt, userPrompt, false);
    return jsonResponse(result);
  } catch (error) {
    console.error('Summary endpoint error:', error);
    const avgScore = history && history.length > 0
      ? (history.reduce((a, h) => a + h.score, 0) / history.length).toFixed(1)
      : '0';
    return jsonResponse({
      headline: 'Session complete',
      summary: `You completed ${history?.length || 0} questions with an average score of ${avgScore}/10.`,
      consistent_strengths: ['Practice completed'],
      focus_areas: ['Continue practising']
    }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptionsRequest();
}
