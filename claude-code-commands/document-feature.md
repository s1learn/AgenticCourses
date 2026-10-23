# Document Feature Command

Generate comprehensive developer and user documentation for the feature: **$ARGUMENTS**

---

## Phase 1: Discovery

Before writing anything, gather context by completing all of these steps:

### 1.1 — Locate Feature Code
Search the codebase for files related to `$ARGUMENTS`:
- Search for the feature name (and likely kebab-case, camelCase, PascalCase variants) across `src/`, `app/`, `lib/`, `pages/`, `api/`, `components/`
- Identify the feature type:
  - **Frontend-only**: changes are in `components/`, `pages/`, `screens/`, `views/` with no new API routes
  - **Backend-only**: changes are in `api/`, `controllers/`, `services/`, `routes/`, `models/` with no UI code
  - **Full-stack**: changes span both UI and API layers
- List every file created or modified for this feature

### 1.2 — Scan Existing Documentation
Check these locations for patterns and related docs to link to:
- `docs/dev/` — existing developer docs
- `docs/user/` or `docs/guides/` — existing user guides
- `README.md` files near the feature code
- Any inline `@param`, `@returns`, `@example` JSDoc / docstring comments in the feature files
- OpenAPI / Swagger specs if this is a backend feature

### 1.3 — Understand the Feature
From the code, extract:
- **Purpose**: What problem does this feature solve?
- **Entry points**: Where does a user or developer interact with it first?
- **Data flow**: How does data move through the feature (input → processing → output)?
- **Dependencies**: What does this feature depend on (libraries, services, other features)?
- **Configuration**: Are there environment variables, feature flags, or config values?
- **Error states**: What can go wrong and how is it handled?

---

## Phase 2: Developer Documentation

Create `docs/dev/$ARGUMENTS-implementation.md` using this structure:

```markdown
# [Feature Name] — Technical Reference

> **Type**: [Frontend / Backend / Full-Stack]
> **Status**: [Stable / Beta / Experimental]
> **Added**: [date]
> **Related**: [links to related dev docs discovered in Phase 1]

## Overview
[2–3 sentence technical summary of what this feature does and why it exists]

## Architecture

### Component/Module Map
[List every file involved, grouped by layer]

**Frontend**
- `src/components/[Component].tsx` — [one-line responsibility]
- `src/hooks/use[Hook].ts` — [one-line responsibility]

**Backend** *(if applicable)*
- `src/api/[route].ts` — [one-line responsibility]
- `src/services/[service].ts` — [one-line responsibility]

**Shared**
- `src/types/[domain].ts` — [one-line responsibility]

### Data Flow
[Describe the flow as a numbered sequence or ASCII diagram]

```
User Action → Component → Hook/Store → API Route → Service → DB
                                          ↓
                                     Response ← ← ← ← ← ←
```

## API Reference *(skip if frontend-only)*

### Endpoints

#### `[METHOD] /api/[path]`
**Description**: [what this endpoint does]

**Authentication**: Required / Optional / None

**Request**
```json
{
  "field": "type — description"
}
```

**Response — 200 OK**
```json
{
  "field": "type — description"
}
```

**Error Responses**
| Status | Code | Description |
|--------|------|-------------|
| 400 | VALIDATION_ERROR | [when this occurs] |
| 401 | UNAUTHORIZED | [when this occurs] |
| 404 | NOT_FOUND | [when this occurs] |
| 500 | INTERNAL_ERROR | [when this occurs] |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `ENV_VAR_NAME` | `value` | [what it controls] |

## State Management *(skip if backend-only)*
[Describe what state this feature owns, where it lives (local/global/server), and how it updates]

## Edge Cases and Gotchas
[List non-obvious behaviors, known limitations, or things that tripped up the implementer]

- **[Case]**: [explanation]
- **[Case]**: [explanation]

## Testing
[How to test this feature in development]

```bash
# Run unit tests for this feature
[command]

