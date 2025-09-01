import {
  mockMilitaryRankRepository,
  mockIdSanitizer,
  mockIdValidator,
  mockMilitaryRankIdRegisteredValidator,
} from "../../../../../__mocks__";
import { DeleteMilitaryRankService } from "../../../../../src/application/services";

describe("DeleteMilitaryRankService", () => {
  let sut: DeleteMilitaryRankService;
  let mockedRepository: any;
  let mockedSanitizer: any;
  let mockedIdValidator: any;
  let mockedIdRegisteredValidator: any;

  beforeEach(() => {
    mockedRepository = mockMilitaryRankRepository();
    mockedSanitizer = mockIdSanitizer();
    mockedIdValidator = mockIdValidator();
    mockedIdRegisteredValidator = mockMilitaryRankIdRegisteredValidator();
    
    sut = new DeleteMilitaryRankService({
      militaryRankRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
    });
  });

  describe("delete", () => {
    const inputId = "123e4567-e89b-12d3-a456-426614174000";
    const sanitizedId = "123e4567-e89b-12d3-a456-426614174000";

    it("should delete military rank successfully with valid id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      await expect(sut.delete(inputId)).resolves.not.toThrow();
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      await sut.delete(inputId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      await sut.delete(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      await sut.delete(inputId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository delete with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      await sut.delete(inputId);

      expect(mockedRepository.delete).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should propagate sanitizer exceptions", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.delete(inputId)).rejects.toThrow(sanitizerError);

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Invalid UUID format");
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.delete(inputId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.delete).not.toHaveBeenCalled();
    });


    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockRejectedValue(repositoryError);

      await expect(sut.delete(inputId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should not return any value", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.delete.mockResolvedValue();

      const result = await sut.delete(inputId);

      expect(result).toBeUndefined();
    });
  });
});