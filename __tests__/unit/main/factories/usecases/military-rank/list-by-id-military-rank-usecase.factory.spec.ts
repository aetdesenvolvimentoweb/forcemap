jest.mock("@main/factories/validators", () => ({
  makeUUIDIdValidator: jest.fn(() => ({
    validate: jest.fn(),
  })),
  makeMongoDbIdValidator: jest.fn(() => ({ validate: jest.fn() })),
}));
import { ListByIdMilitaryRankService } from "@application/services";
import { makeListByIdMilitaryRankUseCase } from "@main/factories";

jest.mock("@main/factories/repositories", () => ({
  makeMilitaryRankRepository: jest.fn(() => ({ fake: true })),
}));
jest.mock("@main/factories/sanitizers", () => ({
  makeIdSanitizer: jest.fn(() => ({ sanitize: jest.fn() })),
}));
// ...existing code...

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
