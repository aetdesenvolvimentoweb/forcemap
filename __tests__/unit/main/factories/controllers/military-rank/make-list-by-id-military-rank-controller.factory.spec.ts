import { makeListByIdMilitaryRankController } from "@main/factories/controllers";
import { ListByIdMilitaryRankController } from "@presentation/controllers";

jest.mock(
  "@presentation/controllers/military-rank/list.by.id.military-rank.controller",
  () => ({
    ListByIdMilitaryRankController: jest.fn(),
  }),
);

const mockListByIdMilitaryRankController =
  ListByIdMilitaryRankController as jest.MockedClass<
    typeof ListByIdMilitaryRankController
  >;

describe("makeListByIdMilitaryRankController", () => {
  const httpResponseFactoryMock = {
    ok: jest.fn(),
    badRequest: jest.fn(),
    serverError: jest.fn(),
    created: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockListByIdMilitaryRankController.mockImplementation(
      () => ({ handle: jest.fn() }) as any,
    );
  });

  it("should create ListByIdMilitaryRankController with correct dependencies", () => {
    makeListByIdMilitaryRankController({
      httpResponseFactory: httpResponseFactoryMock,
    });
    expect(mockListByIdMilitaryRankController).toHaveBeenCalledTimes(1);
    expect(mockListByIdMilitaryRankController).toHaveBeenCalledWith(
      expect.objectContaining({ httpResponseFactory: httpResponseFactoryMock }),
    );
  });

  it("should return the created controller instance", () => {
    const mockControllerInstance = { handle: jest.fn() };
    mockListByIdMilitaryRankController.mockReturnValueOnce(
      mockControllerInstance as any,
    );
    const result = makeListByIdMilitaryRankController({
      httpResponseFactory: httpResponseFactoryMock,
    });
    expect(result).toBe(mockControllerInstance);
  });
});
