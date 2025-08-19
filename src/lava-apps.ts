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

    if (pagesResponse.data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Applications page",
          },
        ],
      };
    }

    const pageGuid = pagesResponse.data[0].Guid;

    const blocksResponse = await client.get("/api/Blocks", {
      params: {
        $filter: `Name eq 'Lava Application List'`,
        $select: "Id,Name,BlockTypeId,Guid",
      },
    });

    if (blocksResponse.data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application List block",
          },
        ],
      };
    }

    const blockGuid = blocksResponse.data[0].Guid;

    console.error(
      "fetching grid data",
      `/api/v2/BlockActions/${pageGuid}/${blockGuid}/GetGridData`
    );

    const gridResponse = await client.get(
      `/api/v2/BlockActions/${pageGuid}/${blockGuid}/GetGridData`,
      {}
    );

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(gridResponse.data, null, 2),
        },
      ],
    };
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
