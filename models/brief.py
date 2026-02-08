"""Data models for creative brief structure."""

from pydantic import BaseModel, Field


class BriefInput(BaseModel):
    """User-supplied input to kick off the creative brief pipeline."""

    product_or_brand: str = Field(description="Product, brand, or company name")
    campaign_goal: str = Field(description="What the campaign should achieve")
    industry: str = Field(default="", description="Industry or sector")
    additional_context: str = Field(
        default="", description="Any extra context the user wants to provide"
    )


class ResearchOutput(BaseModel):
    """Output from the Research Agent."""

    market_landscape: str = ""
    competitor_insights: str = ""
    audience_demographics: str = ""
    trends: str = ""


class StrategyOutput(BaseModel):
    """Output from the Strategy Agent."""

    objective: str = ""
    target_audience: str = ""
    key_messages: list[str] = Field(default_factory=list)
    unique_selling_proposition: str = ""
    success_metrics: list[str] = Field(default_factory=list)


class CreativeDirectionOutput(BaseModel):
    """Output from the Creative Director Agent."""

    tone_and_voice: str = ""
    visual_direction: str = ""
    tagline_options: list[str] = Field(default_factory=list)
    content_formats: list[str] = Field(default_factory=list)
    brand_guidelines_notes: str = ""


class CreativeBrief(BaseModel):
    """The final assembled creative brief."""

    title: str = ""
    date: str = ""
    project_overview: str = ""
    objective: str = ""
    target_audience: str = ""
    key_messages: list[str] = Field(default_factory=list)
    unique_selling_proposition: str = ""
    tone_and_voice: str = ""
    visual_direction: str = ""
    tagline_options: list[str] = Field(default_factory=list)
    deliverables: list[str] = Field(default_factory=list)
    success_metrics: list[str] = Field(default_factory=list)
    competitive_landscape: str = ""
    additional_notes: str = ""


class ReviewOutput(BaseModel):
    """Output from the Review Agent."""

    score: int = Field(default=0, ge=0, le=100, description="Quality score 0-100")
    strengths: list[str] = Field(default_factory=list)
    improvements: list[str] = Field(default_factory=list)
    revised_brief: CreativeBrief | None = None
