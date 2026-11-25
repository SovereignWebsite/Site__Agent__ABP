# The capability census prompt

Paste this into any agent session: Claude (claude.ai, Claude Code, cloud sessions), ChatGPT, Mistral Le Chat, Gemini or another. It asks the agent to map what it can reach from the inside, without using any of it.

---

Do a capability census of this session, from the inside. Do not call, test or use any tool, connector or credential while you do it: only read what your own context and settings show you.

1. List every tool, connector, plugin, app, action and MCP server you can see, by its exact name, including ones that are listed but not signed in.
2. Group them: connectors to my accounts (mail, files, calendar, chat, music, payments), control of other sessions or agents (create, message, read, stop), schedules and background tasks, memory shared across chats, code execution and shell, network access and any credentials added for me, my own computer or browser, publishing and sharing, repositories.
3. For each, say what it can do in one line, and rate it: high (sends, spends, deletes, or reaches other sessions or my accounts), medium, low.
4. Draw it as ASCII art: me at the top, my accounts and connectors in the middle, this session at the bottom, with arrows for what can reach what.
5. List what you were told you may do (your instructions), what you can actually reach, and the difference between them.
6. Ask me, one family at a time, whether I want this session to have it. Do not change anything: just record my answers.
7. Give the whole census as JSON in the shape of https://abp.agents.sovereignweb.site/factory/dinis-cruz/account-b/surface/census/2026-11-25T1910Z-b.abp.json , with the time from the clock, so the next census can be compared with it.

---

**Why:** what an agent can reach changes without notice, when the platform adds a feature or a connector is added to the account. Taking the census at every start and comparing it with the last one turns that change into data.
