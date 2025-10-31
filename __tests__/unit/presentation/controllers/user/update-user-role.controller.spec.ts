import {
  mockLogger,
  mockUpdateUserRoleService,
} from "../../../../../__mocks__";
import {
  EntityNotFoundError,
  InvalidParamError,
} from "../../../../../src/application/errors";
import { UserRole } from "../../../../../src/domain/entities";
import { UpdateUserRoleController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

describe("UpdateUserRoleController", () => {
  let sut: UpdateUserRoleController;
  let mockedService: ReturnType<typeof mockUpdateUserRoleService>;
  let mockedLogger: ReturnType<typeof mockLogger>;

  beforeEach(() => {
    mockedService = mockUpdateUserRoleService();
    mockedLogger = mockLogger();
    sut = new UpdateUserRoleController({
      updateUserRoleService: mockedService,
      logger: mockedLogger,
    });
  });

  const defaultAdminUser = {
    userId: "admin-user",
    sessionId: "session-123",
    role: "Admin" as const,
    militaryId: "military-admin",
  };

  describe("handle", () => {
    const validBody = {
      role: UserRole.ADMIN,
    };

    const validRequest: HttpRequest<{ role: UserRole }> = {
      params: { id: "user-123" },
      body: validBody,
      user: {
        userId: "admin-user",
        sessionId: "session-123",
        role: "Admin",
        militaryId: "military-admin",
      },
    };

    it("should update user role successfully with valid data", async () => {
      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 204,
      });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-123",
        UserRole.ADMIN,
      );
      expect(mockedService.updateUserRole).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving request", async () => {
      mockedService.updateUserRole.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para atualizar função do usuário",
        {
          params: validRequest.params,
          body: {
            role: UserRole.ADMIN,
          },
        },
      );
    });

    it("should log info when user role is updated successfully", async () => {
      mockedService.updateUserRole.mockResolvedValueOnce();

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Função do usuário atualizada com sucesso",
        {
          id: "user-123",
          role: UserRole.ADMIN,
          updatedBy: "admin-user",
        },
      );
    });

    it("should return empty request error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<{ role: UserRole }> = {
        body: validBody,
      };

      const result = await sut.handle(requestWithoutId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-123" },
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should return empty request error when both id and body are missing", async () => {
      const emptyRequest: HttpRequest<{ role: UserRole }> = {};

      const result = await sut.handle(emptyRequest);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should return empty request error when params is null", async () => {
      const requestWithNullParams: HttpRequest<{ role: UserRole }> = {
        params: null as any,
        body: validBody,
      };

      const result = await sut.handle(requestWithNullParams);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-123" },
        body: null as any,
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should log error when id param is missing", async () => {
      const requestWithoutId: HttpRequest<{ role: UserRole }> = {
        body: validBody,
      };

      await sut.handle(requestWithoutId);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Campo obrigatório não fornecido: id",
      );
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-123" },
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle not found error and return appropriate response", async () => {
      const serviceError = new EntityNotFoundError("User");
      mockedService.updateUserRole.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-123",
        UserRole.ADMIN,
      );
    });

    it("should handle invalid role error and return appropriate response", async () => {
      const serviceError = new InvalidParamError("role", "função inválida");
      mockedService.updateUserRole.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-123",
        UserRole.ADMIN,
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new InvalidParamError("role", "função inválida");
      mockedService.updateUserRole.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao atualizar função do usuário",
        {
          error: serviceError,
          requestData: { id: "user-123", role: UserRole.ADMIN },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedService.updateUserRole.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-123",
        UserRole.ADMIN,
      );
    });

    it("should handle ADMIN role update correctly", async () => {
      const adminRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-456" },
        body: { role: UserRole.ADMIN },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(adminRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-456",
        UserRole.ADMIN,
      );
    });

    it("should handle CHEFE role update correctly", async () => {
      const chefeRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-789" },
        body: { role: UserRole.CHEFE },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(chefeRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-789",
        UserRole.CHEFE,
      );
    });

    it("should handle BOMBEIRO role update correctly", async () => {
      const bombeiroRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-101" },
        body: { role: UserRole.BOMBEIRO },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(bombeiroRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-101",
        UserRole.BOMBEIRO,
      );
    });

    it("should handle concurrent update requests independently", async () => {
      const request1: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-1" },
        body: { role: UserRole.ADMIN },
        user: defaultAdminUser,
      };
      const request2: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-2" },
        body: { role: UserRole.CHEFE },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValue();

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({ statusCode: 204 });
      expect(result2).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledTimes(2);
      expect(mockedService.updateUserRole).toHaveBeenNthCalledWith(
        1,
        "user-1",
        UserRole.ADMIN,
      );
      expect(mockedService.updateUserRole).toHaveBeenNthCalledWith(
        2,
        "user-2",
        UserRole.CHEFE,
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-complex" },
        body: { role: UserRole.BOMBEIRO },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      await sut.handle(complexRequest);

      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-complex",
        UserRole.BOMBEIRO,
      );

      const [calledId, calledRole] = mockedService.updateUserRole.mock.calls[0];
      expect(typeof calledId).toBe("string");
      expect(typeof calledRole).toBe("string");
      expect(Object.values(UserRole)).toContain(calledRole);
    });

    it("should not modify the original request data", async () => {
      const originalParams = { id: "user-123" };
      const originalBody = { role: UserRole.CHEFE };

      const request: HttpRequest<{ role: UserRole }> = {
        params: { ...originalParams },
        body: { ...originalBody },
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      await sut.handle(request);

      expect(request.params).toEqual(originalParams);
      expect(request.body).toEqual(originalBody);
    });

    it("should handle special characters in id correctly", async () => {
      const specialIdRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-123-àáâã" },
        body: { role: UserRole.ADMIN },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(specialIdRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-123-àáâã",
        UserRole.ADMIN,
      );
    });

    it("should handle empty string id as invalid", async () => {
      const requestWithEmptyId: HttpRequest<{ role: UserRole }> = {
        params: { id: "" },
        body: validBody,
      };

      const result = await sut.handle(requestWithEmptyId);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
    });

    it("should handle role promotion scenarios", async () => {
      const promotionRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-promotion" },
        body: { role: UserRole.ADMIN },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(promotionRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-promotion",
        UserRole.ADMIN,
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Função do usuário atualizada com sucesso",
        {
          id: "user-promotion",
          role: UserRole.ADMIN,
          updatedBy: "admin-user",
        },
      );
    });

    it("should handle role demotion scenarios", async () => {
      const demotionRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-demotion" },
        body: { role: UserRole.BOMBEIRO },
        user: defaultAdminUser,
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(demotionRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-demotion",
        UserRole.BOMBEIRO,
      );

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Função do usuário atualizada com sucesso",
        {
          id: "user-demotion",
          role: UserRole.BOMBEIRO,
          updatedBy: "admin-user",
        },
      );
    });

    it("should handle permission validation errors", async () => {
      const serviceError = new InvalidParamError(
        "permission",
        "Usuário não tem permissão para alterar função",
      );
      mockedService.updateUserRole.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should handle self role change restrictions", async () => {
      const serviceError = new InvalidParamError(
        "role",
        "Usuário não pode alterar sua própria função",
      );
      mockedService.updateUserRole.mockRejectedValueOnce(serviceError);

      const result = await sut.handle({
        params: { id: "user-self" },
        body: { role: UserRole.ADMIN },
        user: defaultAdminUser,
      });

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
    });

    it("should maintain role enumeration consistency", async () => {
      const allRoleRequests = [
        {
          params: { id: "user-admin" },
          body: { role: UserRole.ADMIN },
          user: defaultAdminUser,
        },
        {
          params: { id: "user-chefe" },
          body: { role: UserRole.CHEFE },
          user: defaultAdminUser,
        },
        {
          params: { id: "user-bombeiro" },
          body: { role: UserRole.BOMBEIRO },
          user: defaultAdminUser,
        },
      ];

      mockedService.updateUserRole.mockResolvedValue();

      for (const request of allRoleRequests) {
        await sut.handle(request);
      }

      expect(mockedService.updateUserRole).toHaveBeenCalledTimes(3);
      expect(mockedService.updateUserRole).toHaveBeenNthCalledWith(
        1,
        "user-admin",
        UserRole.ADMIN,
      );
      expect(mockedService.updateUserRole).toHaveBeenNthCalledWith(
        2,
        "user-chefe",
        UserRole.CHEFE,
      );
      expect(mockedService.updateUserRole).toHaveBeenNthCalledWith(
        3,
        "user-bombeiro",
        UserRole.BOMBEIRO,
      );
    });

    it("should handle numeric string ids correctly", async () => {
      const numericIdRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "12345" },
        body: { role: UserRole.CHEFE },
        user: {
          userId: "admin-user",
          sessionId: "session-123",
          role: "Admin",
          militaryId: "military-admin",
        },
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(numericIdRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "12345",
        UserRole.CHEFE,
      );
    });
  });

  describe("authorization", () => {
    it("should return forbidden when user is not authenticated", async () => {
      const requestWithoutAuth: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-123" },
        body: { role: UserRole.ADMIN },
      };

      const result = await sut.handle(requestWithoutAuth);

      expect(result).toEqual({
        statusCode: 403,
        body: { error: "Usuário não autenticado" },
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Tentativa de atualizar função sem autenticação",
        { id: "user-123" },
      );
    });

    it("should allow Admin to promote user to Admin", async () => {
      const adminRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-456" },
        body: { role: UserRole.ADMIN },
        user: {
          userId: "admin-123",
          sessionId: "session-admin",
          role: "Admin",
          militaryId: "military-admin",
        },
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(adminRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-456",
        UserRole.ADMIN,
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Função do usuário atualizada com sucesso",
        {
          id: "user-456",
          role: UserRole.ADMIN,
          updatedBy: "admin-123",
        },
      );
    });

    it("should prevent Chefe from promoting user to Admin", async () => {
      const chefeRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-789" },
        body: { role: UserRole.ADMIN },
        user: {
          userId: "chefe-123",
          sessionId: "session-chefe",
          role: "Chefe",
          militaryId: "military-chefe",
        },
      };

      const result = await sut.handle(chefeRequest);

      expect(result).toEqual({
        statusCode: 403,
        body: {
          error:
            "Chefes não podem promover usuários para Admin. Apenas Admin pode criar outros Admins.",
        },
      });
      expect(mockedService.updateUserRole).not.toHaveBeenCalled();
      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Chefe tentou promover usuário para Admin (escalação de privilégios bloqueada)",
        {
          requestingUserId: "chefe-123",
          requestingUserRole: "Chefe",
          targetUserId: "user-789",
          targetRole: UserRole.ADMIN,
        },
      );
    });

    it("should allow Chefe to promote user to Chefe", async () => {
      const chefeRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "user-999" },
        body: { role: UserRole.CHEFE },
        user: {
          userId: "chefe-123",
          sessionId: "session-chefe",
          role: "Chefe",
          militaryId: "military-chefe",
        },
      };

      mockedService.updateUserRole.mockResolvedValueOnce();

      const result = await sut.handle(chefeRequest);

      expect(result).toEqual({ statusCode: 204 });
      expect(mockedService.updateUserRole).toHaveBeenCalledWith(
        "user-999",
        UserRole.CHEFE,
      );
    });

    it("should allow Chefe to change user to any non-Admin role", async () => {
      const roles = [UserRole.CHEFE, UserRole.BOMBEIRO, UserRole.ACA];

      for (const role of roles) {
        jest.clearAllMocks();

        const chefeRequest: HttpRequest<{ role: UserRole }> = {
          params: { id: `user-${role}` },
          body: { role },
          user: {
            userId: "chefe-123",
            sessionId: "session-chefe",
            role: "Chefe",
            militaryId: "military-chefe",
          },
        };

        mockedService.updateUserRole.mockResolvedValueOnce();

        const result = await sut.handle(chefeRequest);

        expect(result).toEqual({ statusCode: 204 });
        expect(mockedService.updateUserRole).toHaveBeenCalledWith(
          `user-${role}`,
          role,
        );
      }
    });

    it("should allow Admin to change user to any role", async () => {
      const roles = [
        UserRole.ADMIN,
        UserRole.CHEFE,
        UserRole.BOMBEIRO,
        UserRole.ACA,
      ];

      for (const role of roles) {
        jest.clearAllMocks();

        const adminRequest: HttpRequest<{ role: UserRole }> = {
          params: { id: `user-${role}` },
          body: { role },
          user: {
            userId: "admin-123",
            sessionId: "session-admin",
            role: "Admin",
            militaryId: "military-admin",
          },
        };

        mockedService.updateUserRole.mockResolvedValueOnce();

        const result = await sut.handle(adminRequest);

        expect(result).toEqual({ statusCode: 204 });
        expect(mockedService.updateUserRole).toHaveBeenCalledWith(
          `user-${role}`,
          role,
        );
      }
    });

    it("should log escalation attempt when Chefe tries to create Admin", async () => {
      const chefeRequest: HttpRequest<{ role: UserRole }> = {
        params: { id: "target-user" },
        body: { role: UserRole.ADMIN },
        user: {
          userId: "chefe-attempt",
          sessionId: "session-chefe",
          role: "Chefe",
          militaryId: "military-chefe",
        },
      };

      await sut.handle(chefeRequest);

      expect(mockedLogger.warn).toHaveBeenCalledWith(
        "Chefe tentou promover usuário para Admin (escalação de privilégios bloqueada)",
        {
          requestingUserId: "chefe-attempt",
          requestingUserRole: "Chefe",
          targetUserId: "target-user",
          targetRole: UserRole.ADMIN,
        },
      );
    });
  });
});
