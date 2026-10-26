# Claude Code Commands

## What are Claude Code Commands?

While `claude.md` provides global context for every interaction, commands deliver targeted context and process for specific, repeatable tasks. Think of commands as specialized instruction sets that give Claude Code exactly what it needs to know for particular workflows — without overwhelming it with irrelevant information.

---

## The TARGETED Framework for Command Design

Use this acronym to create effective commands:

- **T** — Task-Specific Instructions
- **A** — Arguments and Placeholders
- **R** — Reusable Process Steps
- **G** — Guided Examples and References
- **E** — Explicit Output Requirements
- **T** — Template-Based Naming
- **E** — Error Handling and Edge Cases
- **D** — Documentation and Context

---

## Core Principles

### 1. Right Context at the Right Time
Commands solve the "400-page manual" problem by providing only the relevant context needed for a specific task, avoiding information overload.

### 2. Reusable Consistency
Commands ensure the same high-quality process is followed every time a task is performed, scaling your best practices across your AI labor.

### 3. Template-Driven Automation
Use placeholders and templates to make commands flexible while maintaining structure and naming conventions.

---

## Command Structure and Location

Commands are stored as markdown files in the `.claude/commands/` directory:

- **Project-specific**: `.claude/commands/` — versioned with your project
- **Global commands**: `~/.claude/commands/` — available across all projects

---

## Command Management Tips

### Organization Strategies

- **By Function**: `plan-feature.md`, `impl-api.md`, `test-unit.md`, `deploy-prod.md`
- **By Domain**: `auth-login.md`, `user-profile.md`, `payment-process.md`, `order-create.md`
- **By Role**: `dev-review.md`, `qa-automation.md`, `ops-deploy.md`, `pm-requirements.md`

### Version Control
- Store project commands in `.claude/commands/` for team sharing
- Use descriptive commit messages when updating commands
- Review command changes as part of code review process

### Command Evolution
- Regularly review and update commands based on team feedback
- Archive outdated commands rather than deleting them
- Document command changes in project changelog

---

## Examples in This Folder

| File | Description |
|------|-------------|
| [code-review.md](code-review.md) | Comprehensive code review against project standards |
| [api-test.md](api-test.md) | API endpoint test generation |
| [scaffold-feature.md](scaffold-feature.md) | Expense tracker: plan-first feature build following CLAUDE.md recipes, with docs and verification |
| [fix-known-issue.md](fix-known-issue.md) | Expense tracker: reproduce, root-cause and close a bug listed in CLAUDE.md §8 |
| [migrate-storage.md](migrate-storage.md) | Expense tracker: safely change the shape of localStorage data without losing users' records |

> **Note**: These examples are not meant to be used "as-is". Adapt them for your project. The best commands will be customized to your specific workflows, conventions, and tooling.

---

Commands transform Claude Code from a general assistant into a specialized team member with deep knowledge of your specific workflows. They ensure consistent, high-quality execution of repetitive tasks while providing the targeted context needed for complex operations.
