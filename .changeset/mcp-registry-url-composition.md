---
"@keystoneui/mcp": patch
---

Compose registry URLs correctly when they have a query, a fragment, a trailing slash or a `{name}` template

A registry URL set through `KEYSTONEUI_REGISTRY_URL` or a `components.json` `@keystoneui` `{ "url": … }` object is now composed with the path before its query: `https://host/r?v=1` requests `https://host/r/registry.json?v=1` instead of `https://host/r?v=1/registry.json`. A fragment is dropped instead of the path, and a trailing slash no longer doubles (`https://host/r/` requests `https://host/r/button.json`). An `@keystoneui` object whose `url` is a `{name}` template (`https://host/r/{name}.json`) has the item name put into it, with its `params` appended after the template's own query; its catalogue and demos are read from beside the item file when the template ends in `/{name}.json`. `get_add_command`, `get_theme_info` and the catalogue link in `keystoneui info` print the same composed URLs. The default registry and plain base URLs are requested and printed exactly as before, and headers in a `components.json` entry are still not sent.
