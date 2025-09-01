import { MilitaryRankInputDTOSanitizer } from "../../../../src/application/sanitizers";
import { MilitaryRankInputDTO } from "../../../../src/domain/dtos";

describe("MilitaryRankInputDTOSanitizer", () => {
  let sut: MilitaryRankInputDTOSanitizer;

  beforeEach(() => {
    sut = new MilitaryRankInputDTOSanitizer();
  });

  describe("sanitize", () => {
    it("should return clean data unchanged", () => {
      const cleanData: MilitaryRankInputDTO = {
        abbreviation: "CEL",
        order: 10,
      };

      const result = sut.sanitize(cleanData);

      expect(result).toEqual({
        abbreviation: "CEL",
        order: 10,
      });
    });

    describe("abbreviation sanitization", () => {
      it("should trim whitespaces from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "  CEL  ",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL");
      });

      it("should replace multiple spaces with single space", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL   MAJ   CAP",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL MAJ CAP");
      });

      it("should remove single quotes from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CE'L",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL");
      });

      it("should remove double quotes from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: 'CE"L',
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL");
      });

      it("should remove semicolons from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CE;L",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL");
      });

      it("should remove backslashes from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CE\\L",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CEL");
      });

      it("should remove SQL comment sequences (--) from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL--comment",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CELcomment");
      });

      it("should remove multi-line comment sequences from abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL/*comment*/",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CELcomment");
      });

      it("should handle complex malicious abbreviation", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "  'CEL';--/*malicious*/'  ",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("CELmalicious");
      });

      it("should return abbreviation as-is when not a string", () => {
        const data = {
          abbreviation: null as any,
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe(null);
      });

      it("should return empty abbreviation as-is", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("");
      });
    });

    describe("order sanitization", () => {
      it("should keep number order unchanged", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: 10,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBe(10);
      });

      it("should convert string number to number", () => {
        const data = {
          abbreviation: "CEL",
          order: "15" as any,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBe(15);
        expect(typeof result.order).toBe("number");
      });

      it("should convert string float to number", () => {
        const data = {
          abbreviation: "CEL",
          order: "10.5" as any,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBe(10.5);
        expect(typeof result.order).toBe("number");
      });

      it("should handle invalid string as NaN", () => {
        const data = {
          abbreviation: "CEL",
          order: "invalid" as any,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBeNaN();
      });

      it("should handle zero as valid number", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: 0,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBe(0);
      });

      it("should handle negative numbers", () => {
        const data: MilitaryRankInputDTO = {
          abbreviation: "CEL",
          order: -5,
        };

        const result = sut.sanitize(data);

        expect(result.order).toBe(-5);
      });
    });

    describe("complete data sanitization", () => {
      it("should sanitize both fields simultaneously", () => {
        const data = {
          abbreviation: "  'CEL'--comment  ",
          order: "15" as any,
        };

        const result = sut.sanitize(data);

        expect(result).toEqual({
          abbreviation: "CELcomment",
          order: 15,
        });
      });

      it("should handle completely malicious input", () => {
        const data = {
          abbreviation: "';DROP TABLE users;--",
          order: "1; DELETE FROM ranks;" as any,
        };

        const result = sut.sanitize(data);

        expect(result.abbreviation).toBe("DROP TABLE users");
        expect(result.order).toBe(1);
      });
    });
  });
});
