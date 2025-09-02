import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { addPages } from "./pages.js";
import { addBlock } from "./blocks.js";
import { addAttribute } from "./attribute-values.js";

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

    // Step 2: Add block type 1919 (Lava Application Content) to the page
    const blockResult = await addBlock({
      name: `${args.pageName} Block`,
      blockTypeId: 1919, // Lava Application Content type
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

    // Step 3: Add attribute values to the block
    const attributeResults = [];

    // Generate htmx lava code from appSlug and endpointSlug
    const lavaCode = `<div hx-get="^/${args.appSlug}/${args.endpointSlug}" hx-trigger="load" >
</div>`;

    // Add attribute 7482 (Lava Code)
    const lavaCodeResult = await addAttribute({
      AttributeId: 7482,
      EntityId: blockId,
      Value: lavaCode,
    });
    attributeResults.push(
      `Lava Code attribute: ${JSON.stringify(lavaCodeResult)}`
    );

    // Add attribute 7481 (Lava App UUID) if provided
    if (args.lavaAppUuid) {
      const lavaAppResult = await addAttribute({
        AttributeId: 7481,
        EntityId: blockId,
        Value: args.lavaAppUuid,
      });
      attributeResults.push(
        `Lava App UUID attribute: ${JSON.stringify(lavaAppResult)}`
      );
    }

    // Add attribute 7483 (Permissions)
    const permissionsResult = await addAttribute({
      AttributeId: 7483,
      EntityId: blockId,
      Value: args.permissions || "All",
    });
    attributeResults.push(
      `Permissions attribute: ${JSON.stringify(permissionsResult)}`
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
