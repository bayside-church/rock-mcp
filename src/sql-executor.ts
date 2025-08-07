import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface SQLExecutionArgs {
  query: string;
  base_url?: string;
  api_key?: string;
}

export interface SQLResult {
  data: any;
}

// Execute SQL query through API
export async function executeSQL(
  args: SQLExecutionArgs
): Promise<CallToolResult> {
  const { query } = args;

  try {
    const client = createClient();
    const response = await client.post("/api/Lava/RenderTemplate", {
      params: {
        template: `{% sql %}${query}{% endsql %}`,
      },
    });
    return response.data;
  } catch (error) {
    const errorMessage = formatAPIError(error);

    return {
      content: [
        {
          type: "text",
          text: `Error executing API call: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Validate SQL execution arguments
export function validateSQLArgs(args: unknown): args is SQLExecutionArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "query" in args &&
    typeof (args as any).query === "string"
  );
}
