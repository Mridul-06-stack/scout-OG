"""Mock webcmd adapter — returns realistic demo data without any real SDK calls.

Every mock source returns genuine-looking opportunity/hotel data so the
dashboard demo looks credible. Data is deterministic per source URL.
"""

from __future__ import annotations

import asyncio
import logging
from datetime import datetime, timedelta

from core.models import (
    SourceCandidate, LearnedWorkflow, RawRecord,
    WorkflowStrategy,
)
from core.webcmd_adapter.base import WebcmdAdapterBase

logger = logging.getLogger(__name__)


# ── Mock data pools ────────────────────────────────────────────────────

_OPPORTUNITY_DATA: list[dict] = [
    {
        "title": "Google Summer of Code 2025",
        "type": "open_source",
        "organization": "Google",
        "deadline": (datetime.utcnow() + timedelta(days=45)).isoformat(),
        "location": "Remote",
        "stipend": "$1500-$6600",
        "tags": ["open_source", "coding", "mentorship", "remote"],
        "url": "https://summerofcode.withgoogle.com/",
        "description": "Contribute to open-source projects under mentor guidance. Stipends for 10-22 week projects.",
    },
    {
        "title": "MLH Global Hack Week",
        "type": "hackathon",
        "organization": "Major League Hacking",
        "deadline": (datetime.utcnow() + timedelta(days=12)).isoformat(),
        "location": "Online",
        "prize": "$5000 in prizes",
        "tags": ["hackathon", "AI", "web", "mobile", "remote"],
        "url": "https://ghw.mlh.io/",
        "description": "Week-long hackathon with daily challenges, workshops, and prizes.",
    },
    {
        "title": "Devfolio ETHIndia 2025",
        "type": "hackathon",
        "organization": "Devfolio",
        "deadline": (datetime.utcnow() + timedelta(days=30)).isoformat(),
        "location": "Bangalore, India",
        "prize": "$50,000+ in prizes and bounties",
        "tags": ["hackathon", "blockchain", "web3", "India"],
        "url": "https://ethindia.co/",
        "description": "Asia's largest Ethereum hackathon. 36 hours of building, networking, and learning.",
    },
    {
        "title": "LFX Mentorship — CNCF",
        "type": "open_source",
        "organization": "Linux Foundation",
        "deadline": (datetime.utcnow() + timedelta(days=20)).isoformat(),
        "location": "Remote",
        "stipend": "$3000-$6600",
        "tags": ["open_source", "cloud_native", "kubernetes", "remote"],
        "url": "https://mentorship.lfx.linuxfoundation.org/",
        "description": "Mentorship program for open-source cloud-native projects under CNCF.",
    },
    {
        "title": "Unstop TechSprint India",
        "type": "hackathon",
        "organization": "Unstop",
        "deadline": (datetime.utcnow() + timedelta(days=5)).isoformat(),
        "location": "Hybrid — Delhi NCR + Online",
        "prize": "₹3,00,000",
        "tags": ["hackathon", "AI", "India", "tech"],
        "url": "https://unstop.com/hackathons",
        "description": "National-level tech hackathon open to all college students.",
    },
    {
        "title": "GitHub Octernships",
        "type": "internship",
        "organization": "GitHub",
        "deadline": (datetime.utcnow() + timedelta(days=60)).isoformat(),
        "location": "Remote",
        "stipend": "Paid",
        "tags": ["internship", "open_source", "developer_tools", "remote"],
        "url": "https://education.github.com/",
        "description": "Paid internships at companies building on GitHub, matched via university partnerships.",
    },
    {
        "title": "MITACS Globalink Research Internship",
        "type": "internship",
        "organization": "MITACS",
        "deadline": (datetime.utcnow() + timedelta(days=90)).isoformat(),
        "location": "Canada",
        "stipend": "$6000 CAD + travel",
        "tags": ["internship", "research", "Canada", "STEM"],
        "url": "https://www.mitacs.ca/globalink/",
        "description": "12-week research internship at Canadian universities for international undergrads.",
    },
    {
        "title": "SIH 2025 — Smart India Hackathon",
        "type": "hackathon",
        "organization": "Government of India",
        "deadline": (datetime.utcnow() + timedelta(days=15)).isoformat(),
        "location": "India — multiple nodal centers",
        "prize": "₹1,00,000 per problem statement",
        "tags": ["hackathon", "India", "government", "innovation"],
        "url": "https://sih.gov.in/",
        "description": "India's largest open innovation platform. Solve government problem statements in 36 hours.",
    },
    {
        "title": "Outreachy Winter 2025",
        "type": "open_source",
        "organization": "Software Freedom Conservancy",
        "deadline": (datetime.utcnow() + timedelta(days=40)).isoformat(),
        "location": "Remote",
        "stipend": "$7000",
        "tags": ["open_source", "diversity", "remote", "mentorship"],
        "url": "https://www.outreachy.org/",
        "description": "Paid internships for underrepresented groups in open-source and free software.",
    },
    {
        "title": "AWS AI/ML Scholarship",
        "type": "scholarship",
        "organization": "Amazon Web Services",
        "deadline": (datetime.utcnow() + timedelta(days=25)).isoformat(),
        "location": "Online",
        "stipend": "Full course access + mentorship",
        "tags": ["scholarship", "AI", "machine_learning", "cloud", "remote"],
        "url": "https://aws.amazon.com/machine-learning/scholarship/",
        "description": "Scholarship for Udacity nanodegree in AI programming with Python, funded by AWS.",
    },
]