# Run integration/E2E tests
[command]
```

Test files:
- `tests/[path]` — [what these tests cover]

## Security Considerations
[Any auth checks, input validation, rate limiting, or data exposure concerns specific to this feature]

## Performance Notes
[Any caching, pagination, lazy loading, or known bottlenecks]

## Changelog
| Version | Date | Change |
|---------|------|--------|
| 1.0.0 | [date] | Initial implementation |
```

---

## Phase 3: User Documentation

Create `docs/user/how-to-$ARGUMENTS.md` using this structure.

**Writing rules for user docs:**
- Use second-person ("you"), present tense, active voice
- No jargon — if a technical term is unavoidable, define it in plain language
- Every step is one action only
- Lead with the outcome, not the mechanism

```markdown
# How to [Feature Name in Plain English]

[One sentence describing what the user can accomplish with this feature]

## Before You Start
- [Prerequisite 1, e.g. "You must be logged in"]
- [Prerequisite 2, e.g. "You need Admin or Editor role"]

---

## Step-by-Step Guide

### Step 1: [Action verb + object]
[One sentence of context if needed]

<!-- SCREENSHOT: [describe what to capture, e.g. "Dashboard with the Export button highlighted in the top-right corner"] -->
![Step 1 — [description]](./screenshots/$ARGUMENTS/step-01.png)

### Step 2: [Action verb + object]
[One sentence of context if needed]

<!-- SCREENSHOT: [describe what to capture] -->
![Step 2 — [description]](./screenshots/$ARGUMENTS/step-02.png)

### Step 3: [Action verb + object]
[Continue for each meaningful step]

---

## What You'll See When It Works
[Describe the success state — what confirmation message, UI change, or result the user should expect]

<!-- SCREENSHOT: [success state] -->
![Success — [description]](./screenshots/$ARGUMENTS/success.png)

---

## Common Issues

**[Problem a user might describe in their own words]**
[Plain-language explanation and fix]

**[Problem]**
[Explanation and fix]

---

## Related Guides
- [Link to related user guide discovered in Phase 1]
- [Link to another related guide]

---

*Need more help? [Contact support / Open an issue / See the FAQ]*
```

---

## Phase 4: Auto-Detection Adjustments

Apply these additions based on the feature type identified in Phase 1:

### If Frontend-Only
- In dev docs: add a **Component Props** table for each public component
- In dev docs: add an **Accessibility** section (keyboard nav, ARIA roles, screen reader behaviour)
- In user docs: add browser/device compatibility notes if relevant

### If Backend-Only
- In dev docs: add a **Database Schema Changes** section (new tables, columns, indexes, migrations)
- In dev docs: add a **Background Jobs / Queues** section if async processing is involved
- Skip screenshot placeholders in user docs; replace with example request/response blocks
- In user docs: frame guide as an API integration guide for developers consuming the endpoint

### If Full-Stack
- Include all sections from both Frontend-Only and Backend-Only above
- Add a **Sequence Diagram** section in dev docs showing the full round-trip:
  ```
  Browser → Frontend Component → API Route → Service → DB → Response → UI Update
  ```

---

## Phase 5: Cross-References and Linking

After both files are written:

1. **In the dev doc**, add a callout at the top:
   ```
   > 👤 **End-user guide**: [docs/user/how-to-$ARGUMENTS.md](../../user/how-to-$ARGUMENTS.md)
   ```

2. **In the user doc**, add a callout at the bottom:
   ```
   > 🔧 **Developer reference**: [docs/dev/$ARGUMENTS-implementation.md](../../dev/$ARGUMENTS-implementation.md)
   ```

3. Scan the dev docs discovered in Phase 1.2. For each related doc:
   - Add it to the **Related** field in the dev doc front-matter
   - Add it to the **Related Guides** section of the user doc

4. Check if any existing docs should link *back* to the new docs. If so, append a link to their **Related** or **See Also** sections.

---

## Output Summary

When complete, confirm:

```
✅ docs/dev/$ARGUMENTS-implementation.md  — [N] sections, [N] API endpoints documented
✅ docs/user/how-to-$ARGUMENTS.md         — [N] steps, [N] screenshot placeholders
✅ Cross-references added: [list files updated]
✅ Feature type detected: [Frontend / Backend / Full-Stack]
```
