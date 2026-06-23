# AI Usage Log

This file documents how AI was used while building AlphaLens. The assignment allows and encourages AI usage, so I used AI as a coding and review assistant during development.

## Project

Project name: AlphaLens  
Assignment: InsideIIM x Altuni AI Labs AI Investment Research Agent  
Main stack: React, Node.js, Express, LangGraph.js, LangChain.js, Gemini

## Why I used AI

I used AI for:

- Reviewing the existing project structure
- Finding weak parts in the first implementation
- Improving the agent workflow
- Refactoring backend logic
- Improving frontend presentation
- Writing safer prompts for structured JSON output
- Debugging package and environment issues
- Improving the README and submission documentation

I did not use AI to avoid understanding the project. I used it like a pair programmer and reviewed the final code so I can explain the implementation.

## Main prompts and actions

### Prompt 1

```text
Please see this whole project properly. If everything is ok, make proper modification which impresses the interviewers.
```

What happened after this prompt:

- The project files were reviewed.
- The original README was found to be too short for the assignment.
- The Finance Agent and Risk Agent were found to be using hard-coded placeholder values.
- The backend was improved so finance, risk, and decision-making are LLM-driven.
- Tavily search was made optional.
- A JSON parsing helper was added.
- The frontend was improved into a dashboard-style investment memo.

### Prompt 2

```text
Front end is ok make it like that it doesn't copy from AI.
```

What happened after this prompt:

- The frontend code was left unchanged.
- The documentation style was adjusted to sound more natural and personally explainable.
- The AI usage file was rewritten as a simple build journal instead of a generic AI-generated note.

### Prompt 3

```text
Please make one updated README.md file proper which tell each and every thing about the project more over AI_USAGE_LOG.md make it proper also.
```

What happened after this prompt:

- The README was expanded into a complete evaluator-facing guide.
- The AI usage log was made more detailed.
- Setup steps, architecture, API shape, agent roles, validation commands, limitations, and submission notes were added.

## AI-assisted changes made in the code

### Backend

- Added a stronger multi-agent workflow through LangGraph.
- Updated `researchAgent.js` to generate company context and optionally use Tavily.
- Updated `financeAgent.js` so it generates financial quality analysis using the LLM.
- Updated `riskAgent.js` so it generates risk analysis using the LLM.
- Updated `decisionAgent.js` so the final recommendation is generated using the previous agent outputs.
- Updated `investmentGraph.js` to pass richer state between agents.
- Updated `researchRoutes.js` to trim and validate the company input.
- Updated `llmService.js` to load environment variables safely and support `GEMINI_API_KEY`.
- Updated `tavilyService.js` to use the installed `@tavily/core` package.
- Added `utils/json.js` to handle LLM JSON parsing safely.

### Frontend

- Improved `client/src/App.jsx` into a dashboard view.
- Added sections for final decision, confidence, company brief, scorecard, strengths, risks, bull case, bear case, and sources.
- Added better error handling and loading state.
- Added `VITE_API_URL` support for easier deployment.

### Documentation

- Rewrote `README.md` with all required assignment sections.
- Added this AI usage log for the assignment bonus requirement.
- Added `.env.example` files for backend and frontend.

## Important decisions

- Multi-agent flow: I used separate agents because investment research has clear stages: research, finance, risk, and decision.
- LangGraph: I used it because it makes the agent sequence explicit and matches the assignment stack.
- Optional Tavily: I wanted the project to work even if the reviewer only adds a Gemini key.
- Conservative recommendation: the final agent is instructed to be careful when risk is high or evidence is weak.
- JSON output: the agents return JSON so the frontend can display results consistently.
- No trading execution: the project is a research prototype, not a stock trading app.

## Problems found and fixed

- Problem: Finance and Risk agents used fixed scores.  
  Fix: Converted them to LLM-based agents.

- Problem: LLM responses can include markdown or invalid JSON.  
  Fix: Added a JSON parsing utility with fallback handling.

- Problem: Backend import failed when environment variables were not loaded early enough.  
  Fix: Loaded `dotenv` inside the LLM and Tavily services.

- Problem: The LangChain Tavily import path did not work with the installed package version.  
  Fix: Switched to the installed `@tavily/core` package.

- Problem: The original README did not fully answer the assignment sections.  
  Fix: Rewrote the README with setup, architecture, decisions, examples, and improvements.

## Verification done

Frontend lint:

```bash
cd client
npm.cmd run lint
```

Frontend production build:

```bash
cd client
npm.cmd run build
```

Backend import check:

```bash
cd server
node -e "require('./app'); console.log('server app ok')"
```

These checks passed.

## What I personally need to verify before final submission

- Run the full app with my actual `GEMINI_API_KEY`.
- Try at least three companies.
- Take screenshots or copy outputs for example runs if required.
- Confirm no real `.env` file is included in the zip.
- Confirm `node_modules` is not included in the zip.
- Be ready to explain each agent and why it exists.

## My explanation of the final project

AlphaLens starts with a company name from the user. The frontend sends it to the backend. The backend runs a LangGraph workflow. The Research Agent creates business context, the Finance Agent evaluates financial quality, the Risk Agent checks risk, and the Decision Agent makes the final `INVEST` or `PASS` call. The frontend then presents the result as an investment memo.

## Final note

AI helped speed up development and improve the quality of the project, but the final implementation is still something I can read, run, and explain.
