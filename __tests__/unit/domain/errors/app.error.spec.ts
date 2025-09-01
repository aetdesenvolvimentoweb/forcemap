import { AppError } from "../../../../src/domain/errors/app.error";

describe("AppError", () => {
  describe("constructor", () => {
    it("should create AppError with message and default statusCode", () => {
      const message = "Something went wrong";
      const error = new AppError(message);

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });

    it("should create AppError with custom statusCode", () => {
      const message = "Unauthorized access";
      const statusCode = 401;
      const error = new AppError(message, statusCode);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.name).toBe("AppError");
    });

    it("should create AppError with empty message", () => {
      const error = new AppError("");

      expect(error.message).toBe("");
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });

    it("should create AppError with zero statusCode", () => {
      const message = "Test message";
      const error = new AppError(message, 0);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(0);
    });

    it("should create AppError with negative statusCode", () => {
      const message = "Test message";
      const error = new AppError(message, -1);

      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(-1);
    });

    it("should have statusCode as readonly property", () => {
      const error = new AppError("test");

      // TypeScript should prevent this, but let's verify at runtime
      expect(() => {
        (error as any).statusCode = 999;
      }).not.toThrow();

      // In JavaScript, the readonly modifier is only enforced by TypeScript
      // The property is still writable at runtime
      const descriptor = Object.getOwnPropertyDescriptor(error, "statusCode");
      expect(descriptor?.writable).toBe(true);
    });
  });

  describe("inheritance", () => {
    it("should be throwable like a regular Error", () => {
      const message = "Test error";
      const statusCode = 422;

      expect(() => {
        throw new AppError(message, statusCode);
      }).toThrow(AppError);

      expect(() => {
        throw new AppError(message, statusCode);
      }).toThrow(message);
    });

    it("should work with try-catch blocks", () => {
      const message = "Caught error";
      const statusCode = 500;
      let caughtError: AppError | null = null;

      try {
        throw new AppError(message, statusCode);
      } catch (error) {
        caughtError = error as AppError;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError).toBeInstanceOf(AppError);
      expect(caughtError?.message).toBe(message);
      expect(caughtError?.statusCode).toBe(statusCode);
    });

    it("should have proper prototype chain", () => {
      const error = new AppError("test");

      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
    });
  });

  describe("stack trace", () => {
    it("should have a stack trace", () => {
      const error = new AppError("test");

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      if (error.stack) {
        expect(error.stack).toContain("AppError");
      }
    });

    it("should handle captureStackTrace when available", () => {
      // Mock Error.captureStackTrace to verify it's called
      const originalCaptureStackTrace = Error.captureStackTrace;
      const mockCaptureStackTrace = jest.fn();

      Error.captureStackTrace = mockCaptureStackTrace;

      try {
        const error = new AppError("test");

        expect(mockCaptureStackTrace).toHaveBeenCalledWith(error, AppError);
        expect(mockCaptureStackTrace).toHaveBeenCalledTimes(1);
      } finally {
        // Restore original function
        Error.captureStackTrace = originalCaptureStackTrace;
      }
    });

    it("should work when captureStackTrace is not available", () => {
      // Mock environment where captureStackTrace doesn't exist
      const originalCaptureStackTrace = Error.captureStackTrace;
      delete (Error as any).captureStackTrace;

      try {
        const error = new AppError("test");

        // Should not throw and should still have basic properties
        expect(error.message).toBe("test");
        expect(error.statusCode).toBe(400);
        expect(error.name).toBe("AppError");
      } finally {
        // Restore original function
        Error.captureStackTrace = originalCaptureStackTrace;
      }
    });
  });

  describe("real-world scenarios", () => {
    it("should work with different HTTP status codes", () => {
      const scenarios = [
        { message: "Bad Request", statusCode: 400 },
        { message: "Unauthorized", statusCode: 401 },
        { message: "Forbidden", statusCode: 403 },
        { message: "Not Found", statusCode: 404 },
        { message: "Unprocessable Entity", statusCode: 422 },
        { message: "Internal Server Error", statusCode: 500 },
      ];

      scenarios.forEach(({ message, statusCode }) => {
        const error = new AppError(message, statusCode);
        expect(error.message).toBe(message);
        expect(error.statusCode).toBe(statusCode);
        expect(error.name).toBe("AppError");
      });
    });

    it("should maintain error information through promise rejections", async () => {
      const message = "Async error";
      const statusCode = 503;

      await expect(
        Promise.reject(new AppError(message, statusCode)),
      ).rejects.toMatchObject({
        message,
        statusCode,
        name: "AppError",
      });
    });

    it("should work with JSON serialization", () => {
      const message = "Serializable error";
      const statusCode = 400;
      const error = new AppError(message, statusCode);

      // Convert to JSON and back
      const serialized = JSON.stringify(error);
      const parsed = JSON.parse(serialized);

      // Error objects don't serialize message/name by default in JSON.stringify
      // But we can still access the properties
      expect(error.message).toBe(message);
      expect(error.name).toBe("AppError");
      expect(error.statusCode).toBe(statusCode);

      // The serialized object will have the statusCode since it's an own property
      expect(parsed.statusCode).toBe(statusCode);
    });
  });

  describe("edge cases", () => {
    it("should handle very long messages", () => {
      const longMessage = "x".repeat(10000);
      const error = new AppError(longMessage);

      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(10000);
    });

    it("should handle special characters in message", () => {
      const specialMessage = "Error with émojis 🚨 and spéciàl çhars";
      const error = new AppError(specialMessage);

      expect(error.message).toBe(specialMessage);
    });

    it("should handle extreme statusCode values", () => {
      const extremeCases = [
        { statusCode: Number.MAX_SAFE_INTEGER },
        { statusCode: Number.MIN_SAFE_INTEGER },
        { statusCode: 999999 },
      ];

      extremeCases.forEach(({ statusCode }) => {
        const error = new AppError("test", statusCode);
        expect(error.statusCode).toBe(statusCode);
      });
    });
  });
});
