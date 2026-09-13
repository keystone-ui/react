import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { loadProjectConfig } from "./config.js";
import { readPackageVersion } from "./package-version.js";
import {
  auditChecklistTool,
  getAddCommandTool,
  getDocsTool,
  getExamplesTool,
  getProjectContextTool,
  getThemeInfoTool,
  listComponentsTool,
  searchComponentsTool,
  TOOL_SPECS,
  viewComponentTool,
} from "./tools.js";

const config = loadProjectConfig();

export const server = new McpServer(
  {
    name: "keystoneui",
    version: readPackageVersion(),
  },
  {
    capabilities: {
      tools: {},
    },
    instructions:
      "Keystone UI MCP server. Use these tools to discover, search, view, and install Keystone UI components. Start with list_components or search_components to explore available components, then view_component to get full source code.",
  }
);

/** Wrap a tool's string output in the MCP content envelope. */
function text(value: string) {
  return { content: [{ type: "text" as const, text: value }] };
}

// Descriptions and input shapes come from TOOL_SPECS in tools.ts -- the single
// declaration site. Registering from it is what stops the registered shape and
// the documented shape from drifting apart, which is how `category` came to be
// missing from the docs while the server accepted it.

server.tool(
  "list_components",
  TOOL_SPECS.list_components.description,
  TOOL_SPECS.list_components.schema.shape,
  async (input) => text(await listComponentsTool(config, input))
);

server.tool(
  "search_components",
  TOOL_SPECS.search_components.description,
  TOOL_SPECS.search_components.schema.shape,
  async (input) => text(await searchComponentsTool(config, input))
);

server.tool(
  "view_component",
  TOOL_SPECS.view_component.description,
  TOOL_SPECS.view_component.schema.shape,
  async (input) => text(await viewComponentTool(config, input))
);

server.tool(
  "get_add_command",
  TOOL_SPECS.get_add_command.description,
  TOOL_SPECS.get_add_command.schema.shape,
  (input) => text(getAddCommandTool(config, input))
);

server.tool(
  "get_examples",
  TOOL_SPECS.get_examples.description,
  TOOL_SPECS.get_examples.schema.shape,
  async (input) => text(await getExamplesTool(config, input))
);

server.tool(
  "get_docs",
  TOOL_SPECS.get_docs.description,
  TOOL_SPECS.get_docs.schema.shape,
  async (input) => text(await getDocsTool(config, input))
);

server.tool(
  "get_project_context",
  TOOL_SPECS.get_project_context.description,
  () => text(getProjectContextTool())
);

server.tool("get_theme_info", TOOL_SPECS.get_theme_info.description, async () =>
  text(await getThemeInfoTool(config))
);

server.tool(
  "audit_checklist",
  TOOL_SPECS.audit_checklist.description,
  async () => text(await auditChecklistTool())
);
