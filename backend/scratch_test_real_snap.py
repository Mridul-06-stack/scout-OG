import asyncio
import base64
import json
from pathlib import Path
from core.webcmd_adapter.real_adapter import RealWebcmdAdapter

async def test_real_screenshot():
    adapter = RealWebcmdAdapter()
    sid = await adapter._create_session()
    
    script = """
await page.goto('https://news.ycombinator.com', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(2000);

// Capture real browser PNG screenshot
const buffer = await page.screenshot({ type: 'png' });
const base64Data = buffer.toString('base64');
console.log(JSON.stringify({ status: 'success', base64Length: base64Data.length, base64: base64Data }));
"""
    out = await adapter._run_cli(["--session", sid, "browser", "run", "--stdin"], stdin_input=script, timeout=45)
    await adapter._close_session(sid)
    
    # Parse base64
    for line in out.splitlines():
        if "base64Length" in line:
            data = json.loads(line)
            b64_str = data.get("base64", "")
            img_bytes = base64.b64decode(b64_str)
            target_path = Path("/Users/shlok/Scout/backend/storage/screenshots/real_hn_screenshot.png")
            target_path.write_bytes(img_bytes)
            print(f"Saved real screenshot to {target_path} ({len(img_bytes)} bytes)")
            return

    # Check if inside logs array
    try:
        raw_json = json.loads(out)
        if "logs" in raw_json:
            for log_entry in raw_json["logs"]:
                for arg in log_entry.get("args", []):
                    if "base64Length" in arg:
                        data = json.loads(arg)
                        b64_str = data.get("base64", "")
                        img_bytes = base64.b64decode(b64_str)
                        target_path = Path("/Users/shlok/Scout/backend/storage/screenshots/real_hn_screenshot.png")
                        target_path.write_bytes(img_bytes)
                        print(f"Saved real screenshot from logs to {target_path} ({len(img_bytes)} bytes)")
                        return
    except Exception as e:
        print("Error parsing:", e)

if __name__ == "__main__":
    asyncio.run(test_real_screenshot())
