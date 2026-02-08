#!/usr/bin/env python3
"""Brief Writer 2026 - Web UI with real-time agent progress.

Run with: python web.py
Then open: http://localhost:5000
"""

import json
import os
import queue
import threading
from datetime import datetime, timezone

from flask import Flask, render_template, request, Response, jsonify

from agents import (
    ResearchAgent,
    StrategyAgent,
    CreativeDirectorAgent,
    BriefCompilerAgent,
    ReviewAgent,
)
from rag.retriever import CannesRetriever
from config.settings import OUTPUT_DIR

app = Flask(__name__, template_folder="web/templates", static_folder="web/static")


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate():
    data = request.json
    brand = data.get("brand", "")
    goal = data.get("goal", "")
    industry = data.get("industry", "")
    context = data.get("context", "")

    if not brand or not goal:
        return jsonify({"error": "Brand and goal are required"}), 400

    def event_stream():
        def send(event, data):
            return f"event: {event}\ndata: {json.dumps(data)}\n\n"

        try:
            # Step 0: RAG
            yield send("status", {"agent": "rag", "status": "running",
                                  "message": "Loading Cannes Lions knowledge base..."})
            retriever = CannesRetriever()
            query = f"{brand} {goal} {industry}"
            research_ctx = retriever.retrieve_context(query, top_k=2)
            strategy_ctx = retriever.retrieve_context(
                f"{goal} strategy audience insight proposition", top_k=3)
            creative_ctx = retriever.retrieve_context(
                f"{goal} creative idea fame emotion", top_k=3)
            review_ctx = retriever.retrieve_context(query, top_k=2, award_filter="gold")
            yield send("status", {"agent": "rag", "status": "done",
                                  "message": f"Loaded {len(retriever.entries)} award-winning campaigns"})

            # Step 1: Research
            yield send("status", {"agent": "research", "status": "running",
                                  "message": "Gathering market context, competitors, audience data..."})
            research_agent = ResearchAgent()
            research_output = research_agent.research(
                brand, goal, industry, context, rag_context=research_ctx)
            yield send("result", {"agent": "research", "content": research_output})
            yield send("status", {"agent": "research", "status": "done",
                                  "message": "Research complete"})

            # Step 2: Strategy
            yield send("status", {"agent": "strategy", "status": "running",
                                  "message": "Defining objectives, insight, single-minded proposition..."})
            strategy_agent = StrategyAgent()
            strategy_output = strategy_agent.strategize(
                research_output, goal, rag_context=strategy_ctx)
            yield send("result", {"agent": "strategy", "content": strategy_output})
            yield send("status", {"agent": "strategy", "status": "done",
                                  "message": "Strategy complete"})

            # Step 3: Creative
            yield send("status", {"agent": "creative", "status": "running",
                                  "message": "Shaping the big idea, tone, visuals, taglines..."})
            creative_agent = CreativeDirectorAgent()
            creative_output = creative_agent.direct(
                strategy_output, brand, rag_context=creative_ctx)
            yield send("result", {"agent": "creative", "content": creative_output})
            yield send("status", {"agent": "creative", "status": "done",
                                  "message": "Creative direction complete"})

            # Step 4: Compile
            yield send("status", {"agent": "compiler", "status": "running",
                                  "message": "Assembling the IPA-standard creative brief..."})
            compiler_agent = BriefCompilerAgent()
            compiled_brief = compiler_agent.compile(
                research_output, strategy_output, creative_output, brand, goal)
            yield send("result", {"agent": "compiler", "content": compiled_brief})
            yield send("status", {"agent": "compiler", "status": "done",
                                  "message": "Brief compiled"})

            # Step 5: Review
            yield send("status", {"agent": "review", "status": "running",
                                  "message": "Evaluating against IPA criteria and Cannes benchmarks..."})
            review_agent = ReviewAgent()
            final_output = review_agent.review(compiled_brief, rag_context=review_ctx)
            yield send("result", {"agent": "review", "content": final_output})
            yield send("status", {"agent": "review", "status": "done",
                                  "message": "Review complete"})

            # Save
            os.makedirs(OUTPUT_DIR, exist_ok=True)
            timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
            slug = brand.lower().replace(" ", "_")[:30]
            filename = f"brief_{slug}_{timestamp}.md"
            filepath = os.path.join(OUTPUT_DIR, filename)
            brief_content = (
                f"# Creative Brief: {brand}\n\n"
                f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
                f"**Campaign Goal:** {goal}\n"
                f"**Powered by:** NVIDIA NIM + Cannes Lions RAG\n"
                f"**Standard:** IPA/BetterBriefs Best Practice\n\n---\n\n"
                f"## Research\n\n{research_output}\n\n---\n\n"
                f"## Strategy\n\n{strategy_output}\n\n---\n\n"
                f"## Creative Direction\n\n{creative_output}\n\n---\n\n"
                f"## Compiled Brief\n\n{compiled_brief}\n\n---\n\n"
                f"## Review & Final Version\n\n{final_output}\n"
            )
            with open(filepath, "w") as f:
                f.write(brief_content)

            yield send("complete", {"filename": filename, "filepath": filepath})

        except Exception as exc:
            yield send("error", {"message": str(exc)})

    return Response(event_stream(), mimetype="text/event-stream")


if __name__ == "__main__":
    app.run(debug=True, port=5000)
