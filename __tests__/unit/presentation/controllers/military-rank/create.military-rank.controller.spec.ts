import { CreateMilitaryRankController } from "@presentation/controllers/military-rank/create.military-rank.controller";
import type { CreateMilitaryRankDTO } from "@domain/dtos";
import type { HttpRequest } from "@presentation/protocols";

describe("CreateMilitaryRankController", () => {
  it("should return 201 on successful creation", async () => {
    const controller = new CreateMilitaryRankController();
    const request: HttpRequest<CreateMilitaryRankDTO> = {
      body: {
        data: {
          abbreviation: "Cel",
          order: 1,
        },
      },
    };
    const response = await controller.handle(request);

    expect(response).toEqual({
      statusCode: 201,
    });
  });
});
