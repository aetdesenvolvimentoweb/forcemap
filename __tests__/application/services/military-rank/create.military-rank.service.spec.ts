import { CreateMilitaryRankSanitizer } from "@application/sanitizers";
import { CreateMilitaryRankService } from "@application/services";
import { MilitaryRankRepository } from "@domain/index";

interface SutTypes {
  sut: CreateMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: CreateMilitaryRankSanitizer;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = jest.mocked<MilitaryRankRepository>({
    create: jest.fn().mockResolvedValue(undefined),
    findById: jest.fn(),
    findByOrder: jest.fn(),
  });

  const sanitizer = new CreateMilitaryRankSanitizer();

  const sut = new CreateMilitaryRankService({
    militaryRankRepository,
    sanitizer,
  });

  return {
    sut,
    militaryRankRepository,
    sanitizer,
  };
};

describe("CreateMilitaryRankService", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should call militaryRankRepository.create with sanitized data", async () => {
    // ARRANGE
    const { sut, militaryRankRepository, sanitizer } = sutInstance;
    const dto = { abbreviation: "CEL", order: 1 };
    jest.spyOn(sanitizer, "sanitize").mockReturnValue(dto);

    // ACT
    await sut.create(dto);

    // ASSERT
    expect(militaryRankRepository.create).toHaveBeenCalledWith(dto);
  });

  it("should call sanitizer with correct data", async () => {
    // ARRANGE
    const { sut, sanitizer } = sutInstance;
    const dto = { abbreviation: "CEL", order: 1 };
    const sanitizerSpy = jest.spyOn(sanitizer, "sanitize");

    // ACT
    await sut.create(dto);

    // ASSERT
    expect(sanitizerSpy).toHaveBeenCalledWith(dto);
  });

  it("should pass sanitized data to repository", async () => {
    // ARRANGE
    const { sut, militaryRankRepository, sanitizer } = sutInstance;
    const inputDto = { abbreviation: "  CEL'  ", order: 1.5 };
    const sanitizedDto = { abbreviation: "CEL", order: 0 };
    jest.spyOn(sanitizer, "sanitize").mockReturnValue(sanitizedDto);

    // ACT
    await sut.create(inputDto);

    // ASSERT
    expect(militaryRankRepository.create).toHaveBeenCalledWith(sanitizedDto);
    expect(militaryRankRepository.create).not.toHaveBeenCalledWith(inputDto);
  });
});
