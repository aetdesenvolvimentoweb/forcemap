import { UpdateMilitaryRankService } from "@application/services";
import type {
  IdSanitizerProtocol,
  IdValidatorProtocol,
  MilitaryRankInputDTOSanitizerProtocol,
  MilitaryRankValidatorProtocol,
} from "@application/protocols";
import type { MilitaryRankRepository } from "@domain/repositories";
import { randomUUID } from "crypto";

interface SutTypes {
  sut: UpdateMilitaryRankService;
  militaryRankRepository: MilitaryRankRepository;
  idSanitizer: jest.Mocked<IdSanitizerProtocol>;
  dataSanitizer: jest.Mocked<MilitaryRankInputDTOSanitizerProtocol>;
  idValidator: jest.Mocked<IdValidatorProtocol>;
  dataValidator: jest.Mocked<MilitaryRankValidatorProtocol>;
}

const makeSut = (): SutTypes => {
  const militaryRankRepository = {
    create: jest.fn(),
    findByAbbreviation: jest.fn(),
    findByOrder: jest.fn(),
    listAll: jest.fn(),
    listById: jest.fn(),
    delete: jest.fn(),
    update: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<MilitaryRankRepository>;

  const idSanitizer = {
    sanitize: jest.fn((id) => id.trim()),
  } as jest.Mocked<IdSanitizerProtocol>;

  const dataSanitizer = {
    sanitize: jest.fn((data) => ({ ...data })),
  } as jest.Mocked<MilitaryRankInputDTOSanitizerProtocol>;

  const idValidator = {
    validate: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<IdValidatorProtocol>;

  const dataValidator = {
    validate: jest.fn().mockResolvedValue(undefined),
  } as jest.Mocked<MilitaryRankValidatorProtocol>;

  const sut = new UpdateMilitaryRankService({
    militaryRankRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    dataValidator,
  });

  return {
    sut,
    militaryRankRepository,
    idSanitizer,
    dataSanitizer,
    idValidator,
    dataValidator,
  };
};

describe("UpdateMilitaryRankService", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  it("should sanitize, validate and update correctly", async () => {
    // ARRANGE
    const {
      sut,
      militaryRankRepository,
      idSanitizer,
      dataSanitizer,
      idValidator,
      dataValidator,
    } = sutInstance;
    const id = randomUUID();
    const id_with_spaces = ` ${id} `;
    const data = { abbreviation: "SGT", order: 2 };

    jest.spyOn(militaryRankRepository, "listById").mockResolvedValue({
      id,
      abbreviation: "SGT",
      order: 1,
    });

    // ACT
    await sut.update(id_with_spaces, data);

    // ASSERT
    expect(idSanitizer.sanitize).toHaveBeenCalledWith(id_with_spaces);
    expect(dataSanitizer.sanitize).toHaveBeenCalledWith(data);
    expect(idValidator.validate).toHaveBeenCalledWith(id);
    expect(dataValidator.validate).toHaveBeenCalledWith(data, id);
    expect(militaryRankRepository.update).toHaveBeenCalledWith(id, data);
  });

  it("should propagate error from idValidator", async () => {
    // ARRANGE
    const { sut, idValidator } = sutInstance;
    const error = new Error("ID inválido");
    idValidator.validate.mockRejectedValueOnce(error);

    // ACT & ASSERT
    await expect(
      sut.update("invalid-id", { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("ID inválido");
  });

  it("should propagate error from dataValidator", async () => {
    // ARRANGE
    const { sut, dataValidator } = sutInstance;
    const error = new Error("Dados inválidos");
    dataValidator.validate.mockRejectedValueOnce(error);

    // ACT & ASSERT
    await expect(
      sut.update("valid-id", { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("Dados inválidos");
  });

  it("should propagate error from repository", async () => {
    // ARRANGE
    const { sut, militaryRankRepository } = sutInstance;
    const id = randomUUID();
    const error = new Error("Falha no update");
    jest.spyOn(militaryRankRepository, "listById").mockResolvedValue({
      id,
      abbreviation: "SGT",
      order: 1,
    });
    jest.spyOn(militaryRankRepository, "update").mockRejectedValueOnce(error);

    // ACT & ASSERT
    await expect(
      sut.update(id, { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("Falha no update");
  });
});
