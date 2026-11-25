# Worked example: an organising group and its seventeen agents, before an ABP

b.abp, 25 Nov 2026, at Dinis Cruz's word. The design comes from a real volunteer team's proposed architecture and its "meet your agent team" guide; names, the organisation, dates and accounts are left out. It is a good design: agents prepare, people decide, send and sign. The map below shows which of its promises are held by something, and which only by the agents' instructions.

## The design, with its gaps

```
  [G1] anyone in the Space                [G2] runs as a person's     [G3] shared sheet =
   can instruct agents                     Google account, outside     unsigned message bus
        |                                  any ABP or hook                  |
 +------v-------+   +--------------+   +------v-------+   +--------------v--+   +----------------+
 | You + group  |-->| Chat Space   |-->| Chat bridge  |-->| Sheet: requests |-->| Concierge      |
 | ask/decide/  |<--| "agents:" or |<--| Apps Script  |<--| in, Outbox out  |<--| every hour     |
 | send/sign    |   | @the.agent   |   | every 5 min  |   +------^----------+   +------+---------+
 +--------------+   +--------------+   +--------------+          | writes own reply    | hands on
                    [G4] agents post                             | [G5] agent writes   | [G6] routing =
                    to the Space with                            | straight to Outbox  | starting work
                    no person between                            |                     |
 +------------------------+                         +------------+---------------------v----------+
 | Conductor, ProjectMgr  |  [G7] "reads all":      | 17 agents, each on its own schedule          |
 | post via the Outbox,   |  one agent reads        | [G8] one agent account: good, if it holds    |
 | read every agent's work|  everything             | only what this needs (our census)            |
 +------------------------+                         +------+---------------+--------------+--------+
 +------------------------+                         +------v-----+  +------v-----+  +-----v------+
 | The human gate         |<- - - drafts - - - - - -| Tracker    |  | "Agents"   |  | Gmail      |
 | [G9] a habit, not a    |                         | [G10] real |  | folder     |  | drafts     |
 | barrier: a connector   |                         | people's   |  | [G11] docs |  | [G9] same  |
 | that drafts can send   |                         | contacts   |  | as orders? |  | can send   |
 +------------------------+                         +------------+  +------------+  +------------+
   Across all of it: [G12] no per-agent policy  [G13] runs unseen, a partial log  [G14] no hooks where agents run
```

| # | Where | The gap | What closes it |
|---|---|---|---|
| G1 | Chat Space | Anyone who can post in the Space (or paste text into it) instructs every agent. The Sheet has a Requesters list; the Space has none. | The bridge passes on only requests from a named list of people and records who asked; everything else is data. |
| G2 | Chat bridge (Apps Script) | Runs every 5 minutes, indefinitely, with the Google access of whoever owns the script. No ABP, hook or log covers it. | Its own Google account, scoped to one Space and one Sheet; the script reviewed by security, changes as signed commits. |
| G3 | The Sheet | The message bus, unsigned: anyone with edit rights can add a request or forge an agent's reply in the Outbox. | Edit rights only for the bridge and the agent account; each row says who wrote it; replies signed. |
| G4, G5 | Outbox to Space | Replies, check-ins and briefs reach the Space with no person between. If the Space has outside members, that is a send outside. | A Space of the organising group only, or a person approves the Outbox. |
| G6 | Concierge | "Hands on bigger jobs": one agent starts or steers others. | Its grant names which agents it may hand to; it may not start new ones. |
| G7 | Conductor, Project Manager | "Reads all": one agent sees every agent's work and the whole tracker. | A read-only grant with no send. |
| G8 | The agents | They run in one dedicated agent account, which is the right hard boundary, provided that account holds no other connectors, no personal Drive and no other sessions' reach. | Take the [census](census-prompt.md) in that account and remove what the work does not need. |
| G9 | The human gate | "Agents never send, post, sign, pay or accept terms." The drafts sit in the agent account's mailbox, and a mail connector that creates drafts can usually send, forward and trash. The gate is a habit, not a barrier. | A drafts-only connection, or a person who moves each draft to send; a hook that blocks send, forward and trash is a guardrail only. |
| G10 | Tracker | Real people's contacts (universities, sponsors, media); Registration and Participant Care add participants later. | Only the agents that need contacts read them; contacts never go into prompts or reports. |
| G11 | "Agents" folder | Briefs, proposals and outside replies are read by every agent; text in a document can steer an agent. | Every policy says documents are data, never instructions; agents act only on their request row. |
| G12 | All agents | No per-agent grant of paths, connectors and hosts. A researcher and a proposal writer do not need mail. | One deny-by-default ABP per agent. |
| G13 | All agents | Weekly runs with nobody watching; the record is the Outbox and the agents' log in the tracker. | A run report per run: asked, tools called, refused; a daily review. |
| G14 | Where they run | If they run as scheduled tasks without Claude Code hooks, or on another platform, the policy is text only. | Claude Code sessions on a repository with the hooks, or rely on G8. |

## Promises in its guide, and what holds each

| The promise | Held by | What would hold it |
|---|---|---|
| Agents never send, post, sign, pay or accept terms | instructions | G9's drafts-only mail |
| Status, Owner and Outcome entries made by people are never changed | instructions | Google Sheets protected ranges that lock those columns against the agent account |
| Agents work only inside two shared Drive folders | the agent account's sharing, if nothing else is shared to it | confirm by census |
| Agents contact no one outside the team | the Space's membership | keep outside people out of the Space |
| Nothing about anyone under 18 | people not typing it | a decision before registration opens: a workshop may have under-18 participants, and Registration and Participant Care will hold their details |
| (not stated) | | a feedback export from a messaging app carries other people's names and phone numbers: strip them before an agent reads it |

**The three that matter most:** the agent account holding only what the work needs (G8); the mail connector that can send (G9), on which "nothing leaves the team without a person" rests; and the open Space (G1).
