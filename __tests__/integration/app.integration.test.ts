import request from "supertest";
import express from "express";

import { DefaultRouteRegistry } from "@main/registries";
import { setupApp } from "@main/config/app.config";
import { setupAllRoutes } from "@main/config/routes/routes.setup";

/**
 * 🔗 INTEGRATION TESTS - Express App Integration
 *
 * Responsabilidade:
 * - Testar integração entre Express, middlewares, routes e adapters
 * - Validar fluxo completo HTTP → Controller → Service → Response
 * - Verificar funcionamento dos middlewares em conjunto
 *
 * YAGNI: Apenas testes essenciais para validar integrações críticas
 * KISS: Setup simples, foco nos fluxos principais
 * DRY: Reutilização de setup comum
 */

describe("Express App Integration", () => {
  let app: express.Express;
  let routeRegistry: DefaultRouteRegistry;

  beforeEach(() => {
    // Setup da aplicação completa
    app = express();
    routeRegistry = new DefaultRouteRegistry();

    // Registrar todas as rotas
    setupAllRoutes(routeRegistry);

    // Configurar a aplicação
    setupApp(app, routeRegistry);
  });

  describe("Application Bootstrap", () => {
    it("should start application with all middlewares and routes", async () => {
      // ARRANGE & ACT
      const response = await request(app).get("/api/v1").expect(200);

      // ASSERT
      expect(response.body).toEqual({
        name: "ForceMap API",
        version: "1.0.0",
        status: "running",
        timestamp: expect.any(String),
        registeredRoutes: 2, // POST /military-ranks + GET /military-ranks
      });
    });

    it("should return health status", async () => {
      // ACT
      const response = await request(app).get("/api/v1/health").expect(200);

      // ASSERT
      expect(response.body).toEqual({
        status: "ok",
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });

    it("should handle 404 for unknown routes", async () => {
      // ACT
      const response = await request(app).get("/api/v1/unknown").expect(404);

      // ASSERT
      expect(response.body).toEqual({
        error: "Route not found",
        message: "The requested resource does not exist",
      });
    });
  });

  describe("Middleware Pipeline Integration", () => {
    it("should apply CORS headers", async () => {
      // ACT
      const response = await request(app).get("/api/v1").expect(200);

      // ASSERT
      expect(response.headers["access-control-allow-origin"]).toBe("*");
      expect(response.headers["access-control-allow-credentials"]).toBe("true");
    });

    it("should apply security headers", async () => {
      // ACT
      const response = await request(app).get("/api/v1").expect(200);

      // ASSERT
      expect(response.headers["x-content-type-options"]).toBe("nosniff");
      expect(response.headers["x-frame-options"]).toBe("DENY");
      expect(response.headers["x-xss-protection"]).toBe("1; mode=block");
    });

    it("should add correlation ID to responses", async () => {
      // ACT
      const response = await request(app).get("/api/v1").expect(200);

      // ASSERT
      expect(response.headers["x-correlation-id"]).toMatch(
        /^req_\d+_[a-z0-9]{9}$/,
      );
    });

    it("should parse JSON body", async () => {
      // ACT
      const response = await request(app)
        .post("/api/v1/military-ranks")
        .send({ abbreviation: "CEL", order: 1 })
        .expect(201);

      // ASSERT - Se chegou até aqui, o JSON foi parseado corretamente
      expect(response.status).toBe(201);
    });
  });

  describe("Route Registry Integration", () => {
    it("should register military rank routes correctly", async () => {
      // ARRANGE
      const validData = { abbreviation: "CEL", order: 1 };

      // ACT - Test POST route
      const createResponse = await request(app)
        .post("/api/v1/military-ranks")
        .send(validData)
        .expect(201);

      // ASSERT - Se chegou até aqui, a rota foi registrada corretamente
      expect(createResponse.status).toBe(201);
    });

    it("should register GET military rank route correctly", async () => {
      // ACT - Test GET route
      const listResponse = await request(app)
        .get("/api/v1/military-ranks")
        .expect(200);

      // ASSERT - Route is registered and returns array
      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveProperty("data");
      expect(Array.isArray(listResponse.body.data)).toBe(true);
    });

    it("should validate request data through complete pipeline", async () => {
      // ARRANGE
      const invalidData = { abbreviation: "", order: -1 };

      // ACT
      const response = await request(app)
        .post("/api/v1/military-ranks")
        .send(invalidData)
        .expect(422);

      // ASSERT
      expect(response.body).toHaveProperty("error");
      expect(response.body.error).toMatch(
        /Abreviatura.*precisa ser preenchido/,
      );
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle validation errors with 422 status", async () => {
      // ARRANGE
      const invalidData = {
        abbreviation: "VERY_LONG_INVALID_ABBREVIATION",
        order: 999,
      };

      // ACT
      const response = await request(app)
        .post("/api/v1/military-ranks")
        .send(invalidData)
        .expect(422);

      // ASSERT
      expect(response.body).toHaveProperty("error");
    });

    it("should handle missing request body", async () => {
      // ACT
      const response = await request(app)
        .post("/api/v1/military-ranks")
        .send({}) // Empty body
        .expect(422);

      // ASSERT
      expect(response.body).toHaveProperty("error");
    });
  });
});
