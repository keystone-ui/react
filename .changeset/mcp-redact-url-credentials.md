---
"@keystoneui/mcp": patch
---

Stop printing credentials from configured URLs

Error messages, `keystoneui info` (text and `--json`), `get_docs`, `get_add_command`, `get_theme_info` and `keystoneui theme` no longer echo the username, password, query values or fragment of a registry or docs URL set through `KEYSTONEUI_URL`, `KEYSTONEUI_REGISTRY_URL` or `components.json`. The URL actually fetched is unchanged.
