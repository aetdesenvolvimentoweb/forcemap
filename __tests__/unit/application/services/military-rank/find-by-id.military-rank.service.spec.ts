import {
  mockMilitaryRankRepository,
  mockIdSanitizer,
  mockIdValidator,
  mockMilitaryRankIdRegisteredValidator,
} from "../../../../../__mocks__";
import { FindByIdMilitaryRankService } from "../../../../../src/application/services";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("FindByIdMilitaryRankService", () => {
  let sut: FindByIdMilitaryRankService;
  let mockedRepository: any;
  let mockedSanitizer: any;
  let mockedIdValidator: any;
  let mockedIdRegisteredValidator: any;

  beforeEach(() => {
    mockedRepository = mockMilitaryRankRepository();
    mockedSanitizer = mockIdSanitizer();
    mockedIdValidator = mockIdValidator();
    mockedIdRegisteredValidator = mockMilitaryRankIdRegisteredValidator();

    sut = new FindByIdMilitaryRankService({
      militaryRankRepository: mockedRepository,
      sanitizer: mockedSanitizer,
      idValidator: mockedIdValidator,
      idRegisteredValidator: mockedIdRegisteredValidator,
    });
  });

  describe("findById", () => {
    const inputId = "123e4567-e89b-12d3-a456-426614174000";
    const sanitizedId = "123e4567-e89b-12d3-a456-426614174000";
    const mockMilitaryRank: MilitaryRank = {
      id: sanitizedId,
      abbreviation: "CEL",
      order: 10,
    };

    it("should find military rank successfully with valid id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      const result = await sut.findById(inputId);

      expect(result).toEqual(mockMilitaryRank);
    });

    it("should return null when military rank not found", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(null);

      const result = await sut.findById(inputId);

      expect(result).toBeNull();
    });

    it("should call sanitizer with input id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.findById(inputId);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledWith(inputId);
      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
    });

    it("should call id validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.findById(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(sanitizedId);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call id registered validator with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.findById(inputId);

      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        sanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
    });

    it("should call repository findById with sanitized id", async () => {
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.findById(inputId);

      expect(mockedRepository.findById).toHaveBeenCalledWith(sanitizedId);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should use sanitized id for all validators and repository", async () => {
      const differentSanitizedId = "456e7890-e12b-34c5-d678-901234567890";
      mockedSanitizer.sanitize.mockReturnValue(differentSanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(mockMilitaryRank);

      await sut.findById(inputId);

      expect(mockedIdValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledWith(
        differentSanitizedId,
      );
      expect(mockedRepository.findById).toHaveBeenCalledWith(
        differentSanitizedId,
      );
    });

    it("should propagate sanitizer exceptions", async () => {
      const sanitizerError = new Error("Invalid ID format");
      mockedSanitizer.sanitize.mockImplementation(() => {
        throw sanitizerError;
      });

      await expect(sut.findById(inputId)).rejects.toThrow(sanitizerError);

      expect(mockedIdValidator.validate).not.toHaveBeenCalled();
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate id validator exceptions", async () => {
      const validatorError = new Error("Invalid UUID format");
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {
        throw validatorError;
      });

      await expect(sut.findById(inputId)).rejects.toThrow(validatorError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).not.toHaveBeenCalled();
      expect(mockedRepository.findById).not.toHaveBeenCalled();
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockRejectedValue(repositoryError);

      await expect(sut.findById(inputId)).rejects.toThrow(repositoryError);

      expect(mockedSanitizer.sanitize).toHaveBeenCalledTimes(1);
      expect(mockedIdValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedIdRegisteredValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockedRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should return military rank with correct structure", async () => {
      const expectedMilitaryRank: MilitaryRank = {
        id: "999e8888-e77f-66g6-h555-444444444444",
        abbreviation: "MAJ",
        order: 8,
      };

      mockedSanitizer.sanitize.mockReturnValue(sanitizedId);
      mockedIdValidator.validate.mockImplementation(() => {});
      mockedIdRegisteredValidator.validate.mockResolvedValue();
      mockedRepository.findById.mockResolvedValue(expectedMilitaryRank);

      const result = await sut.findById(inputId);

      expect(result).toEqual(expectedMilitaryRank);
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("abbreviation");
      expect(result).toHaveProperty("order");
    });
  });
});
