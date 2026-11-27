# Can an agent not in the policy commit to SovereignWebsite__IaC?

b.abp, 27 Nov 2026, 17:37 UTC. Asked by b.conductor, relaying Dinis Cruz in its session: "this agent was mistaken given the IaC repo. can you check (and also get the abp agent involved) if we already have a policy that would prevent any commits to that repo". Context: elevenlabs.b and soundcloud.b were started with SovereignWebsite__IaC as their only repository. Read from IaC's dev branch, read-only, at the time above.

## Short answer
**No control prevents the commit or the push today. One control detects it afterwards.**

```
  agent session with IaC attached (push)
        |
        |  1. session settings    .claude/settings.json: NO hooks; it PRE-ALLOWS
        |                          "git push origin dev"            -> nothing stops it
        |  2. ABP hook             none installed in IaC              -> nothing stops it
        v
  git push origin dev
        |  3. GitHub ruleset      dev-safe (build/org-apply.mjs): blocks deletion and
        |                          force-push only; no required checks -> the push lands
        v
  commit is on dev
        |  4. Checks workflow     on push: build/abp.mjs paths, check-signatures
        |                          "Agent X is not in the policy"     -> run turns RED
        v
  detected, after the fact; nothing reverts it
```

## b.conductor's three findings: confirmed
1. **policy/abp.json** has 10 entries and neither elevenlabs.b nor soundcloud.b. `checkPaths` (build/abp.mjs line 87) refuses any change by an agent with no entry, except `team/keys.json` within the keys rule; a commit with no Agent: trailer is refused too.
2. **The check is detection.** .github/workflows/checks.yml runs on push to dev and on pull requests. The dev-safe ruleset, as written in build/org-apply.mjs, has the rules `deletion` and `non_fast_forward` and no bypass actors; no required status check. (The live ruleset was not read: that needs GitHub's API.)
3. **Their commits so far are key entries only:** 9b55371 (elevenlabs.b), 2c958c6, be0cdbe (a retirement), a922465 (soundcloud.b); each changes only `team/keys.json`, its own entry.

## What b.conductor missed
- **IaC's own `.claude/settings.json` makes pushing easier:** it pre-approves `git push origin dev` and `git push -q origin dev`, and wires no hook. Any session with IaC attached pushes without a permission prompt.
- **GitHub cannot tell agents apart.** Every cloud session pushes through the same GitHub identity, so a ruleset can say "no direct pushes" but not "only these agents". Who an agent is lives only in its signed commit and its Agent: trailer, which CI checks after the push.

## Options for Dinis
- **a) Remove the reach (recommended now).** A new agent's session never has IaC attached: it starts from its own home and publishes its key there (site/keys/<name>.json, which the signer checks accept since Dinis's record of 23 Nov). Written into the conductors' and b.sites's start prompts. Plus an ABP hook in IaC that blocks writes outside `team/keys.json` by an agent not in policy/abp.json (R6), and replaces the pre-approved push. A guardrail; changes to IaC's .claude/ wait for Dinis's merge.
- **b) Make GitHub prevent it.** Add the Checks job as a required status check to dev-safe. Direct pushes then fail until checks pass, so every IaC change goes through a pull request or a merge queue. A hard boundary, and slower for every agent; it changes build/org-apply.mjs and the org's rulesets (Dinis's merge).
- **c) Keep detection only**, and have the red run raise a HOLD.

**Recommendation:** a) now, b) when Dinis is ready for pull requests on IaC. The four commits stand: they are within the keys rule.
