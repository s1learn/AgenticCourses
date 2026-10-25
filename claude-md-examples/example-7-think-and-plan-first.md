# Example 7: Having Claude Code Think & Plan First
# Technique: Plan Before Implementing

## Why Think First?
- **Avoid costly mistakes**: Catch architectural dead-ends and integration problems before any code is written
- **Evaluate alternatives**: Let Claude weigh multiple approaches and edge cases upfront
- **Cheaper corrections**: It is MUCH faster to point out a mistake in Claude's plan and have it fix the plan than to undo poor implementation decisions made on the fly
- **Best suited for**: Complex features, architectural decisions, and integration challenges where the cost of rework is high

## Extended Thinking Levels
Claude Code provides progressively deeper thinking modes triggered by specific phrases:

| Phrase | Use For |
|---|---|
| `think` | Basic extended thinking for straightforward problems |
| `think hard` | Deeper analysis for moderate complexity |
| `think harder` | Comprehensive evaluation for complex scenarios |
| `ultrathink` | Maximum thinking budget for highly complex problems |

Each level allocates more computation for Claude to evaluate alternatives, consider edge cases, and develop robust solutions.

## Save the Plan to a File
Ask Claude to save its analysis as `FEATURE_PLAN.md`, `INTEGRATION_DESIGN.md`, or similar. A saved plan lets you:
- Review it offline and share it with team members
- Edit it to add constraints or requirements before giving the go-ahead to implement
- Use it as a reference throughout development, when debugging, and when onboarding
- Keep a paper trail of design decisions so the reasoning doesn't get lost in the code

## Workflow
1. Ask Claude to think (at the appropriate level) and produce a plan — no code yet
2. Have Claude save the plan to a file
3. Review and edit the plan; ask Claude to revise it if needed
4. Give Claude the go-ahead to implement against the approved plan

## Example Prompt
```
Think hard about how to implement a machine learning-powered expense
categorization system that learns from user behavior and suggests
categories automatically.

1. What are the core technical challenges?
2. What data do we need to collect and how?
3. What ML approaches would work best for this problem?
4. How should we handle privacy and data security?
5. What's the user experience flow?
6. How do we handle edge cases and errors?
7. What's the deployment and maintenance strategy?

Provide a comprehensive technical analysis before we start coding.
Save the plan to development_plan.txt
```

## CLAUDE.md Snippet
```markdown
## Planning
- For complex features, architectural changes, or integrations, produce a written plan before writing code
- Save plans to `/docs/plans/[FEATURE_NAME]_PLAN.md`
- Do not start implementation until the plan has been reviewed and approved
```
