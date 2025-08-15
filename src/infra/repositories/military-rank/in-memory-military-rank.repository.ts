import type { CreateMilitaryRankInputDTO } from "@domain/dtos";
import type { MilitaryRank } from "@domain/entities";
import type { MilitaryRankRepository } from "@domain/repositories";

/**
 * 🏗️ INFRA LAYER - Implementação concreta do repository
 *
 * Responsabilidades:
 * - Persistir dados no banco
 * - Implementar interface definida no Domain
 * - Lidar com tecnologias específicas (Prisma, MongoDB, etc.)
 */

// Por enquanto, uma implementação em memória para demonstrar
// Depois substituiremos por Prisma/MongoDB/etc.
export class InMemoryMilitaryRankRepository implements MilitaryRankRepository {
  private readonly data: MilitaryRank[] = [];
  private currentId = 1;

  async create(militaryRankData: CreateMilitaryRankInputDTO): Promise<void> {
    console.log("🗄️ [INFRA] Salvando no 'banco':", militaryRankData);

    // Simula verificação de duplicata por abbreviation
    const existsByAbbreviation = await this.findByAbbreviation(
      militaryRankData.abbreviation,
    );
    if (existsByAbbreviation) {
      throw new Error(
        `Military rank with abbreviation '${militaryRankData.abbreviation}' already exists`,
      );
    }

    // Simula verificação de duplicata por order
    const existsByOrder = await this.findByOrder(militaryRankData.order);
    if (existsByOrder) {
      throw new Error(
        `Military rank with order '${militaryRankData.order}' already exists`,
      );
    }

    // Simula delay de rede/banco
    await new Promise((resolve) => setTimeout(resolve, 100));

    const newMilitaryRank: MilitaryRank = {
      id: String(this.currentId++),
      ...militaryRankData,
    };

    this.data.push(newMilitaryRank);
    console.log("✅ [INFRA] Salvo com sucesso! ID:", newMilitaryRank.id);
  }

  async findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null> {
    console.log("🔍 [INFRA] Buscando por abbreviation:", abbreviation);
    const found = this.data.find((item) => item.abbreviation === abbreviation);
    return found || null;
  }

  async findByOrder(order: number): Promise<MilitaryRank | null> {
    console.log("🔍 [INFRA] Buscando por order:", order);
    const found = this.data.find((item) => item.order === order);
    return found || null;
  }

  // Método helper para debug (não faz parte da interface)
  async listAll(): Promise<MilitaryRank[]> {
    return [...this.data];
  }
}
