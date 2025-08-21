import { OpenAPIV3 } from "openapi-types";

export const militaryRanksPaths: OpenAPIV3.PathsObject = {
  "/military-ranks": {
    get: {
      tags: ["Postos/Graduações"],
      summary: "Lista todos os postos/graduações",
      responses: {
        200: {
          description: "Sucesso",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  $ref: "#/components/schemas/MilitaryRank",
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Postos/Graduações"],
      summary: "Cria um novo posto/graduação",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/MilitaryRankInput",
            },
          },
        },
      },
      responses: {
        201: {
          description: "Criado com sucesso",
        },
        400: {
          description: "Requisição inválida",
        },
      },
    },
  },
  "/military-ranks/{id}": {
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "string",
        },
      },
    ],
    get: {
      tags: ["Postos/Graduações"],
      summary: "Busca um posto/graduação por ID",
      responses: {
        200: {
          description: "Sucesso",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/MilitaryRank",
              },
            },
          },
        },
        404: {
          description: "Não encontrado",
        },
      },
    },
    put: {
      tags: ["Postos/Graduações"],
      summary: "Atualiza um posto/graduação",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/MilitaryRankInput",
            },
          },
        },
      },
      responses: {
        200: {
          description: "Atualizado com sucesso",
        },
        404: {
          description: "Não encontrado",
        },
      },
    },
    delete: {
      tags: ["Postos/Graduações"],
      summary: "Remove um posto/graduação",
      responses: {
        204: {
          description: "Removido com sucesso",
        },
        404: {
          description: "Não encontrado",
        },
      },
    },
  },
};
