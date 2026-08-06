---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases. Also invoked by the grill-me entry skill.
metadata:
  author: mattpocock
  version: "1.0.0"
---

# Grilling

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

## The Design Tree & Frontier

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled — the questions you can ask _now_ without guessing at answers you haven't heard yet.

Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

## Question Format

Each question must follow this format:

```
❓ **Q1 — <question title>**: <question body — might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

- Use ❓ emoji before each question
- Bold the question ID and title (e.g., `**Q1 — Database Choice**`)
- Body explains the decision point, trade-offs, and lists choices if applicable
- ➡️ prefix marks your recommended answer with reasoning

## Round Mechanics

1. **Compute the frontier**: what decisions can be made NOW given all settled answers?
2. **Ask the entire frontier** in one message — number Q1, Q2, Q3...
3. **Wait** for the user to answer each question
4. Each answer **reshapes the tree** — settled decisions push the frontier outward and unblock dependent questions
5. **Recompute** the frontier and ask the next round
6. A question whose answer depends on another question still open in this round belongs to a **later** round, not this one

## Fact-Finding is YOUR Job

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, codebase, etc.), dispatch a sub-agent using the `Agent` tool to find it — don't ask the user for anything you could look up yourself.

**Don't block on it**: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report — ask the rest of the frontier immediately.

The _decisions_ are the user's — put each to them and wait.

## Completion

The session is done when the **frontier is empty**: every branch of the design tree visited, nothing left silently assumed.

When the frontier is empty, summarize the shared understanding you've reached and ask the user to confirm. **Do not act** on the plan until the user confirms you have reached a shared understanding.

## Example

User says: "Grill me on my plan to add real-time notifications"

Your Round 1 might look like:

```
I'll map out the notification architecture as a design tree. Let's start with the root decisions.

❓ **Q1 — Delivery Mechanism**: How should notifications reach the user? Options:
- **WebSockets** — persistent connection, true real-time, more infra
- **SSE (Server-Sent Events)** — simpler, unidirectional, good for feeds
- **Polling** — simplest, higher latency, wasteful bandwidth

➡️ SSE — for a notification feed you don't need bidirectional, and SSE is simpler to deploy and scale. Unless you need client→server real-time as well.

❓ **Q2 — Scope**: What events trigger notifications? Is this all app events or a curated subset?

➡️ Start with a curated subset — "someone liked your post", "new comment", "mentioned you". Expanding later is easier than cutting back.
```

Then wait for answers before Round 2.
