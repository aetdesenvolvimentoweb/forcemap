import { MilitaryRankInputDTOSanitizerProtocol } from "@application/protocols";

import type { MilitaryRankInputDTO } from "@domain/dtos";

export class MilitaryRankInputDTOSanitizer
  implements MilitaryRankInputDTOSanitizerProtocol
{
  private readonly sanitizeAbbreviation = (abbreviation: string): string => {
    if (!abbreviation || typeof abbreviation !== "string") return abbreviation;

    return abbreviation
      .trim() // Remove espaços em branco nas bordas
      .toUpperCase() // Padroniza para maiúsculo
      .replace(/\s+/g, " ") // Normaliza espaços múltiplos para um único espaço
      .replace(/[^A-Z0-9º ]/g, "") // Permite apenas letras, números, º e espaço
      .substring(0, 10) // Limita tamanho (normalização)
      .replace(/['";\\]/g, "") // Remove caracteres SQL perigosos
      .replace(/--/g, "") // Remove comentários SQL
      .replace(/\/\*/g, "") // Remove início de comentário
      .replace(/\*\//g, ""); // Remove fim de comentário
  };

  private readonly sanitizeOrder = (order: number): number => {
    // Sanitização: converte string numérica para number se necessário
    const numericOrder = typeof order === "string" ? parseFloat(order) : order;

    // Sanitização: remove casas decimais e torna positivo (normalização)
    if (Number.isFinite(numericOrder)) {
      return Math.floor(Math.abs(numericOrder));
    }

    // Sanitização: preserva valor original para o validador decidir
    return order;
  };

  public readonly sanitize = (
    data: MilitaryRankInputDTO,
  ): MilitaryRankInputDTO => {
    return {
      abbreviation: this.sanitizeAbbreviation(data.abbreviation),
      order: this.sanitizeOrder(data.order),
    };
  };
}
