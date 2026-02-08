"""Base agent class with NVIDIA NIM integration via OpenAI-compatible API."""

from openai import OpenAI
from config.settings import NVIDIA_API_KEY, NIM_BASE_URL, NIM_MODEL


class BaseAgent:
    """Base class for all creative brief agents.

    Uses NVIDIA NIM inference microservices through the OpenAI-compatible API.
    Sign in at https://developer.nvidia.com and get your API key from
    https://build.nvidia.com to use NIM endpoints.
    """

    name: str = "BaseAgent"
    system_prompt: str = "You are a helpful assistant."

    def __init__(self, model: str | None = None):
        if not NVIDIA_API_KEY:
            raise ValueError(
                "NVIDIA_API_KEY is not set. "
                "Sign up at https://developer.nvidia.com, then get your API key "
                "from https://build.nvidia.com and set it in your .env file."
            )
        self.model = model or NIM_MODEL
        self.client = OpenAI(base_url=NIM_BASE_URL, api_key=NVIDIA_API_KEY)

    def invoke(self, user_message: str, temperature: float = 0.7) -> str:
        """Send a message to the NIM endpoint and return the response."""
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self.system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=2048,
        )
        return response.choices[0].message.content or ""
