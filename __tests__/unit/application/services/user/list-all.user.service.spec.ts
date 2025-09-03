import { mockUserRepository } from "../../../../../__mocks__";
import { ListAllUserService } from "../../../../../src/application/services";
import { UserOutputDTO } from "../../../../../src/domain/dtos";
import { UserRole } from "../../../../../src/domain/entities";

describe("ListAllUserService", () => {
  let sut: ListAllUserService;
  let mockedRepository = mockUserRepository();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new ListAllUserService({
      userRepository: mockedRepository,
    });
  });

  describe("listAll", () => {
    const mockUsers: UserOutputDTO[] = [
      {
        id: "user-1",
        role: UserRole.ADMIN,
        military: {
          id: "military-1",
          name: "Admin User",
          rg: 1111,
          militaryRankId: "rank-1",
          militaryRank: {
            id: "rank-1",
            abbreviation: "CEL",
            order: 10,
          },
        },
      },
      {
        id: "user-2",
        role: UserRole.CHEFE,
        military: {
          id: "military-2",
          name: "Chef User",
          rg: 2222,
          militaryRankId: "rank-2",
          militaryRank: {
            id: "rank-2",
            abbreviation: "MAJ",
            order: 8,
          },
        },
      },
      {
        id: "user-3",
        role: UserRole.BOMBEIRO,
        military: {
          id: "military-3",
          name: "Firefighter User",
          rg: 3333,
          militaryRankId: "rank-3",
          militaryRank: {
            id: "rank-3",
            abbreviation: "SD",
            order: 1,
          },
        },
      },
    ];

    it("should return all users successfully", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockUsers);

      const result = await sut.listAll();

      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(3);
    });

    it("should return empty array when no users exist", async () => {
      mockedRepository.listAll.mockResolvedValueOnce([]);

      const result = await sut.listAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should call repository listAll exactly once", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(mockUsers);

      await sut.listAll();

      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
      expect(mockedRepository.listAll).toHaveBeenCalledWith();
    });

    it("should throw error when repository throws", async () => {
      const repositoryError = new Error("Database connection failed");
      mockedRepository.listAll.mockRejectedValueOnce(repositoryError);

      await expect(sut.listAll()).rejects.toThrow(repositoryError);

      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should return users with different roles", async () => {
      const usersWithAllRoles: UserOutputDTO[] = Object.values(UserRole).map(
        (role, index) => ({
          id: `user-${index + 1}`,
          role,
          military: {
            id: `military-${index + 1}`,
            name: `User ${role}`,
            rg: 1000 + index,
            militaryRankId: `rank-${index + 1}`,
            militaryRank: {
              id: `rank-${index + 1}`,
              abbreviation: "TEST",
              order: index + 1,
            },
          },
        }),
      );

      mockedRepository.listAll.mockResolvedValueOnce(usersWithAllRoles);

      const result = await sut.listAll();

      expect(result).toEqual(usersWithAllRoles);
      expect(result).toHaveLength(Object.values(UserRole).length);

      Object.values(UserRole).forEach((role, index) => {
        expect(result[index].role).toBe(role);
      });
    });

    it("should handle large number of users", async () => {
      const largeUserList: UserOutputDTO[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          id: `user-${index + 1}`,
          role: UserRole.BOMBEIRO,
          military: {
            id: `military-${index + 1}`,
            name: `User ${index + 1}`,
            rg: 1000 + index,
            militaryRankId: `rank-${index + 1}`,
            militaryRank: {
              id: `rank-${index + 1}`,
              abbreviation: "SD",
              order: 1,
            },
          },
        }),
      );

      mockedRepository.listAll.mockResolvedValueOnce(largeUserList);

      const result = await sut.listAll();

      expect(result).toEqual(largeUserList);
      expect(result).toHaveLength(1000);
      expect(result[0].id).toBe("user-1");
      expect(result[999].id).toBe("user-1000");
    });

    it("should preserve user data structure integrity", async () => {
      const complexUsers: UserOutputDTO[] = [
        {
          id: "complex-user-1",
          role: UserRole.ADMIN,
          military: {
            id: "complex-military-1",
            name: "Complex User Name with Accents: João",
            rg: 123456,
            militaryRankId: "complex-rank-1",
            militaryRank: {
              id: "complex-rank-1",
              abbreviation: "GEN",
              order: 15,
            },
          },
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(complexUsers);

      const result = await sut.listAll();

      expect(result).toEqual(complexUsers);
      expect(result[0].military.name).toBe(
        "Complex User Name with Accents: João",
      );
      expect(result[0]).toBe(complexUsers[0]); // Same reference
    });

    it("should handle async repository response", async () => {
      let resolveRepository: (users: UserOutputDTO[]) => void;
      const repositoryPromise = new Promise<UserOutputDTO[]>((resolve) => {
        resolveRepository = resolve;
      });

      mockedRepository.listAll.mockReturnValueOnce(repositoryPromise);

      const listPromise = sut.listAll();

      // Repository should not complete immediately
      let isResolved = false;
      listPromise.then(() => {
        isResolved = true;
      });

      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(isResolved).toBe(false);

      // Now resolve the repository
      resolveRepository!(mockUsers);

      const result = await listPromise;
      expect(result).toEqual(mockUsers);
    });

    it("should handle multiple consecutive calls", async () => {
      const firstCall = [mockUsers[0]];
      const secondCall = [mockUsers[1], mockUsers[2]];
      const thirdCall = mockUsers;

      mockedRepository.listAll
        .mockResolvedValueOnce(firstCall)
        .mockResolvedValueOnce(secondCall)
        .mockResolvedValueOnce(thirdCall);

      const result1 = await sut.listAll();
      const result2 = await sut.listAll();
      const result3 = await sut.listAll();

      expect(result1).toEqual(firstCall);
      expect(result2).toEqual(secondCall);
      expect(result3).toEqual(thirdCall);

      expect(mockedRepository.listAll).toHaveBeenCalledTimes(3);
    });

    it("should handle null values in user array", async () => {
      const usersWithNull = [mockUsers[0], null, mockUsers[1]] as any;
      mockedRepository.listAll.mockResolvedValueOnce(usersWithNull);

      const result = await sut.listAll();

      expect(result).toEqual(usersWithNull);
      expect(result[1]).toBeNull();
    });

    it("should handle undefined repository response", async () => {
      mockedRepository.listAll.mockResolvedValueOnce(undefined as any);

      const result = await sut.listAll();

      expect(result).toBeUndefined();
    });

    it("should handle repository timeout", async () => {
      const timeoutError = new Error("Request timeout");
      mockedRepository.listAll.mockRejectedValueOnce(timeoutError);

      await expect(sut.listAll()).rejects.toThrow("Request timeout");
      expect(mockedRepository.listAll).toHaveBeenCalledTimes(1);
    });

    it("should handle users with minimal data", async () => {
      const minimalUsers: UserOutputDTO[] = [
        {
          id: "minimal-1",
          role: UserRole.BOMBEIRO,
          military: {
            id: "minimal-military",
            name: "",
            rg: 0,
            militaryRankId: "minimal-rank",
            militaryRank: {
              id: "minimal-rank",
              abbreviation: "",
              order: 0,
            },
          },
        },
      ];

      mockedRepository.listAll.mockResolvedValueOnce(minimalUsers);

      const result = await sut.listAll();

      expect(result).toEqual(minimalUsers);
      expect(result[0].military.name).toBe("");
      expect(result[0].military.rg).toBe(0);
    });
  });
});
