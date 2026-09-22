# Token Saving Best Practices for AI-Assisted Development

A practical guide to reducing token consumption while working with Claude, ChatGPT, Gemini, Copilot, and similar AI coding assistants.

> **Core insight:** The best prompts aren't the longest ones. Context size — not prompt length — is the biggest token consumer. The goal is to build structured workflows that *reuse* context instead of regenerating it every turn.

---

## 1. General Token Saving Practices

| Practice | Why It Works |
|---|---|
| Start a new session for every unrelated task | Prevents old conversation history from bleeding into every prompt |
| Ask the AI to plan before coding | Avoids unnecessary file reads and rewrites |
| Reference specific files instead of the whole repo | Reduces context dramatically |
| Keep prompts concise | Fewer input tokens every turn |
| Use project documentation instead of re-explaining | Reuses stable context instead of repeating it |
| Split large features into small tasks | Smaller context = lower cost + better quality |

---

## 2. Claude Code Best Practices

| Do | Avoid |
|---|---|
| Run `/clear` after finishing a feature | Keeping one session open for the whole week |
| Run `/compact` when context gets large | Letting the conversation grow indefinitely |
| Run `/usage` to monitor consumption | Ignoring token usage until limits are hit |
| Ask Claude to inspect only needed files | Saying "analyze my entire repository" |
| Keep `CLAUDE.md` small | Putting all project knowledge into one huge always-loaded file |

**Note:** `/clear` is the single most effective way to reduce context. `/compact` preserves only essential information when you need to continue the *same* task.

---

## 3. Prompt Engineering for Token Efficiency

**❌ Bad**
> "Build the feature." — the AI will explore the project first, burning tokens on discovery.

**✅ Better**
> "Implement JWT authentication. Only inspect: `auth.controller.ts`, `auth.service.ts`, `jwt.guard.ts`. Don't explore other folders unless necessary."

**✅ Even Better**
> "Before reading any files, tell me which files you need. Wait for my approval. Then implement."

This prevents unnecessary repository scans entirely.

---

## 4. Use AI Like a Senior Engineer

Instead of a single vague instruction ("build the feature"), structure the request as a pipeline:

1. Analyze requirements
2. Produce a plan
3. Wait for approval
4. Implement
5. Run tests
6. Create PR

This avoids wasted, multiple implementation attempts.

---

## 5. Break Work into Micro Tasks

Don't ask for a whole feature in one shot. Break it into the smallest independently-completable units possible. Smaller tasks mean smaller context windows per request, more predictable output, and easier review.

---

## 6. Keep Context Stable

Create small, concise project reference files (e.g., `CLAUDE.md`) and keep them to **roughly 1–2K tokens**. Large, always-loaded context files increase token usage on *every* request because they're re-included repeatedly, even when irrelevant to the current task.

---

## 7. Use Different Models Strategically

Don't use the most expensive model for every task — match model size to task complexity.

| Task | Recommended Model |
|---|---|
| Brainstorming | Smaller / faster model |
| Documentation | Medium model |
| Refactoring | Large model |
| Bug fix | Small model |
| Architecture | Large model |

---

## 8. Codebase Indexing Strategies

For AI-integrated editors (Cursor, VS Code, etc.):

- **`.cursorignore` / `.gitignore` optimization** — explicitly exclude `dist/`, `node_modules/`, large assets, and logs so the AI never indexes or references them.
- **Smart indexing tools** — use semantic indexing features (e.g., `@Codebase`) so the AI can search relevant snippets instead of reading the whole repo.
- **Modular codebase architecture** — smaller, clearly-defined modules index and reference more efficiently than monolithic code.
- **Keep `CLAUDE.md` / `README.md` updated** — a concise, well-maintained instruction file is loaded once and reused instead of forcing repeated re-scans.
- **Reference relevant files only** — even with indexing enabled, explicitly `@mention` the files needed for a task rather than relying on broad scans.

---

## 9. The Ten Principles of Token-Efficient Prompting

### Principle #1 — Create an AI Project Constitution Once
Instead of repeating standing instructions ("You are a Senior PM," "think step by step," "use best practices," "follow clean architecture," "explain tradeoffs") in every prompt, write them once into a single reference file and simply reference it afterward.
**Savings:** ~300–1,000 tokens per request.

