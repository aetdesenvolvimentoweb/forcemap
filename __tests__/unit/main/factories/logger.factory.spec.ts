import { makeLogger } from "@main/factories/logger.factory";
import { PinoLogger } from "@infra/loggers";

describe("makeLogger", () => {
  it("should return a PinoLogger instance", () => {
    const logger = makeLogger();

    expect(logger).toBeInstanceOf(PinoLogger);
  });

  it("should create logger with correct interface", () => {
    const logger = makeLogger();

    expect(logger.info).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.child).toBeDefined();
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.child).toBe("function");
  });
});
