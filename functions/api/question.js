// POST /api/question - Generate interview question
import { askClaude, jsonResponse, handleOptionsRequest } from '../_shared.js';

export async function onRequestPost(context) {
  try {
    const { role, level, type, company, jobDescription, researchNotes, supportingDocuments, history, questionNumber, totalQuestions } = await context.request.json();

    const systemPrompt = `You are an experienced, encouraging UK interview coach. You generate one realistic interview question at a time, tailored to the candidate's target role, seniority, and interview type.

CRITICAL: You MUST NOT repeat or closely resemble any questions already asked in this session. Check the history carefully and ensure each new question covers a DIFFERENT competency, skill, or scenario.

Default to UK interview conventions:
- Competency-based STAR questions (Situation, Task, Action, Result)
- Assessment-centre-style exercises for graduate schemes
- Success Profiles framework language for civil service or public sector roles

If job description is provided, ground the question in those specific responsibilities and requirements.

IMPORTANT - If supporting documents contain:
1. **Organisational values** (e.g., integrity, innovation, collaboration, customer focus) → Create BEHAVIOURAL questions specifically designed to assess those values. Ask for examples that demonstrate the candidate embodies these values.
2. **Technical requirements/skills** → When interview type is "Technical", generate questions that directly assess these specific technical skills, tools, frameworks, or knowledge areas mentioned in the documents.
3. **Interview format guidance** (e.g., "uses case studies", "values-based questions", "technical assessments") → Adapt your question style to match the documented interview format.
4. **Candidate's background (CV/cover letter)** → Tailor questions to their experience level and past roles.

If researchNotes contains real signal about this company's interview style (e.g. "they use case studies", "they focus on culture fit"), adjust accordingly. However, if researchNotes is generic or empty, ignore it and use standard UK interview practices.

Ensure variety across the session:
- Cover different competencies (leadership, teamwork, problem-solving, communication, technical skills, conflict resolution, etc.)
- Vary the scenario types (success stories, challenges overcome, failures/learnings, team situations, individual contributions)
- If previous questions focused on one area, choose a completely different area
- Make each question distinct and unique

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"question": "the interview question text"}`;

    const historyText = history && history.length > 0
      ? history.map((h, i) => `Q${i + 1}: ${h.question}\nCandidate's answer: ${h.answer}\nScore given: ${h.score}/10`).join('\n\n')
      : '';

    const userPrompt = `Company: ${company}
Target role: ${role}
Experience level: ${level}
Interview type: ${type}
This is question ${questionNumber} of ${totalQuestions}.
${jobDescription ? `\nJob description:\n${jobDescription}\n` : ''}
${supportingDocuments ? `\nSupporting documents (may include CV, cover letter, organisational values, technical requirements, interview tips):\n${supportingDocuments}\n\nIMPORTANT: Carefully review the supporting documents above. If they mention:
- Organisational values → create a BEHAVIOURAL question that assesses one of those values
- Technical skills/requirements → create a TECHNICAL question (if interview type is Technical) about those specific technologies
- Interview format guidance → follow that format
\n` : ''}
${researchNotes ? `\nResearch notes about this company's interview process:\n${researchNotes}\n` : ''}
${historyText ? `\nPrevious questions already asked this session (DO NOT repeat these or similar themes):\n${historyText}\n\nIMPORTANT: Your new question MUST cover a DIFFERENT competency or scenario than those listed above.\n` : 'This is the first question of the session.\n'}
Write the next interview question now.`;

    const result = await askClaude(context.env.ANTHROPIC_API_KEY, systemPrompt, userPrompt, false);
    return jsonResponse(result);
  } catch (error) {
    console.error('Question endpoint error:', error);
    return jsonResponse({ question: 'Tell me about a time you faced a challenging situation at work and how you handled it.' }, 500);
  }
}

export async function onRequestOptions() {
  return handleOptionsRequest();
}
