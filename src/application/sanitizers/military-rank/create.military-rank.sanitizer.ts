import { CreateMilitaryRankDTO } from "@domain/dtos";

export class CreateMilitaryRankSanitizer {
  private readonly sanitizeAbbreviation = (abbreviation: string): string => {
    if (!abbreviation || typeof abbreviation !== "string") return "";

    return abbreviation
      .trim() // Remove espaços em branco
      .toUpperCase() // Padroniza para maiúsculo
      .replace(/\s+/g, "") // Remove espaços internos
      .replace(/[^A-Z0-9\-_]/g, "") // Remove caracteres especiais perigosos
      .substring(0, 10) // Limita tamanho (normalização)
      .replace(/['";\\]/g, "") // Remove caracteres SQL perigosos
      .replace(/--/g, "") // Remove comentários SQL
      .replace(/\/\*/g, "") // Remove início de comentário
      .replace(/\*\//g, ""); // Remove fim de comentário
  };

  private readonly sanitizeOrder = (order: number): number => {
    // Sanitização: converte string numérica para number se necessário
    const numericOrder = typeof order === "string" ? parseFloat(order) : order;

    // Sanitização: remove casas decimais (normalização)
    if (Number.isFinite(numericOrder)) {
      return Math.floor(Math.abs(numericOrder)); // Remove decimais e torna positivo
    }

    // Sanitização: valor padrão para dados inválidos
    return 0;
  };

  public readonly sanitize = (
    data: CreateMilitaryRankDTO,
  ): CreateMilitaryRankDTO => {
    // Sanitização: garantir que apenas propriedades esperadas sejam processadas
    const cleanInput = {
      abbreviation: data?.abbreviation || "",
      order: data?.order || 0,
    };

    return {
      abbreviation: this.sanitizeAbbreviation(cleanInput.abbreviation),
      order: this.sanitizeOrder(cleanInput.order),
    };
  };
}
