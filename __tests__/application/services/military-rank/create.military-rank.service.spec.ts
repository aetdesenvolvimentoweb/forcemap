import { CreateMilitaryRankService } from "@application/services";

describe("CreateMilitaryRankService", () => {
  it("should create a military rank", async () => {
    const militaryRankRepository = {
      create: jest.fn().mockResolvedValue(undefined),
      findById: jest.fn(),
      findByOrder: jest.fn(),
    };
    const service = new CreateMilitaryRankService({
      militaryRankRepository,
    });
    const dto = {
      abbreviation: "CEL",
      order: 1,
    };
    await service.create(dto);
    expect(militaryRankRepository.create).toHaveBeenCalledWith(dto);
  });
});
