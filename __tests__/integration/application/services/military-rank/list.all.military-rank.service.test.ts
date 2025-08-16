import { InMemoryMilitaryRankRepository } from "@infra/repositories";
import { ListAllMilitaryRankService } from "@application/services";

/**
 * 🔗 INTEGRATION TEST - ListAllMilitaryRankService
 *
 * Responsabilidade:
 * - Testar integração Service → Repository real (sem mocks)
 * - Validar retorno correto dos dados persistidos
 * - Verificar comportamento com estado real do repositório
 *
 * YAGNI: Apenas cenários essenciais de listagem
 * KISS: Simples e direto ao ponto
 */

describe("ListAllMilitaryRankService - Integration Tests", () => {
  let repository: InMemoryMilitaryRankRepository;
  let service: ListAllMilitaryRankService;

  beforeEach(() => {
    repository = new InMemoryMilitaryRankRepository();
    service = new ListAllMilitaryRankService({
      militaryRankRepository: repository,
    });
  });

  describe("Real repository integration", () => {
    it("should return empty array when no ranks exist", async () => {
      // ACT
      const result = await service.listAll();

      // ASSERT
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should return all ranks created in repository", async () => {
      // ARRANGE - Criar dados diretamente no repositório
      await repository.create({ abbreviation: "GEN", order: 1 });
      await repository.create({ abbreviation: "CEL", order: 2 });
      await repository.create({ abbreviation: "MAJ", order: 3 });

      // ACT
      const result = await service.listAll();

      // ASSERT
      expect(result).toHaveLength(3);
      expect(result).toEqual([
        { id: expect.any(String), abbreviation: "GEN", order: 1 },
        { id: expect.any(String), abbreviation: "CEL", order: 2 },
        { id: expect.any(String), abbreviation: "MAJ", order: 3 },
      ]);
    });

    it("should reflect repository state changes immediately", async () => {
      // ARRANGE - Começar com dados
      await repository.create({ abbreviation: "SGT", order: 5 });

      // ACT - Primeira consulta
      let result = await service.listAll();
      expect(result).toHaveLength(1);
      expect(result[0]?.abbreviation).toBe("SGT");

      // ARRANGE - Adicionar mais dados
      await repository.create({ abbreviation: "TEN", order: 10 });

      // ACT - Segunda consulta deve refletir mudança
      result = await service.listAll();
      expect(result).toHaveLength(2);

      const abbreviations = result.map((r) => r.abbreviation).sort();
      expect(abbreviations).toEqual(["SGT", "TEN"]);
    });

    it("should handle large dataset correctly", async () => {
      // ARRANGE - Criar vários ranks
      const ranks = [
        { abbreviation: "GEN", order: 1 },
        { abbreviation: "CEL", order: 2 },
        { abbreviation: "TCEL", order: 3 },
        { abbreviation: "MAJ", order: 4 },
        { abbreviation: "CAP", order: 5 },
        { abbreviation: "1TEN", order: 6 },
        { abbreviation: "2TEN", order: 7 },
      ];

      for (const rank of ranks) {
        await repository.create(rank);
      }

      // ACT
      const result = await service.listAll();

      // ASSERT
      expect(result).toHaveLength(7);

      // Verificar que todos estão presentes
      const resultAbbreviations = result.map((r) => r.abbreviation).sort();
      const expectedAbbreviations = ranks.map((r) => r.abbreviation).sort();
      expect(resultAbbreviations).toEqual(expectedAbbreviations);

      // Verificar estrutura correta
      result.forEach((rank) => {
        expect(rank).toEqual({
          id: expect.any(String),
          abbreviation: expect.any(String),
          order: expect.any(Number),
        });
      });
    });
  });
});
