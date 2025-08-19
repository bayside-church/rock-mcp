import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface PagesExecutionArgs {
  params?: Record<string, any>;
  base_url?: string;
  api_key?: string;
}

export interface AddPagesArgs {
  internalName: string;
  pageTitle: string;
  browserTitle?: string;
  parentPageId?: number;
  layoutId?: number;
}

// Get Pages API call
export async function getPages(
  args: PagesExecutionArgs
): Promise<CallToolResult> {
  try {
    const client = createClient();
    const response = await client.get("/api/Pages", {
      params: args.params,
    });

    return response.data;
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

// Add a new Page
export async function addPages(args: AddPagesArgs): Promise<CallToolResult> {
  try {
    const client = createClient();

    // Prepare the data for the new Page
    const pageData = {
      InternalName: args.internalName,
      PageTitle: args.pageTitle,
      BotGuardianLevel: -1,
      BrowserTitle: args.browserTitle,
      ParentPageId: args.parentPageId || 1775, // "Test Pages" page
      IsSystem: false,
      LayoutId: args.layoutId || 12, // "Full Width" layout
    };

    // Post to the Pages API endpoint
    const response = await client.post("/api/Pages", pageData);

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Page: ${JSON.stringify(
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
          text: `Error creating Page: ${errorMessage}`,
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

// Validate Add Pages arguments
export function validateAddPagesArgs(args: unknown): args is AddPagesArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "internalName" in args &&
    "pageTitle" in args &&
    typeof (args as any).internalName === "string" &&
    typeof (args as any).pageTitle === "string"
  );
}
