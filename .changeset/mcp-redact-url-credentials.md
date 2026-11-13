---
"@keystoneui/mcp": patch
---

Stop printing credentials from configured URLs in errors and `info`

Error messages, `get_docs`'s unreachable message and `keystoneui info` (text and `--json`) no longer echo the username, password, query values or fragment of a registry or docs URL set through `KEYSTONEUI_URL`, `KEYSTONEUI_REGISTRY_URL` or `components.json`. The URL actually fetched, and printed install commands and links, are unchanged.
