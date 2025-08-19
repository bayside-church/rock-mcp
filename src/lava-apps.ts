import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { createClient, formatAPIError } from "./api-client.js";

export interface LavaAppsExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

export interface AddLavaAppArgs {
  name: string;
  slug?: string;
  description?: string;
  configurationRigging?: string;
  isActive?: boolean;
}

// Utility function to get page GUID by page title
async function getPageGuid(pageTitle: string): Promise<string | null> {
  try {
    const client = createClient();
    const pagesResponse = await client.get("/api/Pages", {
      params: {
        $filter: `PageTitle eq '${pageTitle}'`,
        $select: "Id,Guid,PageTitle,InternalName",
      },
    });

    if (pagesResponse.data.length === 0) {
      return null;
    }

    return pagesResponse.data[0].Guid;
  } catch (error) {
    console.error(`Error fetching page '${pageTitle}':`, error);
    return null;
  }
}

// Utility function to get block GUID by block name
async function getBlockGuid(blockName: string): Promise<string | null> {
  try {
    const client = createClient();
    const blocksResponse = await client.get("/api/Blocks", {
      params: {
        $filter: `Name eq '${blockName}'`,
        $select: "Id,Name,BlockTypeId,Guid",
      },
    });

    if (blocksResponse.data.length === 0) {
      return null;
    }

    return blocksResponse.data[0].Guid;
  } catch (error) {
    console.error(`Error fetching block '${blockName}':`, error);
    return null;
  }
}

// Execute Lava Apps API call
export async function executeLavaApps(
  args: LavaAppsExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();

    const pageGuid = await getPageGuid("Lava Applications");
    if (!pageGuid) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Applications page",
          },
        ],
      };
    }

    const blockGuid = await getBlockGuid("Lava Application List");
    if (!blockGuid) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application List block",
          },
        ],
      };
    }

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

// Add a new Lava App
export async function addLavaApp(
  args: AddLavaAppArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();

    const pageGuid = await getPageGuid("Lava Application Detail");
    if (!pageGuid) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application Detail page",
          },
        ],
      };
    }

    const blockGuid = await getBlockGuid("Lava Application Detail");
    if (!blockGuid) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application Detail block",
          },
        ],
      };
    }

    const response = await client.post(
      `/api/v2/BlockActions/${pageGuid}/${blockGuid}/Save`,
      {
        box: {
          entity: {
            attributes: {},
            attributeValues: {},
            configurationRigging: args.configurationRigging || "",
            description: args.description || "",
            idKey: "",
            isActive: args.isActive !== undefined ? args.isActive : true,
            name: args.name,
            slug: args.slug || args.name.toLowerCase().replace(/ /g, "-"),
          },
          isEditable: true,
          validProperties: [
            "attributeValues",
            "description",
            "isActive",
            "name",
            "configurationRigging",
            "slug",
          ],
        },
      }
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Lava Application: ${JSON.stringify(
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
          text: `Error creating Lava Application: ${errorMessage}`,
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

// Validate Add Lava App arguments
export function validateAddLavaAppArgs(args: unknown): args is AddLavaAppArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "name" in args &&
    typeof (args as any).name === "string"
  );
}
