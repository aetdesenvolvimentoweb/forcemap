import { makeListByIdMilitaryRankUseCase } from "@main/factories/usecases/military-rank/list-by-id-military-rank-usecase.factory";
import { ListByIdMilitaryRankService } from "@application/services/military-rank/list.by.id.military-rank.service";

jest.mock("@main/factories/repositories", () => ({
  makeMilitaryRankRepository: jest.fn(() => ({ fake: true })),
}));
jest.mock("@main/factories/sanitizers", () => ({
  makeIdSanitizer: jest.fn(() => ({ sanitize: jest.fn() })),
}));
jest.mock("@main/factories/validators", () => ({
  makeMongoDbIdValidator: jest.fn(() => ({ validate: jest.fn() })),
}));

describe("makeListByIdMilitaryRankUseCase", () => {
  it("should return an instance of ListByIdMilitaryRankService", () => {
    const useCase = makeListByIdMilitaryRankUseCase();
    expect(useCase).toBeInstanceOf(ListByIdMilitaryRankService);
  });

  it("should inject all dependencies correctly", () => {
    const useCase = makeListByIdMilitaryRankUseCase();
    // @ts-expect-error testando propriedade privada
    const props = useCase.props;
    expect(props.militaryRankRepository).toEqual({ fake: true });
    expect(typeof props.sanitizer.sanitize).toBe("function");
    expect(typeof props.validator.validate).toBe("function");
  });
});
