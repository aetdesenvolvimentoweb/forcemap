import { makeDeleteMilitaryRankUseCase } from "@main/factories/usecases";
import { DeleteMilitaryRankService } from "@application/services";

describe("makeDeleteMilitaryRankUseCase", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it("should return an instance of DeleteMilitaryRankService", () => {
    const useCase = makeDeleteMilitaryRankUseCase();
    expect(useCase).toBeInstanceOf(DeleteMilitaryRankService);
  });
});
