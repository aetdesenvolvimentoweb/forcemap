import { UpdateMilitaryRankService } from "@application/services";
import type { MilitaryRankInputDTO } from "@domain/dtos";

describe("UpdateMilitaryRankService", () => {
  const makeMocks = () => {
    return {
      militaryRankRepository: {
        create: jest.fn(),
        findByAbbreviation: jest.fn(),
        findByOrder: jest.fn(),
        listAll: jest.fn(),
        listById: jest.fn(),
        delete: jest.fn(),
        update: jest.fn().mockResolvedValue(undefined),
      },
      idSanitizer: {
        sanitize: jest.fn((id) => id.trim()),
      },
      dataSanitizer: {
        sanitize: jest.fn((data) => ({ ...data })),
      },
      idValidator: {
        validate: jest.fn().mockResolvedValue(undefined),
      },
      dataValidator: {
        validate: jest.fn().mockResolvedValue(undefined),
      },
    };
  };

  it("should sanitize, validate and update correctly", async () => {
    // ARRANGE
    const mocks = makeMocks();
    const service = new UpdateMilitaryRankService(mocks);
    const id = " 123 ";
    const data: MilitaryRankInputDTO = { abbreviation: "SGT", order: 2 };

    // ACT
    await service.update(id, data);

    // ASSERT
    expect(mocks.idSanitizer.sanitize).toHaveBeenCalledWith(id);
    expect(mocks.dataSanitizer.sanitize).toHaveBeenCalledWith(data);
    expect(mocks.idValidator.validate).toHaveBeenCalledWith("123");
    expect(mocks.dataValidator.validate).toHaveBeenCalledWith(data, "123");
    expect(mocks.militaryRankRepository.update).toHaveBeenCalledWith(
      "123",
      data,
    );
  });

  it("should propagate error from idValidator", async () => {
    const mocks = makeMocks();
    mocks.idValidator.validate.mockRejectedValueOnce(new Error("ID inválido"));
    const service = new UpdateMilitaryRankService(mocks);
    await expect(
      service.update("id", { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("ID inválido");
  });

  it("should propagate error from dataValidator", async () => {
    const mocks = makeMocks();
    mocks.dataValidator.validate.mockRejectedValueOnce(
      new Error("Dados inválidos"),
    );
    const service = new UpdateMilitaryRankService(mocks);
    await expect(
      service.update("id", { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("Dados inválidos");
  });

  it("should propagate error from repository", async () => {
    const mocks = makeMocks();
    mocks.militaryRankRepository.update.mockRejectedValueOnce(
      new Error("Falha no update"),
    );
    const service = new UpdateMilitaryRankService(mocks);
    await expect(
      service.update("id", { abbreviation: "SGT", order: 2 }),
    ).rejects.toThrow("Falha no update");
  });
});
