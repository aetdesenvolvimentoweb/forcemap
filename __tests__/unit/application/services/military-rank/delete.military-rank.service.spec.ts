import { DeleteMilitaryRankService } from "@application/services/military-rank/delete.military-rank.service";
import { EntityNotFoundError } from "@application/errors";

describe("DeleteMilitaryRankService", () => {
  let militaryRankRepository: any;
  let sanitizer: any;
  let validator: any;
  let service: DeleteMilitaryRankService;

  beforeEach(() => {
    militaryRankRepository = {
      listById: jest.fn(),
      delete: jest.fn(),
    };
    sanitizer = { sanitize: jest.fn((id) => id) };
    validator = { validate: jest.fn(async () => undefined) };
    service = new DeleteMilitaryRankService({
      militaryRankRepository,
      sanitizer,
      validator,
    });
  });

  it("should sanitize and validate the id, then delete if found", async () => {
    militaryRankRepository.listById.mockResolvedValue({ id: "uuid" });
    await service.delete("uuid");
    expect(sanitizer.sanitize).toHaveBeenCalledWith("uuid");
    expect(validator.validate).toHaveBeenCalledWith("uuid");
    expect(militaryRankRepository.listById).toHaveBeenCalledWith("uuid");
    expect(militaryRankRepository.delete).toHaveBeenCalledWith("uuid");
  });

  it("should throw EntityNotFoundError if military rank does not exist", async () => {
    militaryRankRepository.listById.mockResolvedValue(null);
    await expect(service.delete("uuid")).rejects.toThrow(EntityNotFoundError);
    expect(militaryRankRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate errors from validator", async () => {
    validator.validate.mockRejectedValue(new Error("invalid id"));
    await expect(service.delete("uuid")).rejects.toThrow("invalid id");
    expect(militaryRankRepository.delete).not.toHaveBeenCalled();
  });

  it("should propagate errors from repository delete", async () => {
    militaryRankRepository.listById.mockResolvedValue({ id: "uuid" });
    militaryRankRepository.delete.mockRejectedValue(new Error("delete error"));
    await expect(service.delete("uuid")).rejects.toThrow("delete error");
  });
});
