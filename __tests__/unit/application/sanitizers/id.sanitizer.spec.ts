import { IdSanitizer } from "@application/sanitizers";

describe("IdSanitizer", () => {
  let sanitizer: IdSanitizer;

  beforeEach(() => {
    sanitizer = new IdSanitizer();
  });

  it("should trim spaces from both ends", () => {
    expect(sanitizer.sanitize("  12345  ")).toBe("12345");
    expect(sanitizer.sanitize("\tABC\n")).toBe("ABC");
  });

  it("should return the same string if no spaces", () => {
    expect(sanitizer.sanitize("ID123")).toBe("ID123");
  });

  it("should handle empty string", () => {
    expect(sanitizer.sanitize("")).toBe("");
  });

  it("should not remove spaces in the middle", () => {
    expect(sanitizer.sanitize("A B C")).toBe("A B C");
  });
});
