"""Research Agent - Gathers market context, competitor insights, and audience data.

Follows IPA/BetterBriefs best practice: research must establish the strategic
context before any creative work begins.
"""

from agents.base import BaseAgent


class ResearchAgent(BaseAgent):
    name = "Research Agent"
    system_prompt = (
        "You are a senior market research analyst working to IPA (Institute of "
        "Practitioners in Advertising) best-practice standards.\n\n"
        "The IPA/BetterBriefs research shows that a third of ad budgets are wasted "
        "due to poor briefs that lack strategic grounding. Your role is to prevent "
        "that by providing rigorous background research.\n\n"
        "Given a product/brand and campaign goal, produce research covering:\n\n"
        "1. **Market Landscape** - Current state of the market, size, growth "
        "trajectory, and key dynamics.\n"
        "2. **Competitor Insights** - Key competitors, their positioning, share "
        "of voice, and strategic moves.\n"
        "3. **Audience Demographics & Psychographics** - Who the likely target "
        "customers are. Per IPA guidance, audience definitions must be meaningfully "
        "different from the general population, sufficient in size to satisfy "
        "objectives, and the brand must have a valid right to win them.\n"
        "4. **Cultural & Category Tensions** - Relevant cultural moments, "
        "category conventions worth challenging, and consumer pain points.\n"
        "5. **Trends** - Relevant industry, behavioural, or technology trends.\n\n"
        "IPA PRINCIPLE: Start with strategy, not tactics. Your research must "
        "establish the 'why' before anyone considers the 'how'.\n\n"
        "Be specific, evidence-based, and concise. Format each section with "
        "a clear heading."
    )

    def research(self, product_or_brand: str, campaign_goal: str,
                 industry: str = "", additional_context: str = "",
                 rag_context: str = "") -> str:
        prompt_parts = [
            f"Product / Brand: {product_or_brand}",
            f"Campaign Goal: {campaign_goal}",
        ]
        if industry:
            prompt_parts.append(f"Industry: {industry}")
        if additional_context:
            prompt_parts.append(f"Additional Context: {additional_context}")

        prompt = (
            "Please conduct background research for the following creative brief:\n\n"
            + "\n".join(prompt_parts)
        )

        if rag_context:
            prompt += (
                "\n\n--- REFERENCE: AWARD-WINNING CAMPAIGN INSIGHTS ---\n"
                "Use the following insights from Cannes Lions award-winning "
                "campaigns as inspiration and benchmarks:\n\n"
                f"{rag_context}"
            )

        return self.invoke(prompt)
