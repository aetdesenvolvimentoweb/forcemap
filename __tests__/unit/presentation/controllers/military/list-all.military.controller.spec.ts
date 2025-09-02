import {
  mockListAllMilitaryService,
  mockLogger,
} from "../../../../../__mocks__";
import { ListAllMilitaryController } from "../../../../../src/presentation/controllers";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";
import { EntityNotFoundError } from "../../../../../src/application/errors";

describe("ListAllMilitaryController", () => {
  let sut: ListAllMilitaryController;
  let mockedService = mockListAllMilitaryService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllMilitaryController({
      listAllMilitaryService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockMilitaryList: MilitaryOutputDTO[] = [
      {
        id: "military-1",
        militaryRankId: "rank-1",
        militaryRank: { id: "rank-1", abbreviation: "CEL", order: 10 },
        rg: 11111111,
        name: "João da Silva",
      },
      {
        id: "military-2",
        militaryRankId: "rank-2",
        militaryRank: { id: "rank-2", abbreviation: "MAJ", order: 8 },
        rg: 22222222,
        name: "Maria dos Santos",
      },
    ];

    it("should list all military successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockMilitaryList },
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar todos os militares",
      );
    });

    it("should log info when military list is retrieved successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militares listados com sucesso",
        {
          count: mockMilitaryList.length,
        },
      );
    });

    it("should return empty array when no military found", async () => {
      const emptyList: MilitaryOutputDTO[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: emptyList },
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log correct count when no military found", async () => {
      const emptyList: MilitaryOutputDTO[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militares listados com sucesso",
        {
          count: 0,
        },
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("Military");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      await sut.handle();

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar militares",
        {
          error: serviceError,
          requestData: undefined,
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Unexpected error");
      mockedService.listAll.mockRejectedValueOnce(unknownError);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle large datasets correctly", async () => {
      const largeMilitaryList: MilitaryOutputDTO[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `military-${index + 1}`,
          militaryRankId: `rank-${index + 1}`,
          militaryRank: {
            id: `rank-${index + 1}`,
            abbreviation: "TEN",
            order: index + 1,
          },
          rg: index + 1,
          name: `Militar ${index + 1}`,
        }),
      );

      mockedService.listAll.mockResolvedValueOnce(largeMilitaryList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: largeMilitaryList },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Militares listados com sucesso",
        {
          count: 1000,
        },
      );
    });

    it("should handle concurrent requests independently", async () => {
      const list1: MilitaryOutputDTO[] = [mockMilitaryList[0]];
      const list2: MilitaryOutputDTO[] = [mockMilitaryList[1]];

      mockedService.listAll
        .mockResolvedValueOnce(list1)
        .mockResolvedValueOnce(list2);

      const [result1, result2] = await Promise.all([
        sut.handle(),
        sut.handle(),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: list1 },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: list2 },
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(2);
    });

    it("should maintain data integrity in response", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryList);

      const result = await sut.handle();

      expect(result.body).toEqual({ data: mockMilitaryList });
      expect(Array.isArray(result.body?.data)).toBe(true);

      if (Array.isArray(result.body)) {
        (result.body?.data as MilitaryOutputDTO[])?.forEach(
          (military: MilitaryOutputDTO) => {
            expect(military).toHaveProperty("id");
            expect(military).toHaveProperty("militaryRankId");
            expect(military).toHaveProperty("militaryRank");
            expect(military).toHaveProperty("rg");
            expect(military).toHaveProperty("name");
            expect(typeof military.id).toBe("string");
            expect(typeof military.militaryRankId).toBe("string");
            expect(typeof military.militaryRank).toBe("object");
            expect(typeof military.rg).toBe("number");
            expect(typeof military.name).toBe("string");
          },
        );
      }
    });

    it("should not modify the service response", async () => {
      const originalList = [...mockMilitaryList];
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryList);

      await sut.handle();

      expect(mockMilitaryList).toEqual(originalList);
    });
  });
});
