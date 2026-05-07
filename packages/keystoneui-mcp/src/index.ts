import { isCliVerb, runCli } from "./cli.js";

const verbCandidate = process.argv[2];

if (
  verbCandidate === "--help" ||
  verbCandidate === "-h" ||
  verbCandidate === "help"
) {
  await runCli(process.argv.slice(2));
  process.exit();
}

if (isCliVerb(verbCandidate)) {
  await runCli(process.argv.slice(2));
  process.exit();
}

const { StdioServerTransport } = await import(
  "@modelcontextprotocol/sdk/server/stdio.js"
);
const { server } = await import("./server.js");

const transport = new StdioServerTransport();
await server.connect(transport);
