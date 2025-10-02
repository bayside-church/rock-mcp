import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { formatAPIError, createClient } from "./api-client.js";

export interface GetAttributesArgs {
  params?: {
    $expand?: string;
    $filter?: string;
    $select?: string;
    $orderby?: string;
    $top?: number;
    $skip?: number;
    LoadAttributes?: string;
    attributeKeys?: string;
  };
}

export interface AddAttributeValueArgs {
  AttributeId: number;
  EntityId: number;
  Value: string;
}

export interface UpdateAttributeValueArgs {
  id: number;
  Value: string;
}

// Get Attributes API call
export async function getAttributes(
  args: GetAttributesArgs
): Promise<CallToolResult> {
  try {
    const client = await createClient();
    const response = await client.get("/api/AttributeValues", {
      params: args.params,
    });

    return response.data;
  } catch (error) {
    const errorMessage = formatAPIError(error);

    return {
      content: [
        {
          type: "text",
          text: `Error fetching attributes: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Add a new Attribute Value
export async function addAttribute(
  args: AddAttributeValueArgs
): Promise<CallToolResult> {
  try {
    const client = await createClient();

    // Prepare the data for the new Attribute Value
    const attributeData = {
      AttributeId: args.AttributeId,
      EntityId: args.EntityId,
      Value: args.Value,
    };

    // Post to the AttributeValues API endpoint
    const response = await client.post("/api/AttributeValues", attributeData);

    return {
      content: [
        {
          type: "text",
          text: `Successfully created Attribute Value: ${JSON.stringify(
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
          text: `Error creating Attribute Value: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Update an Attribute Value
export async function updateAttributeValue(
  args: UpdateAttributeValueArgs
): Promise<CallToolResult> {
  try {
    const client = await createClient();

    // Prepare the data for updating the Attribute Value
    const attributeData = {
      Value: args.Value,
    };

    // PUT to the AttributeValues API endpoint with ID
    const response = await client.patch(
      `/api/AttributeValues/${args.id}`,
      attributeData
    );

    return {
      content: [
        {
          type: "text",
          text: `Successfully updated Attribute Value: ${JSON.stringify(
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
          text: `Error updating Attribute Value: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}

// Validate Get Attributes arguments
export function validateGetAttributesArgs(
  args: unknown
): args is GetAttributesArgs {
  return args !== null && typeof args === "object";
}

// Validate Add Attribute Value arguments
export function validateAddAttributeValueArgs(
  args: unknown
): args is AddAttributeValueArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "AttributeId" in args &&
    "EntityId" in args &&
    "Value" in args &&
    typeof (args as any).AttributeId === "number" &&
    typeof (args as any).EntityId === "number" &&
    typeof (args as any).Value === "string"
  );
}

// Validate Update Attribute Value arguments
export function validateUpdateAttributeValueArgs(
  args: unknown
): args is UpdateAttributeValueArgs {
  return (
    args !== null &&
    typeof args === "object" &&
    "id" in args &&
    "Value" in args &&
    typeof (args as any).id === "number" &&
    typeof (args as any).Value === "string"
  );
}
