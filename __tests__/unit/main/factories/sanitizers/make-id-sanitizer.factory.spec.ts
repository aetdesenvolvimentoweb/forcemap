import { makeIdSanitizer } from "@main/factories/sanitizers/make-id-sanitizer.factory";
import { IdSanitizer } from "@application/sanitizers/id.sanitizer";

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
