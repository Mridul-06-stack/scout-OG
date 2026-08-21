#!/usr/bin/env python3
"""CLI script to manually trigger a Scout pipeline run for any vertical."""

import asyncio
import argparse
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from core.scheduler.scheduler import run_vertical, all_opportunities
from core.models import ChangeType


async def main():
    parser = argparse.ArgumentParser(description="Run Scout Pipeline from CLI")
    parser.add_argument(
        "--vertical",
        "-v",
        default="student_opportunities",
        help="Vertical to run (student_opportunities or hotel_price_monitor)",
    )
    parser.add_argument(
        "--intent",
        "-i",
        default="",
        help="Optional natural language intent (e.g. 'Find AI hackathons in India')",
    )
    args = parser.parse_args()

    print(f"\n🚀 Starting Scout Radar for vertical='{args.vertical}'...")
    if args.intent:
        print(f"🎯 Intent: '{args.intent}'")

    run_info = await run_vertical(args.vertical, args.intent)

    print("\n" + "=" * 60)
    print(f"✅ Pipeline Completed: status={run_info.status.value}")
    print(f"📊 Sources Processed: {run_info.sources_processed}")
    print(f"🎯 Records Found:     {run_info.records_found}")
    print(f"✨ New Records:       {run_info.new_records}")
    print(f"🔄 Updated Records:   {run_info.updated_records}")
    if run_info.errors:
        print(f"⚠️  Errors ({len(run_info.errors)}): {run_info.errors}")
    print("=" * 60)

    # Print top opportunities
    vertical_opps = [o for o in all_opportunities if o.vertical == args.vertical]
    vertical_opps.sort(key=lambda o: o.match_score, reverse=True)

    print(f"\n🏆 Top Results for {args.vertical}:")
    for idx, opp in enumerate(vertical_opps[:5], 1):
        badge = f"[{opp.change_type.value.upper()}]"
        print(f"  {idx}. {opp.title} ({opp.type}) — Match: {int(opp.match_score * 100)}% {badge}")
        if opp.location:
            print(f"     Location: {opp.location}")
        if opp.deadline:
            print(f"     Deadline: {opp.deadline}")
        print(f"     URL: {opp.source_url}\n")


if __name__ == "__main__":
    asyncio.run(main())
