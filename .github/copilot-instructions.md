<!-- skilld -->

Before modifying code:
- Quickly scan available skills
- Only use skills that are clearly relevant to the task
- Do NOT over-evaluate or block execution if uncertain

<!-- /skilld -->

# Engineering Guidelines

## 1. Planning (When Required)

Trigger planning when:
- Task involves 3+ steps
- Architectural decisions are needed
- Refactoring or debugging complex issues

### Output format:
- Step 1: ...
- Step 2: ...
- Step 3: ...

Do NOT start coding before outlining steps.

---

## 2. Implementation

- Follow the plan step-by-step
- Make the smallest possible change to achieve the goal
- Avoid introducing unnecessary abstractions

---

## 3. Code Quality

- Prefer simple and readable solutions
- Avoid temporary or hacky fixes
- Always fix root causes instead of symptoms

---

## 4. Verification

Before finishing, always check:

- Does the logic actually work?
- Are edge cases handled?
- Could this break existing behavior?

If applicable:
- Compare behavior before vs after changes
- Validate assumptions explicitly

---

## 5. Debugging

When encountering an issue:

1. Identify the root cause (not just symptoms)
2. Use logs, errors, or failing cases as evidence
3. Apply a targeted fix
4. Re-check that the issue is fully resolved

---

## 6. Iteration

- If a solution feels hacky, reconsider a cleaner approach
- Do NOT over-engineer simple tasks
- Balance simplicity and correctness

---

## 7. Communication

Before coding:
- Briefly explain the approach (1–3 sentences)
1
After coding:
- Summarize what changed
- Highlight any trade-offs or risks

---

## 8. Anti-Patterns (Avoid)

- Jumping into code without a plan (for complex tasks)
- Making large, unrelated changes
- Fixing symptoms instead of root cause
- Adding unnecessary abstractions