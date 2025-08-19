import { IdSanitizer } from "@application/sanitizers";
import { makeIdSanitizer } from "@main/factories";

describe("makeIdSanitizer", () => {
  it("should return an instance of IdSanitizer", () => {
    const sanitizer = makeIdSanitizer();
    expect(sanitizer).toBeInstanceOf(IdSanitizer);
  });

  it("should implement IdSanitizerProtocol (sanitize method)", () => {
    const sanitizer = makeIdSanitizer();
    expect(typeof sanitizer.sanitize).toBe("function");
  });
});
