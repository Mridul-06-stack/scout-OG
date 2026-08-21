#!/usr/bin/env python3
"""Precision-timed end-to-end dry run of the 3-Scene Demo Script on the real stack."""

import asyncio
import time
import sys
import logging
from pathlib import Path
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from core.scheduler.scheduler import run_vertical, all_opportunities
from core.models import (
    WriteAction, ApprovalAction, ApprovalStatus, SourceCandidate,
)
from core.webcmd_adapter.execute import explore_source
from core.webcmd_adapter.registry import register
from core.approval_gate import approval_gate


async def timed_dry_run():
    print("=" * 70)
    print("🎬 STARTING 3-SCENE DEMO DRY RUN (REAL STACK — WEBCMD_MODE=real)")
    print(f"⏰ Start Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

    total_start = time.perf_counter()

    # ─────────────────────────────────────────────────────────────────────
    # SCENE 1: Student Opportunities Radar
    # ─────────────────────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("▶ SCENE 1: Student Opportunities Radar (Intent → Plan → webcmd → Match → Diff)")
    print("─" * 70)
    s1_start = time.perf_counter()

    intent_s1 = "Find remote AI hackathons, open-source programs, and winter internships for 2nd year students"
    print(f"🎯 User Intent: '{intent_s1}'")

    run_s1 = await run_vertical("student_opportunities", intent_s1)
    s1_elapsed = time.perf_counter() - s1_start

    student_opps = [o for o in all_opportunities if o.vertical == "student_opportunities"]
    student_opps.sort(key=lambda o: o.match_score, reverse=True)

    print(f"✅ Scene 1 Completed in {s1_elapsed:.2f}s")
    print(f"   • Status: {run_s1.status.value}")
    print(f"   • Sources Processed: {run_s1.sources_processed}")
    print(f"   • Total Items Found: {len(student_opps)}")
    print(f"   • Top Match: {student_opps[0].title} ({int(student_opps[0].match_score * 100)}% fit)")
    print(f"   • Closing Soon Items: {sum(1 for o in student_opps if o.change_type.value == 'closing_soon')}")

    # ─────────────────────────────────────────────────────────────────────
    # SCENE 2: Multi-Vertical Generality (Hotel Price Monitor)
    # ─────────────────────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("▶ SCENE 2: Multi-Vertical Generality (Hotel Price Monitor — Config Only)")
    print("─" * 70)
    s2_start = time.perf_counter()

    intent_s2 = "Monitor budget hotels and hostels in Old Manali under ₹3000"
    print(f"🎯 User Intent: '{intent_s2}'")

    run_s2 = await run_vertical("hotel_price_monitor", intent_s2)
    s2_elapsed = time.perf_counter() - s2_start

    hotel_opps = [o for o in all_opportunities if o.vertical == "hotel_price_monitor"]
    hotel_opps.sort(key=lambda o: o.match_score, reverse=True)

    print(f"✅ Scene 2 Completed in {s2_elapsed:.2f}s")
    print(f"   • Status: {run_s2.status.value}")
    print(f"   • Sources Processed: {run_s2.sources_processed}")
    print(f"   • Hotel Listings Extracted: {len(hotel_opps)}")
    if hotel_opps:
        print(f"   • Best Value Match: {hotel_opps[0].title} (₹{hotel_opps[0].raw_fields.get('price_per_night')}/night)")

    # ─────────────────────────────────────────────────────────────────────
    # SCENE 3: Teach New Source Live + Approval Gate Hard Safety Checkpoint
    # ─────────────────────────────────────────────────────────────────────
    print("\n" + "─" * 70)
    print("▶ SCENE 3: Teach New Source Live + Human Approval Gate")
    print("─" * 70)
    s3_start = time.perf_counter()

    # Part A: Teach new unseen source via live webcmd CLI
    new_url = "https://news.ycombinator.com/"
    print(f"🌐 [3A] Exploring and compiling new unseen source: {new_url}...")
    source_cand = SourceCandidate(
        url=new_url,
        domain="news.ycombinator.com",
        vertical="student_opportunities",
        name="Hacker News",
    )
    workflow = await explore_source(source_cand)
    register(workflow)
    print(f"   ✓ Successfully learned: {workflow.source_domain} (Strategy: {workflow.strategy.value})")

    # Part B: Safety Architecture — Approval Gate hard checkpoint
    print("\n🛡️ [3B] Simulating Autonomous Action: 'Submit GSoC 2025 Application'...")
    write_act = WriteAction(
        action=ApprovalAction.APPLY,
        opportunity_id="gsoc-2025-demo",
        description="Submit GSoC Proposal to CNCF Kubernetes Project",
        target_url="https://summerofcode.withgoogle.com/apply",
    )

    # Async task that confirms human approval after 1.5 seconds
    async def simulate_human_reviewer():
        await asyncio.sleep(1.5)
        pending = approval_gate.get_pending()
        if pending:
            print(f"   👤 Human reviewer clicked 'Approve & Execute' on request: {pending[0].id[:8]}...")
            approval_gate.approve(pending[0].id)

    decision_task = asyncio.create_task(approval_gate.request(write_act))
    human_task = asyncio.create_task(simulate_human_reviewer())

    decision, _ = await asyncio.gather(decision_task, human_task)
    s3_elapsed = time.perf_counter() - s3_start

    print(f"   ✓ Approval Gate Decision: {decision.status.value.upper()} by {decision.decided_by}")
    print(f"✅ Scene 3 Completed in {s3_elapsed:.2f}s")

    # ─────────────────────────────────────────────────────────────────────
    # TOTAL SUMMARY
    # ─────────────────────────────────────────────────────────────────────
    total_elapsed = time.perf_counter() - total_start
    print("\n" + "=" * 70)
    print("📊 3-SCENE DEMO DRY RUN SUMMARY & TIMINGS")
    print("=" * 70)
    print(f"  • Scene 1 (Student Opportunities Radar): {s1_elapsed:6.2f}s")
    print(f"  • Scene 2 (Hotel Price Monitor):         {s2_elapsed:6.2f}s")
    print(f"  • Scene 3 (Teach Source + Approval Gate):{s3_elapsed:6.2f}s")
    print(f"  ─────────────────────────────────────────────")
    print(f"  🎯 TOTAL DEMO DURATION:                  {total_elapsed:6.2f}s ({total_elapsed/60:.2f} mins)")
    print("=" * 70)


if __name__ == "__main__":
    asyncio.run(timed_dry_run())
