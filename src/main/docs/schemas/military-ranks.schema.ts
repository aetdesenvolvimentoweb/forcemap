import { OpenAPIV3 } from "openapi-types";

export const militaryRankSchemas: Record<string, OpenAPIV3.SchemaObject> = {
  MilitaryRank: {
    type: "object",
    properties: {
      id: {
        type: "string",
      },
      name: {
        type: "string",
      },
      abbreviation: {
        type: "string",
      },
      priority: {
        type: "number",
      },
    },
  },
  MilitaryRankInput: {
    type: "object",
    properties: {
      name: {
        type: "string",
      },
      abbreviation: {
        type: "string",
      },
      priority: {
        type: "number",
      },
    },
    required: ["name", "abbreviation", "priority"],
  },
};
