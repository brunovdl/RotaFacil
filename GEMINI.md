Response always in pt-BR.
the language system is in pt-BR
use the folder .agent to content details and roles the system.
Behavioral guidelines to reduce common LLM coding mistakes. Merge with instructions as needed.
Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

1. Think Before Coding
Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:

State your assumptions explicitly. If uncertain, ask.
If multiple interpretations exist, present them - don't pick silently.
If a simpler approach exists, say so. Push back when warranted.
If something is unclear, stop. Name what's confusing. Ask.
2. Simplicity First
Minimum code that solves the problem. Nothing speculative.

No features beyond what was asked.
No abstractions for single-use code.
No "flexibility" or "configurability" that wasn't requested.
No error handling for impossible scenarios.
If you write 200 lines and it could be 50, rewrite it.
Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

3. Surgical Changes
Touch only what you must. Clean up only your own mess.

When editing existing code:

Don't "improve" adjacent code, comments, or formatting.
Don't refactor things that aren't broken.
Match existing style, even if you'd do it differently.
If you notice unrelated dead code, mention it - don't delete it.
When your changes create orphans:

Remove imports/variables/functions that YOUR changes made unused.
Don't remove pre-existing dead code unless asked.
The test: Every changed line should trace directly to the user's request.

4. Goal-Driven Execution
Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

"Add validation" → "Write tests for invalid inputs, then make them pass"
"Fix the bug" → "Write a test that reproduces it, then make it pass"
"Refactor X" → "Ensure tests pass before and after"
For multi-step tasks, state a brief plan:

1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

5. Automatic Subagent Invocation (Frontend and Backend)
Before implementing any code changes, identify the task scope and consult the responsible subagent:

- **Frontend Changes** (`frontend/`, `components/`, `app/`, styles, or UI/UX):
  - **MANDATORY**: Read and strictly apply the guidelines, design tokens, and rules from **[.agent/frontend/frontend.md](file:///c:/Users/Bruno%20Martins/Desktop/Dev_MIcroSaas/.agent/frontend/frontend.md)** to maintain Dark Glassmorphism identity, custom icons, and mobile responsiveness.

- **Backend Changes** (`backend/`, `src/`, `controllers/`, `services/`, NestJS, or Supabase):
  - **MANDATORY**: Read and strictly apply the guidelines, DTOs, and rules from **[.agent/backend/backend.md](file:///c:/Users/Bruno%20Martins/Desktop/Dev_MIcroSaas/.agent/backend/backend.md)** to ensure NestJS architecture, `user_id` isolation, and validations.

- **Fullstack Changes** (Frontend + Backend):
  - **MANDATORY**: Invoke and respect the rules of both subagents (`frontend.md` and `backend.md`).

These guidelines are working if: fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.