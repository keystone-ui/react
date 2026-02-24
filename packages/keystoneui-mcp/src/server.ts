import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { loadProjectConfig } from "./config.js";
import {
  auditChecklistTool,
  getAddCommandTool,
  getThemeInfoTool,
  listComponentsTool,
  searchComponentsTool,
  viewComponentTool,
} from "./tools.js";

const config = loadProjectConfig();

export const server = new McpServer(
  {
    name: "keystoneui",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
    instructions:
      "Keystone UI MCP server. Use these tools to discover, search, view, and install Keystone UI components. Start with list_components or search_components to explore available components, then view_component to get full source code.",
  }
);

server.tool(
  "list_components",
  "List all available Keystone UI components and blocks with pagination. Returns name, description, and dependency info for each item.",
  {
    limit: z
      .number()
      .min(1)
      .max(100)
      .default(20)
      .describe("Maximum number of items to return"),
    offset: z.number().min(0).default(0).describe("Number of items to skip"),
    type: z
      .enum(["ui", "block"])
      .optional()
      .describe("Filter by item type: 'ui' for components, 'block' for blocks"),
  },
  async ({ limit, offset, type }) => ({
    content: [
      {
        type: "text",
        text: await listComponentsTool(config, { limit, offset, type }),
      },
    ],
  })
);

server.tool(
  "search_components",
  "Fuzzy search Keystone UI components by name, description, or keywords. Good for finding components when you're not sure of the exact name.",
  {
    query: z.string().describe("Search query (name, description, or keywords)"),
    limit: z
      .number()
      .min(1)
      .max(50)
      .default(10)
      .describe("Maximum number of results"),
    type: z.enum(["ui", "block"]).optional().describe("Filter by item type"),
  },
  async ({ query, limit, type }) => ({
    content: [
      {
        type: "text",
        text: await searchComponentsTool(config, { query, limit, type }),
      },
    ],
  })
);

server.tool(
  "view_component",
  "Get full details for one or more Keystone UI components, including complete source code, dependencies, and registry dependencies. Use this to understand how a component works before using or customizing it.",
  {
    names: z
      .array(z.string())
      .min(1)
      .max(5)
      .describe(
        'Component names to view (e.g. ["button", "card"]). Returns full source code.'
      ),
  },
  async ({ names }) => ({
    content: [
      { type: "text", text: await viewComponentTool(config, { names }) },
    ],
  })
);

server.tool(
  "get_add_command",
  "Generate the shadcn CLI command to install one or more Keystone UI components into a project.",
  {
    names: z
      .array(z.string())
      .min(1)
      .describe("Component names to generate install commands for"),
  },
  async ({ names }) => ({
    content: [
      { type: "text", text: await getAddCommandTool(config, { names }) },
    ],
  })
);

server.tool(
  "get_theme_info",
  "Get Keystone UI theme configuration: CSS setup, semantic color tokens (OKLCH), radius scale, dark mode setup, and custom tokens.",
  async () => ({
    content: [{ type: "text", text: await getThemeInfoTool(config) }],
  })
);

server.tool(
  "audit_checklist",
  "Get a post-install audit checklist to verify Keystone UI is correctly configured in your project. Covers CSS setup, Tailwind config, dependencies, imports, and common issues.",
  async () => ({
    content: [{ type: "text", text: await auditChecklistTool() }],
  })
);
