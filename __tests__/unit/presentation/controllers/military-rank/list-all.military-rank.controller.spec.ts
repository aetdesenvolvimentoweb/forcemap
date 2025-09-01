import {
  mockListAllMilitaryRankService,
  mockLogger,
} from "../../../../../__mocks__";
import { ListAllMilitaryRankController } from "../../../../../src/presentation/controllers";
import { MilitaryRank } from "../../../../../src/domain/entities";

describe("ListAllMilitaryRankController", () => {
  let sut: ListAllMilitaryRankController;
  let mockedService = mockListAllMilitaryRankService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllMilitaryRankController({
      listAllMilitaryRankService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockMilitaryRanks: MilitaryRank[] = [
      {
        id: "123e4567-e89b-12d3-a456-426614174001",
        abbreviation: "CEL",
        order: 10,
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174002",
        abbreviation: "MAJ",
        order: 8,
      },
      {
        id: "123e4567-e89b-12d3-a456-426614174003",
        abbreviation: "CAP",
        order: 6,
      },
    ];

    it("should list all military ranks successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryRanks);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: mockMilitaryRanks },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
      expect(mockedService.listAll).toHaveBeenCalledWith();
    });

    it("should return empty array when no military ranks exist", async () => {
      const emptyArray: MilitaryRank[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyArray);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: emptyArray },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryRanks);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar todos os postos/graduações",
      );
    });

    it("should log info when military ranks are listed successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryRanks);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Postos/graduações listados com sucesso",
        { count: mockMilitaryRanks.length },
      );
    });

    it("should log info with zero count when no military ranks exist", async () => {
      const emptyArray: MilitaryRank[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyArray);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Postos/graduações listados com sucesso",
        { count: 0 },
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new Error("Database connection failed");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new Error("Database connection failed");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      await sut.handle();

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar postos/graduações",
        {
          error: serviceError,
          requestData: undefined,
        },
      );
    });

    it("should return single military rank when only one exists", async () => {
      const singleMilitaryRank: MilitaryRank[] = [
        {
          id: "123e4567-e89b-12d3-a456-426614174001",
          abbreviation: "GEN",
          order: 12,
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(singleMilitaryRank);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: singleMilitaryRank },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle concurrent requests independently", async () => {
      const militaryRanks1: MilitaryRank[] = [
        { id: "1", abbreviation: "CEL", order: 10 },
      ];
      const militaryRanks2: MilitaryRank[] = [
        { id: "2", abbreviation: "MAJ", order: 8 },
        { id: "3", abbreviation: "CAP", order: 6 },
      ];

      mockedService.listAll
        .mockResolvedValueOnce(militaryRanks1)
        .mockResolvedValueOnce(militaryRanks2);

      const [result1, result2] = await Promise.all([
        sut.handle(),
        sut.handle(),
      ]);

      expect(result1).toEqual({
        body: { data: militaryRanks1 },
        statusCode: 200,
      });
      expect(result2).toEqual({
        body: { data: militaryRanks2 },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(2);
    });

    it("should preserve military rank data structure integrity", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockMilitaryRanks);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: mockMilitaryRanks },
        statusCode: 200,
      });

      const returnedData = result.body?.data as MilitaryRank[];
      expect(Array.isArray(returnedData)).toBe(true);

      returnedData.forEach((militaryRank) => {
        expect(militaryRank).toHaveProperty("id");
        expect(militaryRank).toHaveProperty("abbreviation");
        expect(militaryRank).toHaveProperty("order");
        expect(typeof militaryRank.id).toBe("string");
        expect(typeof militaryRank.abbreviation).toBe("string");
        expect(typeof militaryRank.order).toBe("number");
      });
    });

    it("should handle military ranks with special characters in abbreviation", async () => {
      const militaryRanksWithSpecialChars: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "1º SGT",
          order: 5,
        },
        {
          id: "2",
          abbreviation: "2º SGT",
          order: 4,
        },
        {
          id: "3",
          abbreviation: "3º SGT",
          order: 3,
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(
        militaryRanksWithSpecialChars,
      );

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: militaryRanksWithSpecialChars },
        statusCode: 200,
      });
    });

    it("should handle military ranks with zero order", async () => {
      const militaryRanksWithZeroOrder: MilitaryRank[] = [
        {
          id: "1",
          abbreviation: "REC",
          order: 0,
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(militaryRanksWithZeroOrder);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: militaryRanksWithZeroOrder },
        statusCode: 200,
      });
    });

    it("should handle large list of military ranks", async () => {
      const largeMilitaryRanksList: MilitaryRank[] = Array.from(
        { length: 100 },
        (_, index) => ({
          id: `id-${index}`,
          abbreviation: `RANK-${index}`,
          order: index,
        }),
      );

      mockedService.listAll.mockResolvedValueOnce(largeMilitaryRanksList);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: largeMilitaryRanksList },
        statusCode: 200,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log correct count for large list", async () => {
      const largeMilitaryRanksList: MilitaryRank[] = Array.from(
        { length: 50 },
        (_, index) => ({
          id: `id-${index}`,
          abbreviation: `RANK-${index}`,
          order: index,
        }),
      );

      mockedService.listAll.mockResolvedValueOnce(largeMilitaryRanksList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Postos/graduações listados com sucesso",
        { count: 50 },
      );
    });

    it("should handle mixed military ranks with different patterns", async () => {
      const mixedMilitaryRanks: MilitaryRank[] = [
        {
          id: "uuid-1",
          abbreviation: "GEN",
          order: 12,
        },
        {
          id: "uuid-2",
          abbreviation: "1º TEN",
          order: 4,
        },
        {
          id: "uuid-3",
          abbreviation: "REC",
          order: 0,
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(mixedMilitaryRanks);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { data: mixedMilitaryRanks },
        statusCode: 200,
      });
    });

    it("should maintain original array reference integrity", async () => {
      const originalArray = mockMilitaryRanks;
      mockedService.listAll.mockResolvedValueOnce(originalArray);

      const result = await sut.handle();

      expect(result.body?.data).toBe(originalArray);
    });
  });
});
