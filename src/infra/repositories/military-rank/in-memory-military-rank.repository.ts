import { randomUUID } from "crypto";

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

  async create(militaryRankData: CreateMilitaryRankInputDTO): Promise<void> {
    const newMilitaryRank: MilitaryRank = {
      id: randomUUID(),
      ...militaryRankData,
    };

    this.data.push(newMilitaryRank);
  }

  async findByAbbreviation(abbreviation: string): Promise<MilitaryRank | null> {
    const found = this.data.find((item) => item.abbreviation === abbreviation);
    return found || null;
  }

  async findByOrder(order: number): Promise<MilitaryRank | null> {
    const found = this.data.find((item) => item.order === order);
    return found || null;
  }

  async listAll(): Promise<MilitaryRank[]> {
    return [...this.data];
  }

  async listById(id: string): Promise<MilitaryRank | null> {
    const found = this.data.find((item) => item.id === id);
    return found || null;
  }
}
