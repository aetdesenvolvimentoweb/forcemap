import { mockListAllUserService, mockLogger } from "../../../../../__mocks__";
import { EntityNotFoundError } from "../../../../../src/application/errors";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";
import { ListAllUserController } from "../../../../../src/presentation/controllers";

describe("ListAllUserController", () => {
  let sut: ListAllUserController;
  let mockedService = mockListAllUserService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllUserController({
      listAllUserService: mockedService,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const mockUserList: UserOutputDTO[] = [
      {
        id: "user-1",
        role: UserRole.ADMIN,
        military: {
          id: "military-1",
          militaryRank: { id: "rank-1", abbreviation: "CEL", order: 10 },
          rg: 11111111,
          name: "João da Silva",
        },
      },
      {
        id: "user-2",
        role: UserRole.CHEFE,
        military: {
          id: "military-2",
          militaryRank: { id: "rank-2", abbreviation: "MAJ", order: 8 },
          rg: 22222222,
          name: "Maria dos Santos",
        },
      },
      {
        id: "user-3",
        role: UserRole.BOMBEIRO,
        military: {
          id: "military-3",
          militaryRank: { id: "rank-3", abbreviation: "TEN", order: 6 },
          rg: 33333333,
          name: "Carlos Alberto",
        },
      },
    ];

    it("should list all users successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockUserList },
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para listar todos os usuários",
      );
    });

    it("should log info when user list is retrieved successfully", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuários listados com sucesso",
        {
          count: mockUserList.length,
        },
      );
    });

    it("should return empty array when no users found", async () => {
      const emptyList: UserOutputDTO[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: emptyList },
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log correct count when no users found", async () => {
      const emptyList: UserOutputDTO[] = [];
      mockedService.listAll.mockResolvedValueOnce(emptyList);

      await sut.handle();

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuários listados com sucesso",
        {
          count: 0,
        },
      );
    });

    it("should handle service errors and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      const result = await sut.handle();

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.listAll).toHaveBeenCalledTimes(1);
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.listAll.mockRejectedValueOnce(serviceError);

      await sut.handle();

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao listar usuários",
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
      const largeUserList: UserOutputDTO[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `user-${index + 1}`,
          role: UserRole.BOMBEIRO,
          military: {
            id: `military-${index + 1}`,
            militaryRank: {
              id: `rank-${index + 1}`,
              abbreviation: "TEN",
              order: index + 1,
            },
            rg: index + 1,
            name: `Usuário ${index + 1}`,
          },
        }),
      );

      mockedService.listAll.mockResolvedValueOnce(largeUserList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: largeUserList },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuários listados com sucesso",
        {
          count: 1000,
        },
      );
    });

    it("should handle concurrent requests independently", async () => {
      const list1: UserOutputDTO[] = [mockUserList[0]];
      const list2: UserOutputDTO[] = [mockUserList[1]];

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
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      const result = await sut.handle();

      expect(result.body).toEqual({ data: mockUserList });
      expect(Array.isArray(result.body?.data)).toBe(true);

      const userData = result.body?.data as UserOutputDTO[];
      userData.forEach((user: UserOutputDTO) => {
        expect(user).toHaveProperty("id");
        expect(user).toHaveProperty("role");
        expect(user).toHaveProperty("military");
        expect(user.military).toHaveProperty("id");
        expect(user.military).toHaveProperty("militaryRank");
        expect(user.military).toHaveProperty("rg");
        expect(user.military).toHaveProperty("name");
        expect(typeof user.id).toBe("string");
        expect(typeof user.role).toBe("string");
        expect(typeof user.military).toBe("object");
        expect(typeof user.military.id).toBe("string");
        expect(typeof user.military.militaryRank).toBe("object");
        expect(typeof user.military.rg).toBe("number");
        expect(typeof user.military.name).toBe("string");
      });
    });

    it("should not modify the service response", async () => {
      const originalList = [...mockUserList];
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      await sut.handle();

      expect(mockUserList).toEqual(originalList);
    });

    it("should handle users with different roles correctly", async () => {
      const mixedRolesList: UserOutputDTO[] = [
        {
          ...mockUserList[0],
          role: UserRole.ADMIN,
        },
        {
          ...mockUserList[1],
          role: UserRole.CHEFE,
        },
        {
          ...mockUserList[2],
          role: UserRole.BOMBEIRO,
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(mixedRolesList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mixedRolesList },
      });

      const userData = result.body?.data as UserOutputDTO[];
      expect(userData[0].role).toBe(UserRole.ADMIN);
      expect(userData[1].role).toBe(UserRole.CHEFE);
      expect(userData[2].role).toBe(UserRole.BOMBEIRO);
    });

    it("should handle users with complete military information", async () => {
      const usersWithCompleteInfo: UserOutputDTO[] = [
        {
          id: "user-complete-1",
          role: UserRole.ADMIN,
          military: {
            id: "military-complete-1",
            militaryRank: {
              id: "rank-complete-1",
              abbreviation: "CEL",
              order: 10,
            },
            rg: 12345678,
            name: "João da Silva Santos",
          },
        },
        {
          id: "user-complete-2",
          role: UserRole.CHEFE,
          military: {
            id: "military-complete-2",
            militaryRank: {
              id: "rank-complete-2",
              abbreviation: "TEN",
              order: 6,
            },
            rg: 87654321,
            name: "Maria dos Santos Silva",
          },
        },
      ];

      mockedService.listAll.mockResolvedValueOnce(usersWithCompleteInfo);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: usersWithCompleteInfo },
      });

      const userData = result.body?.data as UserOutputDTO[];
      expect(userData[0].military.name).toBe("João da Silva Santos");
      expect(userData[0].military.militaryRank.abbreviation).toBe("CEL");
      expect(userData[1].military.name).toBe("Maria dos Santos Silva");
      expect(userData[1].military.militaryRank.abbreviation).toBe("TEN");
    });

    it("should maintain consistent response structure for different list sizes", async () => {
      const singleUserList: UserOutputDTO[] = [mockUserList[0]];
      mockedService.listAll.mockResolvedValueOnce(singleUserList);

      const result = await sut.handle();

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data");
      expect(Array.isArray(result.body?.data)).toBe(true);
      expect((result.body?.data as UserOutputDTO[]).length).toBe(1);
    });

    it("should handle performance with realistic user count", async () => {
      const realisticUserList: UserOutputDTO[] = Array.from(
        { length: 50 },
        (_, index) => ({
          id: `user-realistic-${index + 1}`,
          role:
            index % 3 === 0
              ? UserRole.ADMIN
              : index % 2 === 0
                ? UserRole.CHEFE
                : UserRole.BOMBEIRO,
          military: {
            id: `military-realistic-${index + 1}`,
            militaryRank: {
              id: `rank-realistic-${index + 1}`,
              abbreviation: index % 2 === 0 ? "MAJ" : "CAP",
              order: (index % 10) + 1,
            },
            rg: 10000000 + index,
            name: `Usuário Realista ${index + 1}`,
          },
        }),
      );

      mockedService.listAll.mockResolvedValueOnce(realisticUserList);

      const result = await sut.handle();

      expect(result).toEqual({
        statusCode: 200,
        body: { data: realisticUserList },
      });
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Usuários listados com sucesso",
        {
          count: 50,
        },
      );
    });

    it("should handle role enumeration validation", async () => {
      mockedService.listAll.mockResolvedValueOnce(mockUserList);

      const result = await sut.handle();

      const userData = result.body?.data as UserOutputDTO[];
      userData.forEach((user) => {
        expect(Object.values(UserRole)).toContain(user.role);
      });
    });
  });
});
