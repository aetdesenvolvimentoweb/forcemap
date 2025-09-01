import { IdSanitizer } from "../../../../src/application/sanitizers/id.sanitizer";

describe("IdSanitizer", () => {
  let sut: IdSanitizer;

  beforeEach(() => {
    sut = new IdSanitizer();
  });

  describe("sanitize", () => {
    it("should return the same string when id is clean", () => {
      const cleanId = "550e8400-e29b-41d4-a716-446655440000";

      const result = sut.sanitize(cleanId);

      expect(result).toBe(cleanId);
    });

    it("should trim whitespaces from start and end", () => {
      const idWithSpaces = "  550e8400-e29b-41d4-a716-446655440000  ";
      const expected = "550e8400-e29b-41d4-a716-446655440000";

      const result = sut.sanitize(idWithSpaces);

      expect(result).toBe(expected);
    });

    it("should replace multiple whitespaces with single space", () => {
      const idWithMultipleSpaces = "550e8400   e29b   41d4";
      const expected = "550e8400 e29b 41d4";

      const result = sut.sanitize(idWithMultipleSpaces);

      expect(result).toBe(expected);
    });

    it("should remove single quotes", () => {
      const idWithQuotes = "550e8400'e29b'41d4";
      const expected = "550e8400e29b41d4";

      const result = sut.sanitize(idWithQuotes);

      expect(result).toBe(expected);
    });

    it("should remove double quotes", () => {
      const idWithQuotes = 'id"with"quotes';
      const expected = "idwithquotes";

      const result = sut.sanitize(idWithQuotes);

      expect(result).toBe(expected);
    });

    it("should remove semicolons", () => {
      const idWithSemicolon = "id;with;semicolon";
      const expected = "idwithsemicolon";

      const result = sut.sanitize(idWithSemicolon);

      expect(result).toBe(expected);
    });

    it("should remove backslashes", () => {
      const idWithBackslash = "id\\with\\backslash";
      const expected = "idwithbackslash";

      const result = sut.sanitize(idWithBackslash);

      expect(result).toBe(expected);
    });

    it("should remove SQL comment sequences (--)", () => {
      const idWithSqlComment = "id--comment";
      const expected = "idcomment";

      const result = sut.sanitize(idWithSqlComment);

      expect(result).toBe(expected);
    });

    it("should remove multi-line comment start (/*)", () => {
      const idWithMultiLineStart = "id/*comment";
      const expected = "idcomment";

      const result = sut.sanitize(idWithMultiLineStart);

      expect(result).toBe(expected);
    });

    it("should remove multi-line comment end (*/)", () => {
      const idWithMultiLineEnd = "id*/comment";
      const expected = "idcomment";

      const result = sut.sanitize(idWithMultiLineEnd);

      expect(result).toBe(expected);
    });

    it("should sanitize complex malicious input", () => {
      const maliciousInput = "  'id';--/*comment*/'  ";
      const expected = "idcomment";

      const result = sut.sanitize(maliciousInput);

      expect(result).toBe(expected);
    });

    it("should return input as-is when it is not a string", () => {
      const nonStringInput = null as any;

      const result = sut.sanitize(nonStringInput);

      expect(result).toBe(nonStringInput);
    });

    it("should return input as-is when it is empty", () => {
      const emptyInput = "";

      const result = sut.sanitize(emptyInput);

      expect(result).toBe(emptyInput);
    });

    it("should handle undefined input", () => {
      const undefinedInput = undefined as any;

      const result = sut.sanitize(undefinedInput);

      expect(result).toBe(undefinedInput);
    });

    it("should handle valid UUID with all dangerous characters", () => {
      const dangerousUuid = "  '550e8400';--e29b/*41d4*/a716\"446655440000'  ";
      const expected = "550e8400e29b41d4a716446655440000";

      const result = sut.sanitize(dangerousUuid);

      expect(result).toBe(expected);
    });
  });
});
