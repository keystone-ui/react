import { init } from "./init.js";

if (process.argv[2] === "init") {
  await init();
  process.exit();
}

const { StdioServerTransport } = await import(
  "@modelcontextprotocol/sdk/server/stdio.js"
);
const { server } = await import("./server.js");

const transport = new StdioServerTransport();
await server.connect(transport);
