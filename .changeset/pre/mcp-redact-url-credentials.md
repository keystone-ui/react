---
"@keystoneui/mcp": patch
---

Stop printing credentials from configured URLs in errors and `info`

Error messages, `get_docs`'s unreachable message and `keystoneui info` (text and `--json`) no longer echo the username, password, query values or fragment of a registry or docs URL set through `KEYSTONEUI_URL`, `KEYSTONEUI_REGISTRY_URL` or `components.json`. A URL that is not `http`, `https` or `file` (such as `user:secret@host`, missing its scheme) is shown as a placeholder. The URL actually fetched is unchanged.

Install commands and theme links are printed as configured.
