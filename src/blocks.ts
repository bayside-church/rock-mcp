import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface BlocksExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

export interface AddBlocksArgs {
  name: string;
  blockTypeId?: number;
  pageId?: number;
  zone?: string;
  order?: number;
}

// Get Blocks API call
export async function getBlocks(
  args: BlocksExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = await createClient();
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

// Add a new Block
export async function addBlock(args: AddBlocksArgs): Promise<CallToolResult> {
  try {
    const client = await createClient();

    // Prepare the data for the new Block
    const blockData = {
      Name: args.name,
      BlockTypeId: args.blockTypeId,
      PageId: args.pageId,
      Zone: args.zone || "Main",
      Order: args.order || 1,
    };

    // Post to the Blocks API endpoint
    const response = await client.post("/api/Blocks", blockData);

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Block: ${JSON.stringify(
            response.data,
            null,
            2
          )}`,
        },
      ],
    };
  } catch (error) {
    console.error("error", error);
    const errorMessage = formatAPIError(error);

    return {
      content: [
        {
          type: "text",
          text: `Error creating Block: ${errorMessage}`,
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

// Validate Add Blocks arguments
export function validateAddBlocksArgs(args: unknown): args is AddBlocksArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "name" in args &&
    typeof (args as any).name === "string"
  );
}
