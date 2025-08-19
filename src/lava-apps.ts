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

// Add a new Lava App
export async function addLavaApp(
  args: AddLavaAppArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();
    const pagesResponse = await client.get("/api/Pages", {
      params: {
        $filter: "PageTitle eq 'Lava Application Detail'",
        $select: "Id,Guid,PageTitle,InternalName",
      },
    });

    if (pagesResponse.data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application Detail page",
          },
        ],
      };
    }

    const pageGuid = pagesResponse.data[0].Guid;

    const blocksResponse = await client.get("/api/Blocks", {
      params: {
        $filter: `Name eq 'Lava Application Detail'`,
        $select: "Id,Name,BlockTypeId,Guid",
      },
    });

    if (blocksResponse.data.length === 0) {
      return {
        content: [
          {
            type: "text",
            text: "Cannot find Lava Application Detail block",
          },
        ],
      };
    }

    const blockGuid = blocksResponse.data[0].Guid;

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
    "lavaCode" in args &&
    typeof (args as any).name === "string" &&
    typeof (args as any).lavaCode === "string"
  );
}
