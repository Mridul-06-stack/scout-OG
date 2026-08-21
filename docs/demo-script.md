# Scout — 3-Scene Hackathon Demo Script

> Designed for a 3-5 minute live demonstration at the SLAB Hackathon.

---

## Scene 1 — The Student Opportunity Radar (1.5 mins)

1. **Open Dashboard**: Navigate to `http://localhost:3000`. Show the dark glassmorphic overview.
2. **Trigger Pipeline**:
   - Click **Run Radar Now** (or enter a custom intent via the slider: *"Find remote AI hackathons and winter internships for 2nd year students in India"*).
3. **Show Results**:
   - Watch stats update (`Active Opportunities`, `Discovered Today`, `Closing Soon`).
   - Highlight **Match Score Ring** (e.g. 74% fit for Unstop TechSprint based on NIT Hamirpur + AI tags).
   - Point out **Change Type Badges** (`New Today`, `Closing Soon` with pulse animation).
   - Switch to **Opportunities → Kanban Board View** and move an opportunity from `Discovered` → `Applying` → `Applied`.

---

## Scene 2 — Multi-Vertical Generality (Hotel Monitor) (1 min)

1. **Switch Vertical**: Click the **Hotel Monitor** pill on the top nav bar.
2. **Show Zero-Pipeline-Code Magic**:
   - Show that the exact same pipeline runs on `hotel_price_monitor`.
   - Point to `verticals/hotel_price_monitor/vertical_config.json` vs `student_opportunities/vertical_config.json` in VS Code / GitHub.
   - Explain: *"Adding hotel price tracking required zero lines of Python code — only a new schema and config file."*

---

## Scene 3 — Learn a New Source Live & The Approval Gate (1.5 mins)

1. **Teach Scout a New Source**:
   - Click **Teach Source** in the header.
   - Enter `https://ethglobal.com/events` and click **Explore & Compile**.
   - Watch the 3-step webcmd exploration progress bar complete.
   - Open **Learned Sources** page to show the newly registered domain and strategy.
2. **Safety Architecture — Human Approval Gate**:
   - Open **Approval Gate** tab.
   - Click **Simulate GSoC Auto-Apply** or **Simulate Hotel Room Booking**.
   - Show how the pipeline **hard-blocks** with a glowing red checkpoint.
   - Explain: *"Scout never auto-applies or executes sensitive write actions without human consent. This is a non-bypassable architectural node."*
   - Click **Approve & Execute** and watch the audit trail record the approval decision.
