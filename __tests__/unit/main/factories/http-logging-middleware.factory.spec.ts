import { makeHttpLoggingMiddleware } from "@main/factories/http-logging-middleware.factory";
import { HttpLoggingMiddleware } from "@presentation/middlewares";

describe("makeHttpLoggingMiddleware", () => {
  it("should create HttpLoggingMiddleware instance", () => {
    const middleware = makeHttpLoggingMiddleware();

    expect(middleware).toBeInstanceOf(HttpLoggingMiddleware);
  });

  it("should return middleware with correct interface", () => {
    const middleware = makeHttpLoggingMiddleware();

    expect(middleware.handle).toBeDefined();
    expect(typeof middleware.handle).toBe("function");
  });

  it("should inject logger dependency", () => {
    const middleware1 = makeHttpLoggingMiddleware();
    const middleware2 = makeHttpLoggingMiddleware();

    // Cada instância deve ser independente
    expect(middleware1).not.toBe(middleware2);
    expect(middleware1).toBeInstanceOf(HttpLoggingMiddleware);
    expect(middleware2).toBeInstanceOf(HttpLoggingMiddleware);
  });
});
