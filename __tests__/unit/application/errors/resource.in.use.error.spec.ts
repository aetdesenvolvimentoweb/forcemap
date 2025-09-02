import { ResourceInUseError } from "../../../../src/application/errors";

describe("ResourceInUseError", () => {
  it("should create error with correct message and status code", () => {
    const resource = "Posto/Graduação";
    const dependentResource = "militares";

    const error = new ResourceInUseError(resource, dependentResource);

    expect(error.message).toBe(
      "Posto/Graduação não pode ser excluído(a) pois está sendo utilizado(a) por militares.",
    );
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("ResourceInUseError");
  });

  it("should create error with different resources", () => {
    const resource = "Categoria";
    const dependentResource = "produtos";

    const error = new ResourceInUseError(resource, dependentResource);

    expect(error.message).toBe(
      "Categoria não pode ser excluído(a) pois está sendo utilizado(a) por produtos.",
    );
    expect(error.statusCode).toBe(409);
    expect(error.name).toBe("ResourceInUseError");
  });

  it("should be an instance of Error", () => {
    const error = new ResourceInUseError("Recurso", "dependentes");

    expect(error).toBeInstanceOf(Error);
  });
});
