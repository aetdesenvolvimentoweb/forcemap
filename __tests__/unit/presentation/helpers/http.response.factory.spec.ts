import { InvalidParamError } from "@application/errors";
import { HttpResponseFactory } from "@presentation/factories";

interface SutTypes {
  sut: HttpResponseFactory;
}

const makeSut = (): SutTypes => {
  const sut = new HttpResponseFactory();

  return {
    sut,
  };
};

describe("HttpResponseFactory", () => {
  let sutInstance: SutTypes;

  beforeEach(() => {
    sutInstance = makeSut();
  });

  describe("created", () => {
    it("should return HTTP 201 Created response", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const response = sut.created();

      // ASSERT
      expect(response).toEqual({
        statusCode: 201,
      });
    });
  });

  describe("badRequest", () => {
    it("should return HTTP 400 Bad Request with error details", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const error = new InvalidParamError("Abreviatura", "é obrigatória");

      // ACT
      const response = sut.badRequest(error);

      // ASSERT
      expect(response).toEqual({
        statusCode: 422, // InvalidParamError uses 422
        body: {
          error: "O campo Abreviatura é inválido: é obrigatória",
        },
      });
    });

    it("should use error statusCode from AppError", () => {
      // ARRANGE
      const { sut } = sutInstance;
      const error = new InvalidParamError("Order", "deve ser um número");

      // ACT
      const response = sut.badRequest(error);

      // ASSERT
      expect(response.statusCode).toBe(error.statusCode);
      expect(response.body).toEqual({
        error: error.message,
      });
    });
  });

  describe("serverError", () => {
    it("should return HTTP 500 Internal Server Error", () => {
      // ARRANGE
      const { sut } = sutInstance;

      // ACT
      const response = sut.serverError();

      // ASSERT
      expect(response).toEqual({
        statusCode: 500,
        body: {
          error: "Erro interno no servidor.",
        },
      });
    });
  });
});
