# Example 8: Ensure Claude Code Checks Its Own Work
# Technique: Built-in Quality Gates

## Purpose
- Make Claude verify its own changes before they are committed
- Isolate every change on its own branch so `main` stays clean
- Require tests and a passing build as a non-negotiable gate

## CLAUDE.md
```markdown
IMPORTANT:
1. Before you make any change, create and checkout a feature branch named "feature_some_short_name". Make and then commit your changes in this branch.
2. You must write automated tests for all code.
3. You must compile the code and pass ALL tests before committing.
```

## Why It Works
- **Feature branch first**: Every change is isolated and easy to review, revert, or discard
- **Tests for all code**: Claude has to prove its code works, not just claim it does
- **Compile and pass ALL tests before committing**: Broken builds and regressions are caught by Claude, not by you
- **"IMPORTANT" + numbered rules**: Short, emphatic, actionable instructions are followed more reliably than long prose

## Tips
- Combine with [Example 7](example-7-think-and-plan-first.md): plan first, then implement with these gates in place
- Name the exact build and test commands for your project (e.g. `npm run build && npm test`, `pytest`, `mvn verify`) so Claude runs the right ones
