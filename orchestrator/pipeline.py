"""Orchestrator pipeline that coordinates the five agents in sequence.

NVIDIA Blueprint pattern:
  Input -> RAG Retrieval -> Research -> Strategy -> Creative Direction -> Compile -> Review -> Output

Each agent receives relevant Cannes Lions award-winning campaign examples via
RAG to raise the bar on strategic and creative quality. All agents follow
IPA/BetterBriefs best-practice standards.
"""

import os
from datetime import datetime, timezone
from rich.console import Console
from rich.panel import Panel
from rich.markdown import Markdown

from agents import (
    ResearchAgent,
    StrategyAgent,
    CreativeDirectorAgent,
    BriefCompilerAgent,
    ReviewAgent,
)
from rag.retriever import CannesRetriever
from config.settings import OUTPUT_DIR

console = Console()


def run_pipeline(
    product_or_brand: str,
    campaign_goal: str,
    industry: str = "",
    additional_context: str = "",
) -> str:
    """Run the full creative brief pipeline and return the final brief.

    The pipeline follows the NVIDIA Blueprint pattern with RAG enrichment:
    1. Retrieve relevant Cannes Lions award-winning campaign examples
    2. Research Agent gathers market context (enriched with RAG)
    3. Strategy Agent defines strategic direction (enriched with RAG)
    4. Creative Director Agent develops creative vision (enriched with RAG)
    5. Brief Compiler Agent assembles the full brief
    6. Review Agent evaluates and refines (benchmarked against RAG examples)
    """

    # --- Step 0: RAG Retrieval ---
    console.print(Panel(
        "[bold magenta]RAG System: Cannes Lions Knowledge Base[/bold magenta]\n"
        "Retrieving award-winning campaign insights for context enrichment..."
    ))
    retriever = CannesRetriever()
    query = f"{product_or_brand} {campaign_goal} {industry}"

    # Retrieve different context for different agent stages
    research_context = retriever.retrieve_context(query, top_k=2)
    strategy_context = retriever.retrieve_context(
        f"{campaign_goal} strategy audience insight proposition", top_k=3
    )
    creative_context = retriever.retrieve_context(
        f"{campaign_goal} creative idea fame emotion", top_k=3
    )
    review_context = retriever.retrieve_context(query, top_k=2, award_filter="gold")

    num_entries = len(retriever.entries)
    console.print(
        f"[green]Loaded {num_entries} award-winning campaigns "
        f"(Gold, Silver, Bronze).[/green]\n"
    )

    # --- Step 1: Research ---
    console.print(Panel(
        "[bold cyan]Agent 1/5: Research Agent[/bold cyan]\n"
        "Gathering market context, competitors, and audience data...\n"
        "[dim]IPA Principle: Start with strategy, not tactics.[/dim]"
    ))
    research_agent = ResearchAgent()
    research_output = research_agent.research(
        product_or_brand, campaign_goal, industry, additional_context,
        rag_context=research_context,
    )
    console.print("[green]Research complete.[/green]\n")

    # --- Step 2: Strategy ---
    console.print(Panel(
        "[bold cyan]Agent 2/5: Strategy Agent[/bold cyan]\n"
        "Defining objectives, audience, insight, and single-minded proposition...\n"
        "[dim]IPA Principle: Single-minded. Not a shopping list.[/dim]"
    ))
    strategy_agent = StrategyAgent()
    strategy_output = strategy_agent.strategize(
        research_output, campaign_goal,
        rag_context=strategy_context,
    )
    console.print("[green]Strategy complete.[/green]\n")

    # --- Step 3: Creative Direction ---
    console.print(Panel(
        "[bold cyan]Agent 3/5: Creative Director Agent[/bold cyan]\n"
        "Shaping tone, the big idea, visuals, and taglines...\n"
        "[dim]IPA Principle: Emotion over information. Aim for fame.[/dim]"
    ))
    creative_agent = CreativeDirectorAgent()
    creative_output = creative_agent.direct(
        strategy_output, product_or_brand,
        rag_context=creative_context,
    )
    console.print("[green]Creative direction complete.[/green]\n")

    # --- Step 4: Compile Brief ---
    console.print(Panel(
        "[bold cyan]Agent 4/5: Brief Compiler Agent[/bold cyan]\n"
        "Assembling the IPA-standard creative brief...\n"
        "[dim]IPA Principle: Clear, concise, jargon-free.[/dim]"
    ))
    compiler_agent = BriefCompilerAgent()
    compiled_brief = compiler_agent.compile(
        research_output, strategy_output, creative_output,
        product_or_brand, campaign_goal,
    )
    console.print("[green]Brief compiled.[/green]\n")

    # --- Step 5: Review ---
    console.print(Panel(
        "[bold cyan]Agent 5/5: Review Agent[/bold cyan]\n"
        "Evaluating against IPA criteria and Cannes benchmarks...\n"
        "[dim]Scoring: Strategic Clarity, SMP, Audience, Insight, "
        "Creative Ambition, Clarity, Measurability, Desired Response[/dim]"
    ))
    review_agent = ReviewAgent()
    final_output = review_agent.review(
        compiled_brief,
        rag_context=review_context,
    )
    console.print("[green]Review complete.[/green]\n")

    # --- Save output ---
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    slug = product_or_brand.lower().replace(" ", "_")[:30]
    filename = f"brief_{slug}_{timestamp}.md"
    filepath = os.path.join(OUTPUT_DIR, filename)

    brief_content = (
        f"# Creative Brief: {product_or_brand}\n\n"
        f"**Generated:** {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}\n"
        f"**Campaign Goal:** {campaign_goal}\n"
        f"**Powered by:** NVIDIA NIM + Cannes Lions RAG Knowledge Base\n"
        f"**Standard:** IPA/BetterBriefs Best Practice Framework\n\n"
        f"---\n\n"
        f"## Research Findings\n\n{research_output}\n\n"
        f"---\n\n"
        f"## Strategic Direction\n\n{strategy_output}\n\n"
        f"---\n\n"
        f"## Creative Direction\n\n{creative_output}\n\n"
        f"---\n\n"
        f"## Compiled Brief\n\n{compiled_brief}\n\n"
        f"---\n\n"
        f"## Review & Final Version\n\n{final_output}\n"
    )

    with open(filepath, "w") as f:
        f.write(brief_content)

    console.print(Panel(f"[bold green]Brief saved to {filepath}[/bold green]"))
    console.print(Markdown(final_output))

    return final_output
