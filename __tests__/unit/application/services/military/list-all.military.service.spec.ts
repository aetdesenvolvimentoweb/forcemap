import { mockMilitaryRepository } from "../../../../../__mocks__";
import { ListAllMilitaryService } from "../../../../../src/application/services";
import { MilitaryOutputDTO } from "../../../../../src/domain/dtos";

describe("ListAllMilitaryService", () => {
  let sut: ListAllMilitaryService;
  let mockedRepository = mockMilitaryRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllMilitaryService({
      militaryRepository: mockedRepository,
    });
  });

  describe("listAll", () => {
    const mockMilitaryList: MilitaryOutputDTO[] = [
      {
        id: "military-id-1",
        militaryRankId: "rank-id-1",
        militaryRank: {
          id: "rank-id-1",
          abbreviation: "CEL",
          order: 10,
        },
        rg: 123456789,
        name: "João Silva",
      },
      {
        id: "military-id-2",
        militaryRankId: "rank-id-2",
        militaryRank: {
          id: "rank-id-2",
          abbreviation: "1º SGT",
          order: 5,
        },
        rg: 987654321,
        name: "Maria Santos",
      },
    ];

    it("should list all military successfully", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockMilitaryList);

      const result = await sut.listAll();

      expect(result).toEqual(mockMilitaryList);
    });

    it("should call repository listAll", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockMilitaryList);

      await sut.listAll();

      expect(mockedRepository.listAll).toHaveBeenCalledWith();
      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should return empty array when no military found", async () => {
      mockedRepository.listAll.mockResolvedValueOnce([]);

      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it("should propagate repository exceptions", async () => {
      const repositoryError = new Error("Database connection failed");

      mockedRepository.listAll.mockRejectedValueOnce(repositoryError);

      await expect(sut.listAll()).rejects.toThrow(repositoryError);

      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should return array with single military", async () => {
      const singleMilitary: MilitaryOutputDTO[] = [mockMilitaryList[0]];

      mockedRepository.listAll.mockResolvedValueOnce(singleMilitary);

      const result = await sut.listAll();

      expect(result).toEqual(singleMilitary);
      expect(result.length).toBe(1);
    });

    it("should handle concurrent calls independently", async () => {
      const list1: MilitaryOutputDTO[] = [mockMilitaryList[0]];
      const list2: MilitaryOutputDTO[] = [mockMilitaryList[1]];

      mockedRepository.listAll
        .mockResolvedValueOnce(list1)
        .mockResolvedValueOnce(list2);

      const results = await Promise.all([sut.listAll(), sut.listAll()]);

      expect(results).toEqual([list1, list2]);
      expect(mockedRepository.listAll).toHaveBeenCalledTimes(2);
    });

    it("should return military with complete data structure", async () => {
      const completeMilitaryList: MilitaryOutputDTO[] = [
        {
          id: "complete-military-id-1",
          militaryRankId: "complete-rank-id-1",
          militaryRank: {
            id: "complete-rank-id-1",
            abbreviation: "GEN EX",
            order: 15,
          },
          rg: 111111111,
          name: "General Exemplo Silva",
        },
        {
          id: "complete-military-id-2",
          militaryRankId: "complete-rank-id-2",
          militaryRank: {
            id: "complete-rank-id-2",
            abbreviation: "2º TEN",
            order: 2,
          },
          rg: 222222222,
          name: "Segundo Tenente Exemplo Santos",
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(completeMilitaryList);

      const result = await sut.listAll();

      expect(result).toEqual(completeMilitaryList);
      expect(result.length).toBe(2);

      expect(result[0].militaryRank).toBeDefined();
      expect(result[0].militaryRank.abbreviation).toBe("GEN EX");
      expect(result[0].militaryRank.order).toBe(15);

      expect(result[1].militaryRank).toBeDefined();
      expect(result[1].militaryRank.abbreviation).toBe("2º TEN");
      expect(result[1].militaryRank.order).toBe(2);
    });

    it("should handle large lists efficiently", async () => {
      const largeMilitaryList: MilitaryOutputDTO[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `military-id-${index}`,
          militaryRankId: `rank-id-${index % 10}`,
          militaryRank: {
            id: `rank-id-${index % 10}`,
            abbreviation: `RANK${index % 10}`,
            order: index % 10,
          },
          rg: 100000000 + index,
          name: `Military ${index}`,
        }),
      );

      mockedRepository.listAll.mockResolvedValueOnce(largeMilitaryList);

      const result = await sut.listAll();

      expect(result).toEqual(largeMilitaryList);
      expect(result.length).toBe(1000);
    });

    it("should handle special characters in names", async () => {
      const specialCharsMilitaryList: MilitaryOutputDTO[] = [
        {
          id: "military-special-1",
          militaryRankId: "rank-special-1",
          militaryRank: {
            id: "rank-special-1",
            abbreviation: "1º SGT",
            order: 5,
          },
          rg: 555555555,
          name: "José da Silva Júnior",
        },
        {
          id: "military-special-2",
          militaryRankId: "rank-special-2",
          militaryRank: {
            id: "rank-special-2",
            abbreviation: "3º SGT",
            order: 3,
          },
          rg: 666666666,
          name: "Maria Conceição dos Santos",
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(specialCharsMilitaryList);

      const result = await sut.listAll();

      expect(result).toEqual(specialCharsMilitaryList);
      expect(result[0].name).toBe("José da Silva Júnior");
      expect(result[1].name).toBe("Maria Conceição dos Santos");
    });

    it("should maintain data consistency", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockMilitaryList);

      const result = await sut.listAll();

      result.forEach((military) => {
        expect(military.id).toBeDefined();
        expect(military.militaryRankId).toBeDefined();
        expect(military.militaryRank).toBeDefined();
        expect(military.militaryRank.id).toBe(military.militaryRankId);
        expect(military.rg).toBeDefined();
        expect(military.name).toBeDefined();
        expect(typeof military.id).toBe("string");
        expect(typeof military.militaryRankId).toBe("string");
        expect(typeof military.rg).toBe("number");
        expect(typeof military.name).toBe("string");
      });
    });

    it("should return the exact array reference from repository", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockMilitaryList);

      const result = await sut.listAll();

      expect(result).toBe(mockMilitaryList);
    });

    it("should not modify repository response", async () => {
      const originalList = [...mockMilitaryList];
      mockedRepository.listAll.mockResolvedValueOnce(mockMilitaryList);

      await sut.listAll();

      expect(mockMilitaryList).toEqual(originalList);
    });

    it("should handle different military rank orders", async () => {
      const rankedMilitaryList: MilitaryOutputDTO[] = [
        {
          ...mockMilitaryList[0],
          militaryRank: { ...mockMilitaryList[0].militaryRank, order: 1 },
        },
        {
          ...mockMilitaryList[1],
          militaryRank: { ...mockMilitaryList[1].militaryRank, order: 20 },
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(rankedMilitaryList);

      const result = await sut.listAll();

      expect(result[0].militaryRank.order).toBe(1);
      expect(result[1].militaryRank.order).toBe(20);
    });

    it("should handle null values gracefully", async () => {
      mockedRepository.listAll.mockResolvedValueOnce([]);

      const result = await sut.listAll();

      expect(result).toEqual([]);
    });
  });
});
