const express = require('express');
const dotenv = require('dotenv');
const Anthropic = require('@anthropic-ai/sdk');

dotenv.config();

const app = express();
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

app.use(express.json());
app.use(express.static('public'));

// Helper function to call Claude with optional web search
async function askClaude(system, user, useSearch = false) {
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

// POST /api/research - Research company interview experiences
app.post('/api/research', async (req, res) => {
  try {
    const { company, jobDescription } = req.body;
    
    if (!company) {
      return res.json({ summary: '' });
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

    const result = await askClaude(systemPrompt, userPrompt, true);
    res.json(result);
  } catch (error) {
    console.error('Research endpoint error:', error);
    res.status(500).json({ summary: '', found_specific_info: false });
  }
});

// POST /api/question - Generate interview question
app.post('/api/question', async (req, res) => {
  try {
    const { role, level, type, company, jobDescription, researchNotes, history, questionNumber, totalQuestions } = req.body;

    const systemPrompt = `You are an experienced, encouraging UK interview coach. You generate one realistic interview question at a time, tailored to the candidate's target role, seniority, and interview type.

Default to UK interview conventions:
- Competency-based STAR questions (Situation, Task, Action, Result)
- Assessment-centre-style exercises for graduate schemes
- Success Profiles framework language for civil service or public sector roles

If job description is provided, ground the question in those specific responsibilities and requirements.

If researchNotes contains real signal about this company's interview style (e.g. "they use case studies", "they focus on culture fit"), adjust accordingly. However, if researchNotes is generic or empty, ignore it and use standard UK interview practices.

Vary question topics across the session and avoid repeating themes already covered in the history.

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
${researchNotes ? `\nResearch notes about this company's interview process:\n${researchNotes}\n` : ''}
${historyText ? `\nPrevious questions and answers this session:\n${historyText}\n` : 'This is the first question of the session.\n'}
Write the next interview question now.`;

    const result = await askClaude(systemPrompt, userPrompt, false);
    res.json(result);
  } catch (error) {
    console.error('Question endpoint error:', error);
    res.status(500).json({ question: 'Tell me about a time you faced a challenging situation at work and how you handled it.' });
  }
});

// POST /api/evaluate - Evaluate candidate answer
app.post('/api/evaluate', async (req, res) => {
  try {
    const { question, answer, role, level, type, company, researchNotes, jobDescription } = req.body;

    const systemPrompt = `You are an experienced, encouraging UK interview coach giving direct, specific, actionable feedback. Be honest about weaknesses but constructive in tone.

Evaluate the answer's structure using the STAR method (Situation, Task, Action, Result) where the question calls for it.

If researchNotes mentions things this company's interviewers specifically probe for (e.g. "they look for evidence of teamwork", "they value data-driven decisions"), or Success Profiles elements for public sector roles (e.g. "Seeing the Big Picture", "Making Effective Decisions"), weigh the answer against those specific criteria rather than generic best practice.

Give 2-3 items each for strengths and improvements.

Respond with ONLY a JSON object, no markdown fences, no preamble, in this exact shape:
{"score": <integer 1-10>, "summary": "one or two sentence overall take", "strengths": ["short point", "short point"], "improvements": ["short point", "short point"]}`;

    const userPrompt = `Company: ${company}
Target role: ${role}
Experience level: ${level}
Interview type: ${type}
${researchNotes ? `\nResearch notes about this company's interview process:\n${researchNotes}\n` : ''}
${jobDescription ? `\nJob description:\n${jobDescription}\n` : ''}
Interview question: "${question}"

Candidate's answer: "${answer}"

Evaluate this answer.`;

    const result = await askClaude(systemPrompt, userPrompt, false);
    res.json(result);
  } catch (error) {
    console.error('Evaluate endpoint error:', error);
    res.status(500).json({
      score: 5,
      summary: 'Unable to evaluate at this time.',
      strengths: ['Answer provided'],
      improvements: ['Try again']
    });
  }
});

// POST /api/summary - Summarise full session
app.post('/api/summary', async (req, res) => {
  try {
    const { history, company, role, level, type, researchNotes, jobDescription } = req.body;

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

    const result = await askClaude(systemPrompt, userPrompt, false);
    res.json(result);
  } catch (error) {
    console.error('Summary endpoint error:', error);
    const avgScore = history && history.length > 0
      ? (history.reduce((a, h) => a + h.score, 0) / history.length).toFixed(1)
      : '0';
    res.status(500).json({
      headline: 'Session complete',
      summary: `You completed ${history?.length || 0} questions with an average score of ${avgScore}/10.`,
      consistent_strengths: ['Practice completed'],
      focus_areas: ['Continue practising']
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Interview Coach server running on http://localhost:${PORT}`);
});
