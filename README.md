# Brief Writer 2026

Multi-agent creative brief generator powered by **NVIDIA NIM Inference Microservices**, built on **IPA/BetterBriefs best-practice standards**, and enriched with a **RAG knowledge base of Cannes Lions award-winning campaigns**.

## Architecture

```
                         ┌─────────────────────┐
                         │   Cannes Lions RAG   │
                         │   Knowledge Base     │
                         │  (Gold/Silver/Bronze) │
                         └────────┬────────────┘
                                  │ context
                                  ▼
User Input ──► Research Agent ──► Strategy Agent ──► Creative Director ──► Brief Compiler ──► Review Agent ──► Output
                  │                   │                    │                                       │
                  │                   │                    │                                       │
              IPA: Start          IPA: Single-         IPA: Emotion              IPA: 8-point
              with strategy       Minded Proposition   over information          quality checklist
```

### The 5 Agents

| # | Agent | Role | IPA Principle |
|---|-------|------|---------------|
| 1 | **Research Agent** | Market landscape, competitors, audience, cultural tensions | Start with strategy, not tactics |
| 2 | **Strategy Agent** | Objective, target audience, insight, SMP, desired response | Single-minded proposition; binary choices |
| 3 | **Creative Director Agent** | Tone, big idea, taglines, visual direction, channels | Emotion over information; creative ladder |
| 4 | **Brief Compiler Agent** | Assembles IPA-standard 19-section creative brief | Clear, concise, jargon-free |
| 5 | **Review Agent** | Scores against 8 IPA criteria; produces revised brief | Effectiveness benchmarking |

### RAG Knowledge Base

The system includes a curated knowledge base of **18 Cannes Lions award-winning campaigns** (Gold, Silver, Bronze) covering:

- Single-minded propositions from world-class work
- Strategic insights and human truths
- Creative ideas and execution approaches
- Effectiveness data and business results

Campaigns include: Fearless Girl, Dove Real Beauty Sketches, Whopper Detour, It's a Tide Ad, Spotify Wrapped, Moldy Whopper, Nike Dream Crazy, and more.

Each agent receives relevant examples via RAG to calibrate output quality against world-class benchmarks.

## Setup

### 1. Prerequisites

- Python 3.11+
- An NVIDIA Developer account

### 2. Get your NVIDIA NIM API key

1. Sign up at [developer.nvidia.com](https://developer.nvidia.com)
2. Go to [build.nvidia.com](https://build.nvidia.com)
3. Select a model (default: `meta/llama-3.1-70b-instruct`)
4. Generate an API key

### 3. Install

```bash
# Clone and enter the repo
git clone <repo-url>
cd open-ai-codex-platform-test

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your NVIDIA_API_KEY
```

### 4. Run

**Interactive mode:**
```bash
python main.py
```

**CLI mode:**
```bash
python main.py --brand "Acme Corp" --goal "Launch new product line" --industry "Technology"
```

Output briefs are saved as Markdown files in the `output/` directory.

## IPA/BetterBriefs Framework

This tool implements the brief structure recommended by the [IPA](https://ipa.co.uk) (Institute of Practitioners in Advertising) and the [BetterBriefs](https://www.betterbriefs.com/) project by Mark Ritson:

1. Campaign Title
2. Date
3. Why This Brief Exists
4. Project Overview
5. Campaign Objective (single, measurable)
6. Target Audience (vivid, specific)
7. Insight (human truth)
8. **Single-Minded Proposition** (ONE thought)
9. Reasons to Believe
10. Desired Response (Think / Feel / Do)
11. Tone & Voice
12. The Big Idea
13. Visual Direction
14. Tagline Options
15. Deliverables
16. Success Metrics
17. Competitive Landscape
18. Mandatories & Guardrails
19. Budget & Timing Notes

## Extending the Knowledge Base

Add more campaigns to the RAG system by creating or editing JSON files in `rag/knowledge_base/`. Each entry should follow this structure:

```json
{
  "campaign": "Campaign Name",
  "brand": "Brand Name",
  "agency": "Agency Name",
  "year": 2024,
  "award": "Gold",
  "category": "Category",
  "insight": "The human truth...",
  "single_minded_proposition": "ONE thought...",
  "strategy": "The strategic approach...",
  "creative_idea": "The creative execution...",
  "why_it_won": "Why it was awarded...",
  "effectiveness_notes": "Business results..."
}
```

## Project Structure

```
.
├── main.py                    # CLI entry point
├── requirements.txt           # Python dependencies
├── .env.example               # Environment template
├── config/
│   └── settings.py            # Configuration from env vars
├── agents/
│   ├── base.py                # Base agent with NVIDIA NIM client
│   ├── research_agent.py      # Agent 1: Market research
│   ├── strategy_agent.py      # Agent 2: Strategy & SMP
│   ├── creative_director_agent.py  # Agent 3: Creative vision
│   ├── brief_compiler_agent.py     # Agent 4: Brief assembly
│   └── review_agent.py        # Agent 5: Quality review
├── models/
│   └── brief.py               # Pydantic data models
├── orchestrator/
│   └── pipeline.py            # Agent coordination pipeline
├── rag/
│   ├── retriever.py           # RAG retrieval system
│   └── knowledge_base/
│       ├── cannes_gold.json   # Grand Prix & Gold winners
│       ├── cannes_silver.json # Silver winners
│       └── cannes_bronze.json # Bronze winners
└── output/                    # Generated briefs (gitignored)
```

## References

- [IPA Briefing an Agency Best Practice Guide](https://ipa.co.uk/knowledge/documents/briefing-an-agency-best-practice-guide)
- [BetterBriefs: The Best Way for a Client to Brief an Agency](https://www.betterbriefs.com/) (co-authored with Mark Ritson & IPA)
- [IPA Creative Effectiveness Research](https://ipa.co.uk/knowledge/effectiveness-research-analysis/creative-effectiveness)
- [NVIDIA NIM Microservices](https://developer.nvidia.com/nim)
- [NVIDIA API Catalog](https://build.nvidia.com/models)
