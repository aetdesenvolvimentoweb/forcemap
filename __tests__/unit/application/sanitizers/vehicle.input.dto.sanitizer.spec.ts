import { VehicleInputDTOSanitizer } from "../../../../src/application/sanitizers";
import { VehicleInputDTO } from "../../../../src/domain/dtos";
import { VehicleSituation } from "../../../../src/domain/entities";

describe("VehicleInputDTOSanitizer", () => {
  let sut: VehicleInputDTOSanitizer;

  beforeEach(() => {
    sut = new VehicleInputDTOSanitizer();
  });

  describe("sanitize", () => {
    it("should return clean data unchanged", () => {
      const cleanData: VehicleInputDTO = {
        name: "Vehicle Name",
        situation: VehicleSituation.ATIVA,
        complement: "Complement text",
      };

      const result = sut.sanitize(cleanData);

      expect(result).toEqual({
        name: "Vehicle Name",
        situation: VehicleSituation.ATIVA,
        complement: "Complement text",
      });
    });

    describe("name sanitization", () => {
      it("should trim whitespaces from name", () => {
        const data: VehicleInputDTO = {
          name: "  Vehicle Name  ",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("Vehicle Name");
      });

      it("should replace multiple spaces with single space", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle    Name    Test",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("Vehicle Name Test");
      });

      it("should remove single quotes from name", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle'Name",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehicleName");
      });

      it("should remove double quotes from name", () => {
        const data: VehicleInputDTO = {
          name: 'Vehicle"Name',
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehicleName");
      });

      it("should remove semicolons from name", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle;Name",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehicleName");
      });

      it("should remove backslashes from name", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle\\Name",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehicleName");
      });

      it("should remove SQL comment sequences (--) from name", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle--comment",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("Vehiclecomment");
      });

      it("should remove multi-line comment sequences from name", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle/*comment*/Name",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehiclecommentName");
      });

      it("should handle complex malicious name", () => {
        const data: VehicleInputDTO = {
          name: "  'Vehicle';--/*malicious*/'Name'  ",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("VehiclemaliciousName");
      });

      it("should return name as-is when not a string", () => {
        const data = {
          name: null as any,
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe(null);
      });

      it("should return empty name as-is", () => {
        const data: VehicleInputDTO = {
          name: "",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("");
      });
    });

    describe("situation sanitization", () => {
      it("should sanitize situation string", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: "  ativa  " as VehicleSituation,
        };

        const result = sut.sanitize(data);

        expect(result.situation).toBe("ativa");
      });

      it("should remove malicious characters from situation", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: "'ativa';--comment" as VehicleSituation,
        };

        const result = sut.sanitize(data);

        expect(result.situation).toBe("ativacomment");
      });

      it("should handle situation with SQL injection attempts", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: "ativa'; DROP TABLE vehicles;--" as VehicleSituation,
        };

        const result = sut.sanitize(data);

        expect(result.situation).toBe("ativa DROP TABLE vehicles");
      });
    });

    describe("complement sanitization", () => {
      it("should trim whitespaces from complement", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
          complement: "  Complement text  ",
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("Complement text");
      });

      it("should replace multiple spaces with single space in complement", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
          complement: "Complement    text    here",
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("Complement text here");
      });

      it("should remove dangerous characters from complement", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
          complement: "Complement';--/*injection*/text",
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("Complementinjectiontext");
      });

      it("should return empty string when complement is undefined", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("");
      });

      it("should return empty string when complement is null", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
          complement: null as any,
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("");
      });

      it("should return empty string when complement is empty", () => {
        const data: VehicleInputDTO = {
          name: "Vehicle Name",
          situation: VehicleSituation.ATIVA,
          complement: "",
        };

        const result = sut.sanitize(data);

        expect(result.complement).toBe("");
      });
    });

    describe("complete data sanitization", () => {
      it("should sanitize all fields simultaneously", () => {
        const data = {
          name: "  'Vehicle'--comment  ",
          situation: "  ativa;/*test*/'  " as VehicleSituation,
          complement: "  Complement';--text  ",
        };

        const result = sut.sanitize(data);

        expect(result).toEqual({
          name: "Vehiclecomment",
          situation: "ativatest",
          complement: "Complementtext",
        });
      });

      it("should handle completely malicious input", () => {
        const data = {
          name: "';DROP TABLE vehicles;--",
          situation: "ativa'; DELETE FROM vehicles;--" as VehicleSituation,
          complement: "/* malicious comment */ complement",
        };

        const result = sut.sanitize(data);

        expect(result.name).toBe("DROP TABLE vehicles");
        expect(result.situation).toBe("ativa DELETE FROM vehicles");
        expect(result.complement).toBe(" malicious comment  complement");
      });

      it("should handle data without complement", () => {
        const data: VehicleInputDTO = {
          name: "  Vehicle'Name;  ",
          situation: VehicleSituation.BAIXADA,
        };

        const result = sut.sanitize(data);

        expect(result).toEqual({
          name: "VehicleName",
          situation: VehicleSituation.BAIXADA,
          complement: "",
        });
      });
    });
  });
});
