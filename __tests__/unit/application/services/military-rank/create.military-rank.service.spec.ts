import { CreateMilitaryRankService } from "@application/services";
import type {
  CreateMilitaryRankSanitizerProtocol,
  CreateMilitaryRankValidatorProtocol,
} from "@application/protocols";
import type { MilitaryRankRepository } from "@domain/repositories";

interface SutTypes {
  sut: CreateMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
  sanitizer: jest.Mocked<CreateMilitaryRankSanitizerProtocol>;
  validator: jest.Mocked<CreateMilitaryRankValidatorProtocol>;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = jest.mocked<MilitaryRankRepository>({
    create: jest.fn().mockResolvedValue(undefined),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn().mockResolvedValue([]),
  });

  const sanitizer = {
    sanitize: jest.fn(),
  } as jest.Mocked<CreateMilitaryRankSanitizerProtocol>;

  const validator = {
    validate: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<CreateMilitaryRankValidatorProtocol>;

  const sut = new CreateMilitaryRankService({
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

describe("CreateMilitaryRankService", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should call sanitizer before validator", async () => {
    // ARRANGE
    const { sut, sanitizer, validator } = sutInstance;
    const dto = { abbreviation: "CEL", order: 1 };
    const sanitizedDto = { abbreviation: "CEL", order: 1 };

    sanitizer.sanitize.mockReturnValue(sanitizedDto);

    // ACT
    await sut.create(dto);

    // ASSERT
    expect(sanitizer.sanitize).toHaveBeenCalledWith(dto);
    expect(validator.validate).toHaveBeenCalledWith(sanitizedDto);
  });

  it("should call validator with sanitized data", async () => {
    // ARRANGE
    const { sut, validator, sanitizer } = sutInstance;
    const dto = { abbreviation: "CEL", order: 1 };
    const sanitizedDto = { abbreviation: "CEL", order: 1 };

    sanitizer.sanitize.mockReturnValue(sanitizedDto);

    // ACT
    await sut.create(dto);

    // ASSERT
    expect(validator.validate).toHaveBeenCalledWith(sanitizedDto);
  });

  it("should call militaryRankRepository.create with sanitized data", async () => {
    // ARRANGE
    const { sut, militaryRankRepository, sanitizer } = sutInstance;
    const inputDto = { abbreviation: "  CEL'  ", order: 1.5 };
    const sanitizedDto = { abbreviation: "CEL", order: 1 };

    sanitizer.sanitize.mockReturnValue(sanitizedDto);

    // ACT
    await sut.create(inputDto);

    // ASSERT
    expect(militaryRankRepository.create).toHaveBeenCalledWith(sanitizedDto);
    expect(militaryRankRepository.create).not.toHaveBeenCalledWith(inputDto);
  });

  it("should follow the correct execution order: sanitize -> validate -> create", async () => {
    // ARRANGE
    const { sut, sanitizer, validator, militaryRankRepository } = sutInstance;
    const dto = { abbreviation: "CEL", order: 1 };
    const sanitizedDto = { abbreviation: "CEL", order: 1 };

    sanitizer.sanitize.mockReturnValue(sanitizedDto);

    // ACT
    await sut.create(dto);

    // ASSERT
    expect(sanitizer.sanitize).toHaveBeenCalledWith(dto);
    expect(validator.validate).toHaveBeenCalledWith(sanitizedDto);
    expect(militaryRankRepository.create).toHaveBeenCalledWith(sanitizedDto);
  });
});