### Principle #2 — Every Phase Should Only Know What It Needs
Don't feed a phase the entire project history. Only include the specific artifacts that phase actually requires.

### Principle #3 — Store Outputs as Files
Save AI outputs to files rather than keeping them in conversation. Reference the file later instead of resending the full content.

### Principle #4 — Separate Thinking from Generation
Don't ask for a huge, single combined output. Split into stages: think → plan → generate → refine, as separate steps.

### Principle #5 — Never Ask for Everything at Once
Request one artifact at a time, then follow up incrementally for the next piece, rather than asking for the full deliverable up front.

### Principle #6 — Use Incremental Prompts
Prefer small, targeted edits over full regenerations. Claude (and similar models) are significantly more efficient with incremental changes than with full rewrites.

### Principle #7 — Use IDs Instead of Descriptions
Reference items by short IDs (e.g., ticket numbers, section IDs) instead of restating full descriptions each time.

### Principle #8 — One Prompt = One Deliverable
Each prompt should produce exactly one output. Avoid bundling multiple deliverables into a single request.

### Principle #9 — Don't Ask for Explanations You Don't Need
Skip requesting rationale or commentary unless it's actually needed — explanations cost output tokens.

### Principle #10 — Use Templates
Provide a template/structure up front instead of letting the model invent a new structure every time it responds.

---

## 10. A Better Product Development Workflow

Each phase should read only the minimal prior artifact(s) — not the entire project history.

| Phase | Input | Output | Reads |
|---|---|---|---|
| Idea | Product idea | `idea.md` | None |
| Research | `idea.md` | `research.md` | Idea |
| Discovery | `research.md` | `discovery.md` | Research |
| PRD | `discovery.md` | `prd.md` | Discovery |
| UX | `prd.md` | `ux.md` | PRD |
| TDD | `prd.md` + `ux.md` | `tdd.md` | PRD + UX |
| Sprint | `tdd.md` | `sprint.md` | TDD |
| Development | `sprint.md` | Code | Sprint |
| Testing | `sprint.md` | `test.md` | Sprint |
| Release | `sprint.md` | `release.md` | Sprint |
| Monitoring | `release.md` | `monitoring.md` | Release |
| Retro | `monitoring.md` | `retro.md` | Monitoring |

---

## 11. Prompt Compression Pattern

Instead of a verbose ~2,000-token prompt that re-explains context, goals, and constraints every time, use a compact, structured shorthand format (referencing files/IDs and a fixed template).

**Result:** Typically 50–100 tokens instead of hundreds — a 90%+ reduction with no loss of clarity.

---

## 12. Token-Efficient Workflow — Typical Prompt Sizes

| Phase | Typical Prompt Size | Output |
|---|---|---|
| Idea | 100–200 tokens | `idea.md` |
| Research | 50–100 tokens | `research.md` |
| PRD | 50–100 tokens | `prd.md` |
| UX | 50–100 tokens | `ux.md` |
| TDD | 50–100 tokens | `tdd.md` |
| Sprint | 30–50 tokens | `sprint.md` |
| Development | 20–50 tokens | Code |
| Testing | 20–50 tokens | `test.md` |
| Release | 20–50 tokens | `release.md` |

---

## 13. The Biggest Optimization

If designing an AI-native product development process from scratch, don't optimize individual prompts — **optimize the artifacts**.

Use a small set of version-controlled documents (`idea.md`, `research.md`, `prd.md`, `ux.md`, `tdd.md`, etc.) as the single source of truth. Every AI interaction should:

1. Read only the minimum required artifact(s)
2. Produce exactly one new artifact or update one section
3. Avoid re-explaining or regenerating previous work

This approach reduces token usage far more than shaving lines off individual prompts — and makes the whole workflow more consistent and maintainable.

---

## Quick Reference Summary

- **Session hygiene:** `/clear` often, `/compact` when needed, monitor with `/usage`.
- **Scope narrowly:** name exact files, never "the whole repo."
- **Plan before you build:** require an approval step before implementation.
- **Right-size the model:** small models for small tasks, large models for architecture/refactoring.
- **Persist state in files, not conversation:** treat `idea.md` → `retro.md` as the source of truth.
- **One prompt, one deliverable, minimal context per phase.**
- **Compress prompts** using templates and IDs instead of full descriptions.
