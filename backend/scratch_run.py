import asyncio
import json
from core.approval_gate.approval_gate import fill_and_submit_form

async def main():
    url = "https://docs.google.com/forms/d/e/1FAIpQLScSv17EH18jNdEIgpJ1Xd9r_ETd6pfXbvQtq07fHN0JdjnKyg/viewform?usp=dialog"
    print("Testing fill_and_submit_form on:", url)
    res = await fill_and_submit_form(url, auto_submit=False)
    print("RESULT:", json.dumps(res, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
