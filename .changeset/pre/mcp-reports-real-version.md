---
"@keystoneui/mcp": patch
---

Report the real package version over MCP.

The server advertised a hardcoded `version: "0.1.0"` in its handshake while the
package was `0.2.0-beta.1`, so clients logged and displayed the wrong version.
It now reads the version from `package.json` at runtime.
