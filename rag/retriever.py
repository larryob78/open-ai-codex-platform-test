"""RAG retriever for Cannes Lions award-winning campaign insights.

Uses keyword-based retrieval with TF-IDF-style scoring to find the most
relevant award-winning campaigns for a given brief context. The retrieved
examples are injected into agent prompts to raise the creative bar.

For production use, swap the keyword retriever for a vector-based one using
NVIDIA NIM embedding endpoints (e.g., nvidia/nv-embedqa-e5-v5).
"""

import json
import os
import re
from dataclasses import dataclass


KNOWLEDGE_BASE_DIR = os.path.join(os.path.dirname(__file__), "knowledge_base")


@dataclass
class CampaignEntry:
    campaign: str
    brand: str
    agency: str
    year: int
    award: str
    category: str
    insight: str
    single_minded_proposition: str
    strategy: str
    creative_idea: str
    why_it_won: str
    effectiveness_notes: str

    def to_context_string(self) -> str:
        return (
            f"**{self.campaign}** ({self.brand}, {self.year}) - {self.award}\n"
            f"Agency: {self.agency}\n"
            f"Insight: {self.insight}\n"
            f"Single-Minded Proposition: {self.single_minded_proposition}\n"
            f"Strategy: {self.strategy}\n"
            f"Creative Idea: {self.creative_idea}\n"
            f"Why It Won: {self.why_it_won}\n"
            f"Effectiveness: {self.effectiveness_notes}\n"
        )

    @property
    def searchable_text(self) -> str:
        return " ".join([
            self.campaign, self.brand, self.agency, self.category,
            self.insight, self.single_minded_proposition, self.strategy,
            self.creative_idea, self.why_it_won, self.effectiveness_notes,
        ]).lower()


class CannesRetriever:
    """Retrieves relevant Cannes Lions campaign examples for RAG context."""

    def __init__(self) -> None:
        self.entries: list[CampaignEntry] = []
        self._load_knowledge_base()

    def _load_knowledge_base(self) -> None:
        for filename in sorted(os.listdir(KNOWLEDGE_BASE_DIR)):
            if not filename.endswith(".json"):
                continue
            filepath = os.path.join(KNOWLEDGE_BASE_DIR, filename)
            with open(filepath) as f:
                data = json.load(f)
            for item in data:
                self.entries.append(CampaignEntry(**item))

    def retrieve(self, query: str, top_k: int = 3,
                 award_filter: str | None = None) -> list[CampaignEntry]:
        """Retrieve the most relevant campaigns for a given query.

        Args:
            query: The search query (brand, industry, goal, etc.)
            top_k: Number of results to return.
            award_filter: Optional filter for award level ("gold", "silver", "bronze").

        Returns:
            List of the top_k most relevant CampaignEntry objects.
        """
        query_terms = set(re.findall(r"\w+", query.lower()))
        if not query_terms:
            return self.entries[:top_k]

        scored: list[tuple[float, CampaignEntry]] = []
        for entry in self.entries:
            if award_filter:
                if award_filter.lower() not in entry.award.lower():
                    continue

            text = entry.searchable_text
            # Simple term-frequency scoring
            score = sum(
                text.count(term) for term in query_terms if len(term) > 2
            )
            # Boost for matches in high-value fields
            smp_lower = entry.single_minded_proposition.lower()
            insight_lower = entry.insight.lower()
            for term in query_terms:
                if len(term) > 2:
                    if term in smp_lower:
                        score += 3
                    if term in insight_lower:
                        score += 2

            scored.append((score, entry))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [entry for _, entry in scored[:top_k]]

    def retrieve_context(self, query: str, top_k: int = 3,
                         award_filter: str | None = None) -> str:
        """Retrieve and format campaign examples as a context string.

        This is the main method used by agents to get RAG context.
        """
        entries = self.retrieve(query, top_k, award_filter)
        if not entries:
            return ""
        parts = [entry.to_context_string() for entry in entries]
        return "\n---\n\n".join(parts)

    def get_all_smps(self) -> list[str]:
        """Return all single-minded propositions for reference."""
        return [
            f"{e.brand}: {e.single_minded_proposition}"
            for e in self.entries
        ]

    def get_all_insights(self) -> list[str]:
        """Return all insights for reference."""
        return [
            f"{e.brand} ({e.campaign}): {e.insight}"
            for e in self.entries
        ]
