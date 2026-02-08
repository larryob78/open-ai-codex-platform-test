#!/usr/bin/env python3
"""Brief Writer 2026 - Multi-agent creative brief generator powered by NVIDIA NIMs.

Usage:
    python main.py
    python main.py --brand "Acme Co" --goal "Launch new product line" --industry "Tech"
"""

import argparse
import sys

from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt

from orchestrator.pipeline import run_pipeline

console = Console()

BANNER = r"""
 ____       _       __  __        _ _            ____   ___ ____   __
| __ ) _ __(_) ___ / _| \      /(_) |_ ___ _ __|___ \ / _ \___ \ / /_
|  _ \| '__| |/ _ \ |_   \ /\ / /| | __/ _ \ '__| __) | | | |__) | '_ \
| |_) | |  | |  __/  _|   V  V / | | ||  __/ |  / __/| |_| / __/| (_) |
|____/|_|  |_|\___|_|      \_/\_/ |_|\__\___|_| |_____|\___/_____|\___/

           Multi-Agent Creative Brief Generator
           Powered by NVIDIA NIM Inference Microservices
"""


def interactive_mode() -> None:
    """Run the brief writer in interactive prompt mode."""
    console.print(BANNER, style="bold cyan")
    console.print(Panel(
        "[bold]Welcome to Brief Writer 2026![/bold]\n\n"
        "This tool uses a team of 5 AI agents to generate professional\n"
        "creative briefs, powered by NVIDIA NIM microservices.\n\n"
        "Agents: Research -> Strategy -> Creative Director -> Compiler -> Review",
        title="About",
    ))

    brand = Prompt.ask("[bold]Product or Brand name[/bold]")
    goal = Prompt.ask("[bold]Campaign goal[/bold]")
    industry = Prompt.ask("[bold]Industry[/bold] (optional)", default="")
    context = Prompt.ask("[bold]Additional context[/bold] (optional)", default="")

    console.print()
    run_pipeline(brand, goal, industry, context)


def cli_mode(args: argparse.Namespace) -> None:
    """Run the brief writer from CLI arguments."""
    console.print(BANNER, style="bold cyan")
    run_pipeline(args.brand, args.goal, args.industry, args.context)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Brief Writer 2026 - AI-powered creative brief generator"
    )
    parser.add_argument("--brand", help="Product or brand name")
    parser.add_argument("--goal", help="Campaign goal")
    parser.add_argument("--industry", default="", help="Industry (optional)")
    parser.add_argument("--context", default="", help="Additional context (optional)")

    args = parser.parse_args()

    if args.brand and args.goal:
        cli_mode(args)
    else:
        interactive_mode()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        console.print("\n[yellow]Cancelled.[/yellow]")
        sys.exit(0)
    except ValueError as exc:
        console.print(f"\n[red]Configuration error:[/red] {exc}")
        sys.exit(1)
