import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createClient, formatAPIError } from "./api-client.js";

export interface LavaAppsExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

// Execute Lava Apps API call
export async function executeLavaApps(
  args: LavaAppsExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();
    const pagesResponse = await client.get("/api/Pages", {
      params: {
        $filter: "PageTitle eq 'Lava Applications'",
        $select: "Id,Guid,PageTitle,InternalName",
      },
    });
    console.log(pagesResponse.data);
    return pagesResponse.data;
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

// Validate Lava Apps execution arguments
export function validateLavaAppsArgs(
  args: unknown
): args is LavaAppsExecutionArgs {
  return args !== null && typeof args === "object";
}
