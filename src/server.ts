#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  CallToolResult,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import {
  executeSQL,
  validateSQLArgs,
  SQLExecutionArgs,
} from "./sql-executor.js";
import {
  executePages,
  validatePagesArgs,
  PagesExecutionArgs,
} from "./pages.js";

// Create server instance
const server = new Server(
  {
    name: "rock-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Setup tool handlers
function setupToolHandlers(): void {
  server.setRequestHandler(
    ListToolsRequestSchema,
    async (): Promise<{ tools: Tool[] }> => {
      return {
        tools: [
          {
            name: "execute_sql",
            description: "Execute SQL queries against the RockRMS server",
            inputSchema: {
              type: "object",
              properties: {
                query: {
                  type: "string",
                  description: "The SQL query to execute",
                },
              },
              required: ["query"],
            },
          },
          {
            name: "get_pages",
            description: "Get pages from the RockRMS /api/Pages endpoint",
            inputSchema: {
              type: "object",
              properties: {
                params: {
                  type: "object",
                  description:
                    "Query parameters for filtering pages (e.g., $filter, $select, $top)",
                },
              },
              required: [],
            },
          },
        ],
      };
    }
  );

  server.setRequestHandler(
    CallToolRequestSchema,
    async (request): Promise<CallToolResult> => {
      if (request.params.name === "execute_sql") {
        const args = request.params.arguments;
        if (!validateSQLArgs(args)) {
          throw new Error("Missing required parameter: query");
        }
        return await executeSQL(args);
      }

      if (request.params.name === "get_pages") {
        const args = request.params.arguments;
        if (!validatePagesArgs(args)) {
          throw new Error("Invalid arguments for get_pages");
        }
        return await executePages(args);
      }

      throw new Error(`Unknown tool: ${request.params.name}`);
    }
  );
}

// Setup error handling
function setupErrorHandling(): void {
  server.onerror = (error: Error) => {
    console.error("[MCP Error]", error);
  };

  process.on("SIGINT", async () => {
    await server.close();
    process.exit(0);
  });
}

// Main run function
async function run(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Rock MCP Server running on stdio");
}

// Initialize and run the server
setupToolHandlers();
setupErrorHandling();
run().catch(console.error);
