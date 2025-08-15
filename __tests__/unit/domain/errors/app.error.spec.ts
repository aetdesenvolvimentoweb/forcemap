import { AppError } from "@domain/errors";

interface SutTypes {
  sut: typeof AppError;
}

const makeSut = (): SutTypes => {
  const sut = AppError;

  return {
    sut,
  };
};

describe("AppError", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("constructor", () => {
    it("should create an AppError with message and default status code 400", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Test error message";

      // ACT
      const error = new sut(message);

      // ASSERT
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(400);
      expect(error.name).toBe("AppError");
    });

    it("should create an AppError with custom status code", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Not found error";
      const statusCode = 404;

      // ACT
      const error = new sut(message, statusCode);

      // ASSERT
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.name).toBe("AppError");
    });

    it("should create an AppError with status code 500", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Internal server error";
      const statusCode = 500;

      // ACT
      const error = new sut(message, statusCode);

      // ASSERT
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
    });

    it("should create an AppError with status code 401", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Unauthorized";
      const statusCode = 401;

      // ACT
      const error = new sut(message, statusCode);

      // ASSERT
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(401);
    });

    it("should create an AppError with status code 403", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Forbidden";
      const statusCode = 403;

      // ACT
      const error = new sut(message, statusCode);

      // ASSERT
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(403);
    });
  });

  describe("inheritance", () => {
    it("should be an instance of Error", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test message");

      // ASSERT
      expect(error).toBeInstanceOf(Error);
    });

    it("should be an instance of AppError", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test message");

      // ASSERT
      expect(error).toBeInstanceOf(AppError);
    });

    it("should have correct prototype chain", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test message");

      // ASSERT
      expect(Object.getPrototypeOf(error)).toBe(AppError.prototype);
      expect(Object.getPrototypeOf(AppError.prototype)).toBe(Error.prototype);
    });
  });

  describe("properties", () => {
    it("should have statusCode property", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Test error";
      const statusCode = 422;
      const error = new sut(message, statusCode);

      // ACT & ASSERT
      expect(error.statusCode).toBe(statusCode);
      expect(typeof error.statusCode).toBe("number");

      // Verify the property is accessible and has the correct value
      expect(error.statusCode).toEqual(statusCode);
    });

    it("should have correct name property", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test message");

      // ASSERT
      expect(error.name).toBe("AppError");
    });

    it("should preserve message property from Error class", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Custom error message";

      // ACT
      const error = new sut(message);

      // ASSERT
      expect(error.message).toBe(message);
    });
  });

  describe("stack trace", () => {
    it("should have stack trace", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test message");

      // ASSERT
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain("AppError");
    });

    it("should capture stack trace correctly", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Stack trace test";

      // ACT
      const error = new sut(message);

      // ASSERT
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe("string");
      expect(error.stack).toContain(message);
      expect(error.stack).toContain("AppError");
    });

    it("should handle environments without Error.captureStackTrace gracefully", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const originalCaptureStackTrace = Error.captureStackTrace;

      // Temporarily remove Error.captureStackTrace to simulate environments without it
      (Error as any).captureStackTrace = undefined;

      const message = "Test without captureStackTrace";
      const statusCode = 500;

      // ACT
      const error = new sut(message, statusCode);

      // ASSERT
      expect(error.message).toBe(message);
      expect(error.statusCode).toBe(statusCode);
      expect(error.name).toBe("AppError");
      expect(error.stack).toBeDefined(); // Stack should still exist from Error base class

      // CLEANUP
      Error.captureStackTrace = originalCaptureStackTrace;
    });
  });

  describe("error handling scenarios", () => {
    it("should work with try-catch blocks", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Test error";
      const statusCode = 400;

      // ACT & ASSERT
      expect(() => {
        throw new sut(message, statusCode);
      }).toThrow(sut);

      try {
        throw new sut(message, statusCode);
      } catch (error) {
        expect(error).toBeInstanceOf(sut);
        expect(error).toBeInstanceOf(Error);
        expect((error as AppError).message).toBe(message);
        expect((error as AppError).statusCode).toBe(statusCode);
      }
    });

    it("should work with Promise.reject", async () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Async error";
      const statusCode = 500;

      // ACT & ASSERT
      await expect(
        Promise.reject(new sut(message, statusCode)),
      ).rejects.toBeInstanceOf(sut);

      await expect(
        Promise.reject(new sut(message, statusCode)),
      ).rejects.toHaveProperty("statusCode", statusCode);
    });
  });

  describe("common HTTP status codes", () => {
    it("should handle Bad Request (400)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Bad Request", 400);

      // ASSERT
      expect(error.statusCode).toBe(400);
    });

    it("should handle Unauthorized (401)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Unauthorized", 401);

      // ASSERT
      expect(error.statusCode).toBe(401);
    });

    it("should handle Forbidden (403)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Forbidden", 403);

      // ASSERT
      expect(error.statusCode).toBe(403);
    });

    it("should handle Not Found (404)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Not Found", 404);

      // ASSERT
      expect(error.statusCode).toBe(404);
    });

    it("should handle Unprocessable Entity (422)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Unprocessable Entity", 422);

      // ASSERT
      expect(error.statusCode).toBe(422);
    });

    it("should handle Internal Server Error (500)", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Internal Server Error", 500);

      // ASSERT
      expect(error.statusCode).toBe(500);
    });
  });

  describe("edge cases", () => {
    it("should handle empty message", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("");

      // ASSERT
      expect(error.message).toBe("");
      expect(error.statusCode).toBe(400);
    });

    it("should handle very long message", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const longMessage = "A".repeat(1000);

      // ACT
      const error = new sut(longMessage);

      // ASSERT
      expect(error.message).toBe(longMessage);
      expect(error.message).toHaveLength(1000);
    });

    it("should handle status code 0", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test", 0);

      // ASSERT
      expect(error.statusCode).toBe(0);
    });

    it("should handle negative status code", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test", -1);

      // ASSERT
      expect(error.statusCode).toBe(-1);
    });

    it("should handle very large status code", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const error = new sut("Test", 9999);

      // ASSERT
      expect(error.statusCode).toBe(9999);
    });
  });

  describe("serialization", () => {
    it("should be JSON serializable", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Test error";
      const statusCode = 400;
      const error = new sut(message, statusCode);

      // ACT
      // Error objects need special handling for JSON serialization
      const errorObject = {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
        stack: error.stack,
      };
      const serialized = JSON.stringify(errorObject);
      const parsed = JSON.parse(serialized);

      // ASSERT
      expect(parsed.message).toBe(message);
      expect(parsed.name).toBe("AppError");
      expect(parsed.statusCode).toBe(statusCode);
      expect(typeof parsed.stack).toBe("string");
    });

    it("should preserve custom properties in serialization", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const error = new sut("Test", 404);

      // ACT
      const errorObject = {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      };

      const serialized = JSON.stringify(errorObject);
      const parsed = JSON.parse(serialized);

      // ASSERT
      expect(parsed.name).toBe("AppError");
      expect(parsed.message).toBe("Test");
      expect(parsed.statusCode).toBe(404);
    });
  });

  describe("toString behavior", () => {
    it("should have correct toString representation", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const message = "Test error";
      const error = new sut(message);

      // ACT
      const stringRepresentation = error.toString();

      // ASSERT
      expect(stringRepresentation).toContain("AppError");
      expect(stringRepresentation).toContain(message);
    });
  });
});
