# Agent Instructions and Tracking

This document tracks the active agents, project rules, and session guidelines.

## 1. Hard Rules for All Sessions

1. **SCOPE LOCK**: Only touch the files and lines directly required to implement what was explicitly asked for. Do not refactor, restyle, or "clean up" adjacent components, design tokens, colors, spacing, or layout unless specifically requested. If you think something unrelated should change, tell the user — don't just change it.

2. **UI/STYLING IS FROZEN** unless stated otherwise. Existing components (StatusBadge, RevealBox, table/modal styling, inline design tokens) keep their current look exactly as-is. Any visual change — colors, padding, borders, animations — needs to be requested by name, not inferred from "best practice" or "consistency."

3. **SHOW BEFORE YOU COMMIT**: Before writing changes to any file, show a diff or a short summary of exactly what you're changing and why. Wait for confirmation on anything touching UI files. Don't batch multiple unrelated changes into one commit.

4. **BOOKKEEPING IS NOT OPTIONAL**:
   - Create a feature branch before committing — never commit directly to main.
   - After finishing the task, update Section 2 and add a new Session Log entry to PROJECT_HANDOFF.md yourself (you have file access) — summarize what changed, keep Section 2 as a full accurate replacement, don't just append.
   - Do not leave uncommitted changes sitting on main between sessions.

5. **STOP AND ASK**: If you're unsure whether a change is in scope or would alter existing UI, STOP and ask instead of guessing.

## 2. Project Tracking

*(Add project tracking details here)*
