# Restarting b.abp

1. **Read** agent.json, now.md, role.md and policies/README.md here, and the start prompt linked in agent.json.
2. **Clone** SovereignWebsite/Site__Agent__ABP on dev.
3. **Make a new key:** `bash tools/setup-signing.sh <name> <new-session-url>`. The old key ends with its old session; use the name Dinis gives (for example b.abp-2) if one live key per name applies. The first commit adds only site/keys/<name>.json.
4. **Update this area** (agent.json session, key and `updated`; now.md) in the next commit, after `bash tools/check.sh`.
5. **Tell b.maestro** (session in agent.json `started_by`) the new session link, so routing follows.
