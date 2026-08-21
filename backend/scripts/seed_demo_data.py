#!/usr/bin/env python3
"""Seed demo data script for both verticals for rehearsed demo fallback."""

import asyncio
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from core.scheduler.scheduler import run_vertical


async def main():
    print("🌱 Seeding Scout with demo radar data for both verticals...")

    print("\n1. Running Student Opportunities vertical...")
    await run_vertical("student_opportunities", "Find top tech hackathons, open source programs, and student internships")

    print("\n2. Running Hotel Price Monitor vertical...")
    await run_vertical("hotel_price_monitor", "Monitor budget hotels in Manali under ₹3000")

    print("\n✨ Demo data seeded successfully! Both verticals are populated in the database & snapshots.")


if __name__ == "__main__":
    asyncio.run(main())
