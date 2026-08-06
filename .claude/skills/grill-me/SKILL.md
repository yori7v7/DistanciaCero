---
name: grill-me
description: A relentless interview to sharpen a plan or design. User-invoked — say /grill-me or "grill me" to start.
disable-model-invocation: true
metadata:
  author: mattpocock
  version: "1.0.0"
  argument-hint: "[plan or topic to grill]"
---

# Grill Me

A relentless interview to sharpen a plan or design. This skill delegates to the `grilling` skill which runs the full interview protocol.

## Usage

When the user invokes this skill (e.g., `/grill-me`, "grill me on X", "grill my plan"):

1. Extract the topic/plan the user wants to be grilled on
2. Invoke the `grilling` skill via the Skill tool with the topic as context
3. The grilling skill will run the interview rounds until every branch of the design tree is resolved
