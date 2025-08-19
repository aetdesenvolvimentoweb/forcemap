import { makeDeleteMilitaryRankController } from "@main/factories";
import { DeleteMilitaryRankController } from "@presentation/controllers";

describe("makeDeleteMilitaryRankController", () => {
  it("should return an instance of DeleteMilitaryRankController", () => {
    const httpResponseFactory = {
      ok: jest.fn(),
      badRequest: jest.fn(),
      serverError: jest.fn(),
      created: jest.fn(),
    };
    const controller = makeDeleteMilitaryRankController({
      httpResponseFactory,
    });
    expect(controller).toBeInstanceOf(DeleteMilitaryRankController);
  });

  it("should expose a public handle method", () => {
    const httpResponseFactory = {
      ok: jest.fn(),
      badRequest: jest.fn(),
      serverError: jest.fn(),
      created: jest.fn(),
    };
    const controller = makeDeleteMilitaryRankController({
      httpResponseFactory,
    });
    expect(typeof controller.handle).toBe("function");
  });
});
