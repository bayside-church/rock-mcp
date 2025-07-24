import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface PagesExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

// Execute Pages API call
export async function executePages(
  args: PagesExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();
    const response = await client.get("/api/Pages", {
      params: args.params,
    });

    const result = response.data.map((page: any) => ({
      id: page.Id,
      name: page.PageTitle,
      guid: page.Guid,
      parentPageId: page.ParentPageId,
    }));

    return result;
  } catch (error) {
    const errorMessage = formatAPIError(error);

    return {
      content: [
        {
          type: "text",
          text: `Error fetching pages: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Validate Pages execution arguments
export function validatePagesArgs(args: unknown): args is PagesExecutionArgs {
  return args !== null && typeof args === "object";
}
