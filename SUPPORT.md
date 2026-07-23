# Support

> [!WARNING]
> 🧪 **Experimental — do not deploy to production.** MSDefender-MCP is an early-stage, actively-changing project. It is intended for **isolated lab tenants, personal sandboxes, and research use only**. Do not point it at a live Microsoft Defender tenant that protects real users or real data. There is **no SLA, no warranty, and no guarantee of ongoing maintenance**.

## What this project is

- An **independent, open-source** experiment in wiring Microsoft Defender XDR and Microsoft Graph into the Model Context Protocol (MCP) so that AI assistants can drive investigations against a Defender tenant using an interactive user's own browser session.
- Distributed under the [MIT license](README.md#license).
- A solo, hobby-scale effort — there is no company, no team, no funded roadmap.

## What this project is **not**

- ❌ **Not affiliated with, endorsed by, or supported by Microsoft Corporation.** "Microsoft", "Microsoft Defender", "Microsoft Defender XDR", "Microsoft Graph", and related product names are trademarks of their respective owners; they are referenced here only to describe the APIs this software interacts with.
- ❌ **Not a supported community project** — there is no dedicated community, no user group, no Slack/Discord, no mailing list, no forum. The only support surface is the GitHub Issues tab.
- ❌ **Not a security product.** Session-cookie-based access, no MFA-aware token refresh, no formal auditing, no operational hardening. This is a research and analysis convenience tool.
- ❌ **Not production-ready.** APIs, tool names, response shapes, and internal architecture can and will change between commits without notice.

## Where to get help

| Need | Where to go |
|---|---|
| 🐛 **Bug report** | [Open a GitHub Issue](../../issues/new) with reproduction steps, expected vs. actual behaviour, MCP client, Node.js version, and the relevant log snippet (with all tenant IDs, UPNs, hostnames, and cookies redacted). |
| 💡 **Feature request** | [Open a GitHub Issue](../../issues/new) describing the use case. No commitment to implement — see below. |
| ❓ **Question / how do I…?** | [Open a GitHub Issue](../../issues/new). There is no discussion forum. Replies may take days or may never come. |
| 🔒 **Security concern** | [Open a GitHub Issue](../../issues/new) **and mark the title `[security]`**. There is no private disclosure channel — this project holds no user data and connects only to APIs the running user is already authorised for, so responsible-disclosure is best-effort. |
| 🛠️ **Pull requests** | Fork the repo, branch from `main`, keep changes focused, include a Changelog entry in both `README.md` files, and open a PR. Small, incremental PRs merge faster. Refactor-only or reformat-only PRs will usually be closed. |
| 🏢 **Enterprise / commercial support** | None available. |

## What is **not** in scope

- **Production deployments.** Do not ask for help hardening this for production — that is a fundamentally different project than what MSDefender-MCP tries to be.
- **Microsoft product support.** Do not report Defender product bugs, licensing questions, or tenant-side issues here. Contact [Microsoft Support](https://support.microsoft.com/) for anything that is actually about Defender or Microsoft 365.
- **Reverse-engineering assistance.** This project already reuses your authenticated browser session; further reverse-engineering questions about Defender internals belong elsewhere.

## Response expectations

- **Best-effort only.** Issues may be triaged in hours, days, weeks — or never. This is a spare-time project.
- **No release cadence.** Versions are cut when there is meaningful, tested change. There is no committed schedule.
- **No backports.** Fixes land on `main`; older versions are not patched.
- **Reprioritisation is common.** Feel free to add reactions or comments to bump visibility on an issue that matters to you; there is no promise it will be addressed.

## Contributing

See the Pull Requests row above for the short version. In more detail:

1. **Open an issue first** for anything larger than a one-line fix — it is much less painful to discover a change won't be accepted before spending hours on it than after.
2. **Do not commit tenant-specific data.** No real alert IDs, incident numbers, user UPNs, hostnames, SIDs, tenant GUIDs, network message IDs, or session cookies. Any accidental inclusion is treated as a security issue and will trigger a history rewrite.
3. **Match existing code style.** No formatter is enforced today; try to look like the neighbouring code.
4. **Update both READMEs** if you change a public tool signature, add a source, or bump the changelog.

## Trademark & attribution

- "Microsoft®", "Microsoft Defender®", "Microsoft Defender XDR®", "Microsoft Graph™", "Microsoft 365®", "Azure®" and related marks are trademarks of Microsoft Corporation.
- "Chrome™" is a trademark of Google LLC.
- "Node.js®" is a registered trademark of the OpenJS Foundation.
- "Claude™" is a trademark of Anthropic, PBC.
- "Cline" and "Roo / Zoo Code" are trademarks of their respective authors.
- The Model Context Protocol (MCP) specification is a public specification and is not owned by this project.

All other product names, logos, and brands are property of their respective owners and are used here for identification and interoperability purposes only. No sponsorship or endorsement is implied.
