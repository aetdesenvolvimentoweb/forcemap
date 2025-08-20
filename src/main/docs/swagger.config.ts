import { OpenAPIV3 } from "openapi-types";

export const swaggerConfig: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "ForceMap API",
    description:
      "API para gerenciamento de força operacional disponível em Organizações Bombeiros Militar",
    version: "1.0.0",
    contact: {
      name: "André David dos Santos",
      email: "andredavid1@yahoo.com.br",
    },
  },
  servers: [
    {
      url: "/api/v1",
      description: "Servidor API",
    },
  ],
  tags: [
    {
      name: "Posto/Graduação Militares",
      description: "Operações relacionadas o posto/graduaçãos militares",
    },
  ],
  components: {
    schemas: {
      MilitaryRankInput: {
        type: "object",
        properties: {
          abbreviation: {
            type: "string",
            description: "Abreviatura do posto/graduação militar",
            maxLength: 10,
          },
          order: {
            type: "number",
            description: "Nível hierárquico do posto/graduação militar",
            maximum: 20,
          },
        },
        required: ["abbreviation", "order"],
      },
      MilitaryRank: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "ID único do posto/graduação militar",
          },
          abbreviation: {
            type: "string",
            description: "Abreviatura do posto/graduação militar",
          },
          order: {
            type: "number",
            description: "Nível hierárquico do posto/graduação militar",
          },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "string",
            description: "Mensagem de erro",
          },
        },
      },
    },
  },
  paths: {
    "/military-ranks": {
      post: {
        tags: ["Posto/Graduação Militares"],
        summary: "Criar novo posto/graduação militar",
        description: "Cria uma novo posto/graduação militar no sistema",
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
            description: "Posto/Graduação militar criada com sucesso",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MilitaryRank",
                },
              },
            },
          },
          409: {
            description:
              "Conflito de unicidade (abreviatura ou ordem já existe)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  duplicatedAbbreviation: {
                    summary: "Abreviatura duplicada",
                    value: {
                      error: "Abreviatura já está em uso.",
                    },
                  },
                  duplicatedOrder: {
                    summary: "Ordem duplicada",
                    value: {
                      error: "Ordem já está em uso.",
                    },
                  },
                },
              },
            },
          },
          422: {
            description: "Abreviatura ou Ordem não preenchidos ou inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  missingAbbreviation: {
                    summary: "Abreviatura não preenchida",
                    value: {
                      error: "O campo Abreviatura precisa ser preenchido.",
                    },
                  },
                  missingOrder: {
                    summary: "Ordem não preenchida",
                    value: {
                      error: "O campo Ordem precisa ser preenchido.",
                    },
                  },
                  invalidAbbreviationLength: {
                    summary: "Abreviatura excede limite",
                    value: {
                      error:
                        "O campo Abreviatura é inválido: não pode exceder 10 caracteres.",
                    },
                  },
                  invalidAbbreviationFormat: {
                    summary: "Formato de abreviatura inválido",
                    value: {
                      error:
                        "O campo Abreviatura é inválido: deve conter apenas letras, números, espaços e/ou o caractere ordinal (º).",
                    },
                  },
                  invalidOrderFormat: {
                    summary: "Formato de ordem inválido",
                    value: {
                      error:
                        "O campo Ordem é inválido: deve ser um número inteiro.",
                    },
                  },
                  invalidOrderLessThanZero: {
                    summary: "Valor de ordem inválido",
                    value: {
                      error: "O campo Ordem é inválido: deve ser maior que 0.",
                    },
                  },
                  invalidOrderGreaterThan20: {
                    summary: "Valor de ordem inválido",
                    value: {
                      error: "O campo Ordem é inválido: deve ser menor que 20.",
                    },
                  },
                },
              },
            },
          },
        },
      },
      get: {
        tags: ["Posto/Graduação Militares"],
        summary: "Listar todas os postos/graduação militares",
        description:
          "Retorna uma lista de todos os postos/graduações militares cadastradas",
        responses: {
          200: {
            description: "Lista de postos/graduações militares",
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
    },
    "/military-ranks/{id}": {
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          description: "ID do posto/graduação militar",
          schema: {
            type: "string",
          },
        },
      ],
      get: {
        tags: ["Posto/Graduação Militares"],
        summary: "Buscar patente militar pelo ID",
        responses: {
          200: {
            description: "Posto/Graduação militar encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MilitaryRank",
                },
              },
            },
          },
          404: {
            description: "Posto/Graduação militar não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  entityNotFoundError: {
                    summary: "Posto/Graduação não encontrado",
                    value: {
                      error: "Posto/Graduação não encontrado(a) com esse ID.",
                    },
                  },
                },
              },
            },
          },
          422: {
            description: "ID não preenchido ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  missingId: {
                    summary: "ID não preenchido",
                    value: {
                      error: "O campo ID precisa ser preenchido.",
                    },
                  },
                },
              },
            },
          },
        },
      },
      put: {
        tags: ["Posto/Graduação Militares"],
        summary: "Atualizar posto/graduação militar",
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
          204: {
            description: "Posto/Graduação militar atualizada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/MilitaryRank",
                },
              },
            },
          },
          404: {
            description: "Posto/Graduação militar não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  entityNotFoundError: {
                    summary: "Posto/Graduação não encontrado",
                    value: {
                      error: "Posto/Graduação não encontrado(a) com esse ID.",
                    },
                  },
                },
              },
            },
          },
          409: {
            description:
              "Conflito de unicidade (abreviatura ou ordem já existe)",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  duplicatedAbbreviation: {
                    summary: "Abreviatura duplicada",
                    value: {
                      error: "Abreviatura já está em uso.",
                    },
                  },
                  duplicatedOrder: {
                    summary: "Ordem duplicada",
                    value: {
                      error: "Ordem já está em uso.",
                    },
                  },
                },
              },
            },
          },
          422: {
            description:
              "ID, Abreviatura ou Ordem não preenchidos ou inválidos",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  missingId: {
                    summary: "ID não preenchido",
                    value: {
                      error: "O campo ID precisa ser preenchido.",
                    },
                  },
                  missingAbbreviation: {
                    summary: "Abreviatura não preenchida",
                    value: {
                      error: "O campo Abreviatura precisa ser preenchido.",
                    },
                  },
                  missingOrder: {
                    summary: "Ordem não preenchida",
                    value: {
                      error: "O campo Ordem precisa ser preenchido.",
                    },
                  },
                  invalidAbbreviationLength: {
                    summary: "Abreviatura excede limite",
                    value: {
                      error:
                        "O campo Abreviatura é inválido: não pode exceder 10 caracteres.",
                    },
                  },
                  invalidAbbreviationFormat: {
                    summary: "Formato de abreviatura inválido",
                    value: {
                      error:
                        "O campo Abreviatura é inválido: deve conter apenas letras, números, espaços e/ou o caractere ordinal (º).",
                    },
                  },
                  invalidOrderFormat: {
                    summary: "Formato de ordem inválido",
                    value: {
                      error:
                        "O campo Ordem é inválido: deve ser um número inteiro.",
                    },
                  },
                  invalidOrderLessThanZero: {
                    summary: "Valor de ordem inválido",
                    value: {
                      error: "O campo Ordem é inválido: deve ser maior que 0.",
                    },
                  },
                  invalidOrderGreaterThan20: {
                    summary: "Valor de ordem inválido",
                    value: {
                      error: "O campo Ordem é inválido: deve ser menor que 20.",
                    },
                  },
                },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Posto/Graduação Militares"],
        summary: "Remover posto/graduação militar",
        responses: {
          204: {
            description: "Posto/Graduação militar removida com sucesso",
          },
          404: {
            description: "Posto/Graduação militar não encontrada",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  entityNotFoundError: {
                    summary: "Posto/Graduação não encontrado",
                    value: {
                      error: "Posto/Graduação não encontrado(a) com esse ID.",
                    },
                  },
                },
              },
            },
          },
          422: {
            description: "ID não preenchido ou inválido",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  missingId: {
                    summary: "ID não preenchido",
                    value: {
                      error: "O campo ID precisa ser preenchido.",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};