_HOTEL_DATA: list[dict] = [
    {
        "title": "The Himalayan Village Resort",
        "type": "hotel",
        "location": "Manali, Himachal Pradesh",
        "price_per_night": 2800,
        "currency": "INR",
        "rating": 4.5,
        "availability": True,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "breakfast", "parking", "spa"],
        "tags": ["budget", "mountain_view", "Manali"],
        "url": "https://example-hotels.com/himalayan-village",
    },
    {
        "title": "Snowpeak Lodge",
        "type": "hotel",
        "location": "Old Manali, Himachal Pradesh",
        "price_per_night": 1500,
        "currency": "INR",
        "rating": 4.2,
        "availability": True,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "breakfast"],
        "tags": ["budget", "backpacker", "Manali"],
        "url": "https://example-hotels.com/snowpeak",
    },
    {
        "title": "Riverside Cottage Manali",
        "type": "hotel",
        "location": "Manali, Himachal Pradesh",
        "price_per_night": 3500,
        "currency": "INR",
        "rating": 4.7,
        "availability": True,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "breakfast", "riverside", "bonfire"],
        "tags": ["premium", "riverside", "Manali"],
        "url": "https://example-hotels.com/riverside",
    },
    {
        "title": "Zostel Manali",
        "type": "hostel",
        "location": "Old Manali, Himachal Pradesh",
        "price_per_night": 600,
        "currency": "INR",
        "rating": 4.3,
        "availability": True,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "common_kitchen", "lounge"],
        "tags": ["budget", "hostel", "backpacker", "Manali"],
        "url": "https://example-hotels.com/zostel",
    },
    {
        "title": "The Orchard Greens Resort",
        "type": "hotel",
        "location": "Manali, Himachal Pradesh",
        "price_per_night": 4200,
        "currency": "INR",
        "rating": 4.6,
        "availability": False,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "breakfast", "pool", "spa", "gym"],
        "tags": ["luxury", "resort", "Manali"],
        "url": "https://example-hotels.com/orchard-greens",
    },
    {
        "title": "Backpacker's Nest",
        "type": "hostel",
        "location": "Vashisht, Manali",
        "price_per_night": 450,
        "currency": "INR",
        "rating": 4.0,
        "availability": True,
        "check_in": (datetime.utcnow() + timedelta(days=7)).strftime("%Y-%m-%d"),
        "amenities": ["wifi", "hot_water"],
        "tags": ["budget", "hostel", "Manali", "vashisht"],
        "url": "https://example-hotels.com/backpackers-nest",
    },
]


class MockWebcmdAdapter(WebcmdAdapterBase):
    """Returns realistic canned data — no external calls."""

    async def _explore_impl(self, source: SourceCandidate) -> LearnedWorkflow:
        await asyncio.sleep(0.3)  # simulate exploration latency
        logger.info("[mock] Exploring source: %s", source.url)

        return LearnedWorkflow(
            source_domain=source.domain,
            source_url=source.url,
            vertical=source.vertical,
            strategy=WorkflowStrategy.PUBLIC_DOM,
            extraction_schema_ref=(
                "hotel_schema.json"
                if source.vertical == "hotel_price_monitor"
                else "opportunity_schema.json"
            ),
            compiled_command_ref=f"mock_cmd_{source.domain}",
        )

    async def _compile_impl(self, exploration_result: dict) -> str:
        await asyncio.sleep(0.1)
        return f"mock_compiled_{exploration_result.get('domain', 'unknown')}"

    async def _execute_impl(self, workflow: LearnedWorkflow) -> list[RawRecord]:
        await asyncio.sleep(0.5)  # simulate fetch latency
        logger.info("[mock] Executing workflow for: %s", workflow.source_url)

        pool = (
            _HOTEL_DATA
            if workflow.vertical == "hotel_price_monitor"
            else _OPPORTUNITY_DATA
        )

        # Return a subset based on source domain hash to vary per-source
        domain_hash = hash(workflow.source_domain) % len(pool)
        # Return 3-5 items starting from the hash offset
        count = min(3 + (domain_hash % 3), len(pool))
        items = [pool[(domain_hash + i) % len(pool)] for i in range(count)]

        return [
            RawRecord(
                source_url=workflow.source_url,
                source_domain=workflow.source_domain,
                raw_fields=item,
            )
            for item in items
        ]
