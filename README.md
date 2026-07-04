# Grace Interview Coach 🎯

An AI-powered interview practice platform designed for UK job seekers, featuring company research, intelligent question generation, and STAR method evaluation.

## ✨ Features

- 🔍 **UK Company Research**: Searches Glassdoor UK, Indeed UK, TotalJobs, Reed, and other UK job sites for real interview insights
- 🎯 **Tailored Questions**: Generates role-specific questions using UK interview conventions (STAR method, competency-based, Success Profiles for public sector)
- 📊 **Detailed Feedback**: Provides scores, strengths, and improvement areas for each answer
- 📝 **Session Summary**: Complete review of all Q&A with personalised recommendations
- 🎤 **Dual Input Modes**: Type your answers or speak them out loud
- 🌍 **Global Deployment**: Hosted on Cloudflare Pages for worldwide access

## 🚀 Live Demo

**[Try it now →](https://grace-interviewcoach.pages.dev)**

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Backend**: Cloudflare Pages Functions (serverless)
- **AI**: Anthropic Claude Sonnet 4.6 with web search
- **Deployment**: Cloudflare Pages
- **Features**: Web Search API for company research

## 🏗️ Project Structure

```
├── public/
│   └── index.html          # Main application
├── functions/
│   ├── _shared.js          # Shared utilities
│   └── api/
│       ├── research.js     # Company research endpoint
│       ├── question.js     # Question generation
│       ├── evaluate.js     # Answer evaluation
│       └── summary.js      # Session summary
├── server.js               # Express server (local dev)
└── wrangler.toml           # Cloudflare config
```

## 💻 Local Development

### Prerequisites
- Node.js 18+
- Anthropic API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/ktnaiye/InterviewPrepCoach.git
cd InterviewPrepCoach
```

2. Install dependencies:
```bash
npm install
```

3. Create `.dev.vars` file:
```
ANTHROPIC_API_KEY=your-api-key-here
```

4. Run locally with Cloudflare Pages:
```bash
npm run dev
```

Or run the Express server:
```bash
node server.js
```

## 🚀 Deployment

Deploy to Cloudflare Pages:

```bash
npm run deploy
```

Don't forget to add `ANTHROPIC_API_KEY` in the Cloudflare Dashboard under Environment Variables.

## 🎓 Key Learnings

This project demonstrates:
- Full-stack serverless architecture
- AI integration with Anthropic Claude
- Web search API implementation
- UK-specific interview conventions
- Real-time feedback systems
- Cloudflare Pages deployment

## 📄 License

MIT License - feel free to use this for your own projects!

## 👤 Author

**Kaden** - [GitHub](https://github.com/ktnaiye)

---

Built with ❤️ to help UK job seekers ace their interviews
