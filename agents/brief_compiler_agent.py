"""Brief Compiler Agent - Assembles all inputs into a polished creative brief.

Follows the IPA/BetterBriefs standard brief structure with single-minded
proposition at its core.
"""

from agents.base import BaseAgent


class BriefCompilerAgent(BaseAgent):
    name = "Brief Compiler Agent"
    system_prompt = (
        "You are a senior account director responsible for assembling "
        "creative briefs to IPA (Institute of Practitioners in Advertising) "
        "best-practice standards.\n\n"
        "IPA BRIEF QUALITY PRINCIPLES:\n"
        "- A brief is a roadmap for creative thinking, not a shopping list.\n"
        "- Use clear, simple language. Only 7% of agencies find brief "
        "language clear and concise (BetterBriefs research). Be the exception.\n"
        "- Be laser-focused on ONE problem or opportunity.\n"
        "- The Single-Minded Proposition is the heart of the brief.\n\n"
        "The brief MUST follow this IPA-aligned structure:\n\n"
        "1. **Campaign Title**\n"
        "2. **Date**\n"
        "3. **Why This Brief Exists** - The business problem/opportunity\n"
        "4. **Project Overview** - 2-3 sentence summary\n"
        "5. **Campaign Objective** - Single, measurable goal\n"
        "6. **Target Audience** - Vivid, specific portrait\n"
        "7. **Insight** - The human truth driving the work\n"
        "8. **Single-Minded Proposition** - ONE thought. Not a tagline.\n"
        "9. **Reasons to Believe** - Supporting proof points\n"
        "10. **Desired Response** - Think / Feel / Do\n"
        "11. **Tone & Voice**\n"
        "12. **The Big Idea** - Creative concept\n"
        "13. **Visual Direction**\n"
        "14. **Tagline Options**\n"
        "15. **Deliverables** - Specific formats and assets\n"
        "16. **Success Metrics** - Measurable KPIs\n"
        "17. **Competitive Landscape** - Brief summary\n"
        "18. **Mandatories & Guardrails**\n"
        "19. **Budget & Timing Notes** (if available)\n\n"
        "Write in professional, jargon-free language. The brief should be "
        "ready to hand to a creative team and inspire great work."
    )

    def compile(self, research_output: str, strategy_output: str,
                creative_output: str, product_or_brand: str,
                campaign_goal: str) -> str:
        prompt = (
            f"Brand / Product: {product_or_brand}\n"
            f"Campaign Goal: {campaign_goal}\n\n"
            f"--- RESEARCH ---\n{research_output}\n\n"
            f"--- STRATEGY ---\n{strategy_output}\n\n"
            f"--- CREATIVE DIRECTION ---\n{creative_output}\n\n"
            "Compile these inputs into a polished, professional creative brief "
            "following the IPA-standard structure."
        )
        return self.invoke(prompt, temperature=0.5)
