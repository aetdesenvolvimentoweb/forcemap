import { mockAuthService, mockLogger } from "../../../../../__mocks__";
import {
  TooManyRequestsError,
  UnauthorizedError,
} from "../../../../../src/application/errors";
import {
  LoginInputDTO,
  LoginOutputDTO,
} from "../../../../../src/domain/dtos/auth";
import { UserRole } from "../../../../../src/domain/entities";
import { LoginController } from "../../../../../src/presentation/controllers";
import { HttpRequest } from "../../../../../src/presentation/protocols";

interface LoginHttpRequest extends HttpRequest<LoginInputDTO> {
  ip?: string;
  socket?: { remoteAddress?: string };
  headers?: { [key: string]: string | string[] | undefined };
}

describe("LoginController", () => {
  let sut: LoginController;
  let mockedAuthService = mockAuthService();
  let mockedLogger = mockLogger();

  beforeEach(() => {
    jest.clearAllMocks();
    sut = new LoginController({
      authService: mockedAuthService as any,
      logger: mockedLogger,
    });
  });

  describe("handle", () => {
    const validBody: LoginInputDTO = {
      rg: 12345678,
      password: "validPassword123",
      deviceInfo: "Test Device",
    };

    const mockLoginOutput: LoginOutputDTO = {
      accessToken: "mock.jwt.token",
      refreshToken: "mock.refresh.token",
      user: {
        id: "user-123",
        militaryId: "military-123",
        role: UserRole.ADMIN,
      },
      expiresIn: 900,
    };

    const validRequest: LoginHttpRequest = {
      body: validBody,
      ip: "192.168.1.1",
      headers: {
        "user-agent": "Test User Agent",
      },
    };

    it("should login successfully with valid credentials", async () => {
      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        statusCode: 200,
        body: { data: mockLoginOutput },
      });
      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
      expect(mockedAuthService.login).toHaveBeenCalledTimes(1);
    });

    it("should log info when receiving login request", async () => {
      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para login",
        {
          rg: validBody.rg,
          deviceInfo: validBody.deviceInfo,
          ip: "192.168.1.1",
        },
      );
    });

    it("should log info when login is successful", async () => {
      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(validRequest);

      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Login realizado com sucesso",
        {
          userId: mockLoginOutput.user.id,
          role: mockLoginOutput.user.role,
          ip: "192.168.1.1",
        },
      );
    });

    it("should use socket.remoteAddress when ip is not available", async () => {
      const requestWithSocket: LoginHttpRequest = {
        body: validBody,
        socket: { remoteAddress: "10.0.0.1" },
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(requestWithSocket);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "10.0.0.1",
        "Test User Agent",
      );
    });

    it("should use 'unknown' when no IP is available", async () => {
      const requestWithoutIP: LoginHttpRequest = {
        body: validBody,
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(requestWithoutIP);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "unknown",
        "Test User Agent",
      );
    });

    it("should use 'unknown' when no user-agent is available", async () => {
      const requestWithoutUserAgent: LoginHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(requestWithoutUserAgent);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "unknown",
      );
    });

    it("should handle request without deviceInfo", async () => {
      const bodyWithoutDevice: LoginInputDTO = {
        rg: 12345678,
        password: "validPassword123",
      };

      const requestWithoutDevice: LoginHttpRequest = {
        body: bodyWithoutDevice,
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(requestWithoutDevice);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        bodyWithoutDevice,
        "192.168.1.1",
        "Test User Agent",
      );
      expect(mockedLogger.info).toHaveBeenCalledWith(
        "Recebida requisição para login",
        {
          rg: bodyWithoutDevice.rg,
          deviceInfo: undefined,
          ip: "192.168.1.1",
        },
      );
    });

    it("should return empty request error when body is missing", async () => {
      const requestWithoutBody: LoginHttpRequest = {
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithoutBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.login).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is null", async () => {
      const requestWithNullBody: LoginHttpRequest = {
        body: null as any,
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithNullBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.login).not.toHaveBeenCalled();
    });

    it("should return empty request error when body is undefined", async () => {
      const requestWithUndefinedBody: LoginHttpRequest = {
        body: undefined,
        ip: "192.168.1.1",
      };

      const result = await sut.handle(requestWithUndefinedBody);

      expect(result).toEqual({
        body: { error: "Campos obrigatórios não foram preenchidos." },
        statusCode: 422,
      });
      expect(mockedAuthService.login).not.toHaveBeenCalled();
    });

    it("should log error when body is missing", async () => {
      const requestWithoutBody: LoginHttpRequest = {
        ip: "192.168.1.1",
      };

      await sut.handle(requestWithoutBody);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Body da requisição vazio ou inválido",
      );
    });

    it("should handle unauthorized error from auth service", async () => {
      const serviceError = new UnauthorizedError("Credenciais inválidas");
      mockedAuthService.login.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
    });

    it("should handle too many requests error from auth service", async () => {
      const serviceError = new TooManyRequestsError(
        "Muitas tentativas de login. Tente novamente em 5 minutos.",
      );
      mockedAuthService.login.mockRejectedValueOnce(serviceError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: serviceError.message },
        statusCode: serviceError.statusCode,
      });
      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
    });

    it("should log error when service throws exception", async () => {
      const serviceError = new UnauthorizedError("Credenciais inválidas");
      mockedAuthService.login.mockRejectedValueOnce(serviceError);

      await sut.handle(validRequest);

      expect(mockedLogger.error).toHaveBeenCalledWith(
        "Erro ao realizar login",
        {
          error: serviceError,
          requestData: { rg: validBody.rg },
        },
      );
    });

    it("should handle unknown errors and return server error", async () => {
      const unknownError = new Error("Database connection failed");
      mockedAuthService.login.mockRejectedValueOnce(unknownError);

      const result = await sut.handle(validRequest);

      expect(result).toEqual({
        body: { error: "Erro interno no servidor." },
        statusCode: 500,
      });
      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        "Test User Agent",
      );
    });

    it("should handle login with different user roles", async () => {
      const roles = [
        UserRole.ADMIN,
        UserRole.CHEFE,
        UserRole.ACA,
        UserRole.BOMBEIRO,
      ];

      for (const role of roles) {
        const loginOutput: LoginOutputDTO = {
          ...mockLoginOutput,
          user: { ...mockLoginOutput.user, role },
        };

        mockedAuthService.login.mockResolvedValueOnce(loginOutput);

        const result = await sut.handle(validRequest);

        expect(result).toEqual({
          statusCode: 200,
          body: { data: loginOutput },
        });
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Login realizado com sucesso",
          {
            userId: loginOutput.user.id,
            role: role,
            ip: "192.168.1.1",
          },
        );
      }
    });

    it("should handle complex user agent strings", async () => {
      const complexUserAgent =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

      const requestWithComplexUserAgent: LoginHttpRequest = {
        body: validBody,
        ip: "192.168.1.1",
        headers: {
          "user-agent": complexUserAgent,
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(requestWithComplexUserAgent);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        validBody,
        "192.168.1.1",
        complexUserAgent,
      );
    });

    it("should handle different RG formats", async () => {
      const differentRGs = [12345678, 87654321, 11111111, 99999999];

      for (const rg of differentRGs) {
        const bodyWithDifferentRG: LoginInputDTO = {
          ...validBody,
          rg,
        };

        const requestWithDifferentRG: LoginHttpRequest = {
          ...validRequest,
          body: bodyWithDifferentRG,
        };

        mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

        const result = await sut.handle(requestWithDifferentRG);

        expect(result.statusCode).toBe(200);
        expect(mockedAuthService.login).toHaveBeenCalledWith(
          bodyWithDifferentRG,
          "192.168.1.1",
          "Test User Agent",
        );
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Recebida requisição para login",
          {
            rg: rg,
            deviceInfo: validBody.deviceInfo,
            ip: "192.168.1.1",
          },
        );
      }
    });

    it("should handle concurrent login requests independently", async () => {
      const body1: LoginInputDTO = {
        rg: 11111111,
        password: "password1",
        deviceInfo: "Device 1",
      };
      const body2: LoginInputDTO = {
        rg: 22222222,
        password: "password2",
        deviceInfo: "Device 2",
      };

      const loginOutput1: LoginOutputDTO = {
        ...mockLoginOutput,
        user: { ...mockLoginOutput.user, id: "user-1" },
      };
      const loginOutput2: LoginOutputDTO = {
        ...mockLoginOutput,
        user: { ...mockLoginOutput.user, id: "user-2" },
      };

      const request1: LoginHttpRequest = {
        body: body1,
        ip: "192.168.1.1",
        headers: { "user-agent": "Agent 1" },
      };
      const request2: LoginHttpRequest = {
        body: body2,
        ip: "192.168.1.2",
        headers: { "user-agent": "Agent 2" },
      };

      mockedAuthService.login
        .mockResolvedValueOnce(loginOutput1)
        .mockResolvedValueOnce(loginOutput2);

      const [result1, result2] = await Promise.all([
        sut.handle(request1),
        sut.handle(request2),
      ]);

      expect(result1).toEqual({
        statusCode: 200,
        body: { data: loginOutput1 },
      });
      expect(result2).toEqual({
        statusCode: 200,
        body: { data: loginOutput2 },
      });
      expect(mockedAuthService.login).toHaveBeenCalledTimes(2);
      expect(mockedAuthService.login).toHaveBeenNthCalledWith(
        1,
        body1,
        "192.168.1.1",
        "Agent 1",
      );
      expect(mockedAuthService.login).toHaveBeenNthCalledWith(
        2,
        body2,
        "192.168.1.2",
        "Agent 2",
      );
    });

    it("should preserve request data structure integrity", async () => {
      const complexBody: LoginInputDTO = {
        rg: 99999999,
        password: "complexPassword123!@#",
        deviceInfo: "Complex Device Info",
      };

      const request: LoginHttpRequest = {
        body: complexBody,
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Complex User Agent",
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(request);

      expect(mockedAuthService.login).toHaveBeenCalledWith(
        complexBody,
        "192.168.1.1",
        "Complex User Agent",
      );

      const calledWith = mockedAuthService.login.mock.calls[0];
      expect(calledWith[0]).toHaveProperty("rg");
      expect(calledWith[0]).toHaveProperty("password");
      expect(calledWith[0]).toHaveProperty("deviceInfo");
      expect(typeof calledWith[0].rg).toBe("number");
      expect(typeof calledWith[0].password).toBe("string");
      expect(typeof calledWith[0].deviceInfo).toBe("string");
      expect(typeof calledWith[1]).toBe("string"); // IP address
      expect(typeof calledWith[2]).toBe("string"); // User agent
    });

    it("should not modify the original request body", async () => {
      const originalBody: LoginInputDTO = {
        rg: 12345678,
        password: "originalPassword",
        deviceInfo: "Original Device",
      };

      const request: LoginHttpRequest = {
        body: { ...originalBody },
        ip: "192.168.1.1",
        headers: {
          "user-agent": "Test User Agent",
        },
      };

      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      await sut.handle(request);

      expect(request.body).toEqual(originalBody);
    });

    it("should handle IP addresses with different formats", async () => {
      const ipAddresses = [
        "192.168.1.1",
        "10.0.0.1",
        "127.0.0.1",
        "::1",
        "2001:db8::1",
      ];

      for (const ip of ipAddresses) {
        const requestWithIP: LoginHttpRequest = {
          body: validBody,
          ip,
          headers: {
            "user-agent": "Test User Agent",
          },
        };

        mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

        await sut.handle(requestWithIP);

        expect(mockedAuthService.login).toHaveBeenCalledWith(
          validBody,
          ip,
          "Test User Agent",
        );
        expect(mockedLogger.info).toHaveBeenCalledWith(
          "Login realizado com sucesso",
          {
            userId: mockLoginOutput.user.id,
            role: mockLoginOutput.user.role,
            ip,
          },
        );
      }
    });

    it("should maintain consistent response structure", async () => {
      mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

      const result = await sut.handle(validRequest);

      expect(result).toHaveProperty("statusCode", 200);
      expect(result).toHaveProperty("body");
      expect(result.body).toHaveProperty("data");

      const loginData = result.body?.data as LoginOutputDTO;
      expect(loginData).toHaveProperty("accessToken");
      expect(loginData).toHaveProperty("refreshToken");
      expect(loginData).toHaveProperty("user");
      expect(loginData).toHaveProperty("expiresIn");
      expect(loginData.user).toHaveProperty("id");
      expect(loginData.user).toHaveProperty("militaryId");
      expect(loginData.user).toHaveProperty("role");
    });

    it("should handle different device info formats", async () => {
      const deviceInfos = [
        "Mobile Device",
        "Desktop Browser",
        "Mobile App v1.0",
        "React Native App",
        undefined,
        "",
      ];

      for (const deviceInfo of deviceInfos) {
        const bodyWithDeviceInfo: LoginInputDTO = {
          rg: 12345678,
          password: "validPassword123",
          deviceInfo,
        };

        const requestWithDeviceInfo: LoginHttpRequest = {
          body: bodyWithDeviceInfo,
          ip: "192.168.1.1",
          headers: {
            "user-agent": "Test User Agent",
          },
        };

        mockedAuthService.login.mockResolvedValueOnce(mockLoginOutput);

        await sut.handle(requestWithDeviceInfo);

        expect(mockedAuthService.login).toHaveBeenCalledWith(
          bodyWithDeviceInfo,
          "192.168.1.1",
          "Test User Agent",
        );
      }
    });
  });
});
