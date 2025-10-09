import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { addPages } from "./pages.js";
import { addBlock, getBlockType } from "./blocks.js";
import { addAttribute } from "./attributes.js";

export interface AddLavaPageArgs {
  pageName: string;
  appSlug: string;
  endpointSlug: string;
  lavaAppUuid?: string;
  permissions?: string;
  parentPageId?: number;
  layoutId?: number;
}

// Add a new Lava Page with block and attributes
export async function addLavaPage(
  args: AddLavaPageArgs
): Promise<CallToolResult> {
  try {
    //TODO: allow better passing in parentPageId
    // Step 1: Create the page
    const pageResult = await addPages({
      internalName: args.pageName,
      pageTitle: args.pageName,
      browserTitle: args.pageName,
      parentPageId: args.parentPageId || 1775, // "Test Pages" page
      layoutId: args.layoutId || 12, // "Full Width" layout
    });

    // Extract page ID from the result
    const pageId = extractPageId(pageResult);
    if (!pageId) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Could not extract page ID from page creation result`,
          },
        ],
        isError: true,
      };
    }

    // Step 2: Look up the Lava Application Content block type ID
    const blockTypeId = await getBlockTypeIdByName("Lava Application Content");
    if (!blockTypeId) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Could not find block type "Lava Application Content"`,
          },
        ],
        isError: true,
      };
    }

    // Step 3: Add block to the page
    const blockResult = await addBlock({
      name: `${args.pageName} Block`,
      blockTypeId: blockTypeId,
      pageId: pageId,
      zone: "Main",
      order: 1,
    });

    // Extract block ID from the result
    const blockId = extractBlockId(blockResult);
    if (!blockId) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Could not extract block ID from block creation result`,
          },
        ],
        isError: true,
      };
    }

    // Step 4: Query attribute IDs dynamically
    const lavaTemplateAttrId = await getAttributeIdByKey(
      "LavaTemplate",
      blockTypeId
    );
    const lavaAppAttrId = await getAttributeIdByKey("Application", blockTypeId);
    const enabledLavaCommandsAttrId = await getAttributeIdByKey(
      "EnabledLavaCommands",
      blockTypeId
    );

    if (!lavaTemplateAttrId || !enabledLavaCommandsAttrId) {
      return {
        content: [
          {
            type: "text",
            text: `Error: Could not find required attributes for Lava Application Content block. blockTypeId=${blockTypeId}, lavaTemplateAttrId=${lavaTemplateAttrId}, enabledLavaCommandsAttrId=${enabledLavaCommandsAttrId}`,
          },
        ],
        isError: true,
      };
    }

    // Step 5: Add attribute values to the block
    const attributeResults = [];

    // Generate htmx lava code from appSlug and endpointSlug
    const lavaCode = `<div hx-get="^/${args.appSlug}/${args.endpointSlug}" hx-trigger="load" >
</div>`;

    // Add Lava Template attribute
    const lavaCodeResult = await addAttribute({
      AttributeId: lavaTemplateAttrId,
      EntityId: blockId,
      Value: lavaCode,
    });
    attributeResults.push(
      `Lava Template attribute: ${JSON.stringify(lavaCodeResult)}`
    );

    // Add Application attribute if provided
    if (args.lavaAppUuid && lavaAppAttrId) {
      const lavaAppResult = await addAttribute({
        AttributeId: lavaAppAttrId,
        EntityId: blockId,
        Value: args.lavaAppUuid,
      });
      attributeResults.push(
        `Application attribute: ${JSON.stringify(lavaAppResult)}`
      );
    }

    // Add Enabled Lava Commands attribute
    const enabledLavaCommandsResult = await addAttribute({
      AttributeId: enabledLavaCommandsAttrId,
      EntityId: blockId,
      Value: args.permissions || "All",
    });
    attributeResults.push(
      `Enabled Lava Commands attribute: ${JSON.stringify(
        enabledLavaCommandsResult
      )}`
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Lava Page:
          
Page: ${JSON.stringify(pageResult, null, 2)}

Block: ${JSON.stringify(blockResult, null, 2)}

Attributes:
${attributeResults.join("\n")}`,
        },
      ],
    };
  } catch (error) {
    console.error("error", error);
    return {
      content: [
        {
          type: "text",
          text: `Error creating Lava Page: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
}

// Helper function to look up block type ID by name
async function getBlockTypeIdByName(name: string): Promise<number | null> {
  try {
    const result = await getBlockType({
      params: {
        $filter: `Name eq '${name}'`,
        $select: "Id,Name",
        $top: 1,
      },
    });

    if (Array.isArray(result) && result.length > 0 && result[0].Id) {
      return result[0].Id;
    }

    if (
      result.content &&
      result.content[0] &&
      result.content[0].type === "text"
    ) {
      const text = result.content[0].text;
      // Try to parse JSON array from the text
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].Id) {
            return parsed[0].Id;
          }
        }
      } catch (e) {
        // If parsing fails, continue to return null
      }
    }

    return null;
  } catch (error) {
    console.error(`Error looking up block type "${name}":`, error);
    return null;
  }
}

// Helper function to get attribute ID by key and block type ID
async function getAttributeIdByKey(
  key: string,
  blockTypeId: number
): Promise<number | null> {
  try {
    const { createClient } = await import("./api-client.js");
    const client = await createClient();

    const response = await client.get("/api/Attributes", {
      params: {
        $filter: `Key eq '${key}' and EntityTypeQualifierValue eq '${blockTypeId}'`,
        $select: "Id,Name,Key",
        $top: 1,
      },
    });

    // Response data should be an array
    if (
      Array.isArray(response.data) &&
      response.data.length > 0 &&
      response.data[0].Id
    ) {
      return response.data[0].Id;
    }

    return null;
  } catch (error) {
    console.error(
      `Error looking up attribute "${key}" for block type ${blockTypeId}:`,
      error
    );
    return null;
  }
}

// Helper function to extract page ID from addPages result
function extractPageId(result: CallToolResult): number | null {
  if (
    result.content &&
    result.content[0] &&
    result.content[0].type === "text"
  ) {
    const text = result.content[0].text;
    // Look for "Successfully created Page: [ID]" pattern
    const match = text.match(/Successfully created Page:\s*(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

// Helper function to extract block ID from addBlock result
function extractBlockId(result: CallToolResult): number | null {
  if (
    result.content &&
    result.content[0] &&
    result.content[0].type === "text"
  ) {
    const text = result.content[0].text;
    // Look for "Successfully created Block: [ID]" pattern
    const match = text.match(/Successfully created Block:\s*(\d+)/);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

// Validate Add Lava Page arguments
export function validateAddLavaPageArgs(
  args: unknown
): args is AddLavaPageArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "pageName" in args &&
    "appSlug" in args &&
    "endpointSlug" in args &&
    typeof (args as any).pageName === "string" &&
    typeof (args as any).appSlug === "string" &&
    typeof (args as any).endpointSlug === "string"
  );
}
