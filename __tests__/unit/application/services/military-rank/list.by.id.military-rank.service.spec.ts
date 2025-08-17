import { ListByIdMilitaryRankService } from "@application/services/military-rank/list.by.id.military-rank.service";
import { EntityNotFoundError } from "@application/errors";
import type { IdSanitizerProtocol } from "@application/protocols";
import type { IdValidatorProtocol } from "@application/protocols/validators/id.validator.protocol";
import type { MilitaryRankRepository } from "@domain/repositories";
import type { MilitaryRank } from "@domain/entities";

interface SutTypes {
  sut: ListByIdMilitaryRankService;
  militaryRankRepository: jest.Mocked<MilitaryRankRepository>;
  sanitizer: jest.Mocked<IdSanitizerProtocol>;
  validator: jest.Mocked<IdValidatorProtocol>;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
    listById: jest.fn().mockResolvedValue(null),
  } as jest.Mocked<MilitaryRankRepository>;

  const sanitizer = {
    sanitize: jest.fn(),
  } as jest.Mocked<IdSanitizerProtocol>;

  const validator = {
    validate: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<IdValidatorProtocol>;

  const sut = new ListByIdMilitaryRankService({
    militaryRankRepository,
    sanitizer,
    validator,
  });

  return {
    sut,
    militaryRankRepository,
    sanitizer,
    validator,
  };
};

describe("ListByIdMilitaryRankService", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should call sanitizer before validator", async () => {
    const { sut, sanitizer, validator } = sutInstance;
    const id = "123";
    const sanitizedId = "sanitized-123";
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    // Mock para retornar um objeto válido
    sutInstance.militaryRankRepository.listById.mockResolvedValue({
      id: sanitizedId,
      abbreviation: "CEL",
      order: 1,
    } as MilitaryRank);

    await sut.listById(id);

    expect(sanitizer.sanitize).toHaveBeenCalledWith(id);
    expect(validator.validate).toHaveBeenCalledWith(sanitizedId);
  });

  it("should call validator with sanitized id", async () => {
    const { sut, sanitizer, validator } = sutInstance;
    const id = "123";
    const sanitizedId = "sanitized-123";
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    sutInstance.militaryRankRepository.listById.mockResolvedValue({
      id: sanitizedId,
      abbreviation: "CEL",
      order: 1,
    } as MilitaryRank);

    await sut.listById(id);

    expect(validator.validate).toHaveBeenCalledWith(sanitizedId);
  });

  it("should call militaryRankRepository.listById with sanitized id", async () => {
    const { sut, sanitizer, militaryRankRepository } = sutInstance;
    const id = "  123  ";
    const sanitizedId = "123";
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    sutInstance.militaryRankRepository.listById.mockResolvedValue({
      id: sanitizedId,
      abbreviation: "CEL",
      order: 1,
    } as MilitaryRank);

    await sut.listById(id);

    expect(militaryRankRepository.listById).toHaveBeenCalledWith(sanitizedId);
    expect(militaryRankRepository.listById).not.toHaveBeenCalledWith(id);
  });

  it("should follow the correct execution order: sanitize -> validate -> listById", async () => {
    const { sut, sanitizer, validator, militaryRankRepository } = sutInstance;
    const id = "123";
    const sanitizedId = "123";
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    sutInstance.militaryRankRepository.listById.mockResolvedValue({
      id: sanitizedId,
      abbreviation: "CEL",
      order: 1,
    } as MilitaryRank);

    await sut.listById(id);

    expect(sanitizer.sanitize).toHaveBeenCalledWith(id);
    expect(validator.validate).toHaveBeenCalledWith(sanitizedId);
    expect(militaryRankRepository.listById).toHaveBeenCalledWith(sanitizedId);
  });

  it("should throw EntityNotFoundError if militaryRank is not found", async () => {
    const { sut, sanitizer, militaryRankRepository } = sutInstance;
    const id = "notfound";
    const sanitizedId = "notfound";
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    militaryRankRepository.listById.mockResolvedValue(null);

    await expect(sut.listById(id)).rejects.toThrow(EntityNotFoundError);
  });

  it("should return militaryRank if found", async () => {
    const { sut, sanitizer, militaryRankRepository } = sutInstance;
    const id = "found";
    const sanitizedId = "found";
    const militaryRank = {
      id: sanitizedId,
      abbreviation: "CEL",
      order: 1,
    } as MilitaryRank;
    sanitizer.sanitize.mockReturnValue(sanitizedId);
    militaryRankRepository.listById.mockResolvedValue(militaryRank);

    const result = await sut.listById(id);
    expect(result).toBe(militaryRank);
  });
});
