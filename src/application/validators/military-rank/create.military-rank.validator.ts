import type { CreateMilitaryRankDTO } from "@domain/dtos";

export class CreateMilitaryRankValidator {
  private readonly validateAbbreviationPresence = (
    abbreviation: string,
  ): void => {
    if (!abbreviation || abbreviation.trim() === "") {
      throw new Error("Abbreviation is required");
    }
  };

  private readonly validateOrderPresence = (order: number): void => {
    if (order === null || order === undefined) {
      throw new Error("Order is required");
    }
  };

  private readonly validateAbbreviationFormat = (
    abbreviation: string,
  ): void => {
    if (abbreviation.length > 10) {
      throw new Error("Abbreviation cannot exceed 10 characters");
    }

    if (!/^[A-Z0-9º ]+$/.test(abbreviation.trim())) {
      throw new Error(
        "Abbreviation must contain only letters, numbers, spaces and ordinal character (º)",
      );
    }
  };

  private readonly validateOrderRange = (order: number): void => {
    if (!Number.isInteger(order)) {
      throw new Error("Order must be an integer");
    }

    if (order < 1) {
      throw new Error("Order must be greater than 0");
    }

    if (order > 20) {
      throw new Error("Order cannot exceed 20");
    }
  };

  private readonly validateRequiredFields = (
    data: CreateMilitaryRankDTO,
  ): void => {
    this.validateAbbreviationPresence(data.abbreviation);
    this.validateOrderPresence(data.order);
  };

  private readonly validateBusinessRules = (
    data: CreateMilitaryRankDTO,
  ): void => {
    this.validateAbbreviationFormat(data.abbreviation);
    this.validateOrderRange(data.order);
  };

  public readonly validate = async (
    data: CreateMilitaryRankDTO,
  ): Promise<void> => {
    this.validateRequiredFields(data);
    this.validateBusinessRules(data);
  };
}
