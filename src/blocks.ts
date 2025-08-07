import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface BlocksExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

// Execute Blocks API call
export async function executeBlocks(
  args: BlocksExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();
    const response = await client.get("/api/Blocks", {
      params: args.params,
    });

    return response.data;
  } catch (error) {
    const errorMessage = formatAPIError(error);

    return {
      content: [
        {
          type: "text",
          text: `Error fetching blocks: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Validate Blocks execution arguments
export function validateBlocksArgs(args: unknown): args is BlocksExecutionArgs {
  return args !== null && typeof args === "object";
}
