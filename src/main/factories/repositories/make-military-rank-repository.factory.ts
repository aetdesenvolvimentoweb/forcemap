import type { MilitaryRankRepository } from "@domain/repositories";

import { InMemoryMilitaryRankRepository } from "@infra/repositories";

/**
 * 🏭 MAIN LAYER - Factory para Repository
 *
 * Responsabilidade:
 * - Decidir qual implementação usar (InMemory, Prisma, MongoDB, etc.)
 * - Configurar a implementação
 * - Injetar dependências específicas da implementação
 * - Garantir instância única para InMemory (singleton)
 */

// Singleton instance para InMemory Repository
let inMemoryRepositoryInstance: MilitaryRankRepository | null = null;

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  // Para InMemory, usamos singleton para manter estado consistente
  if (!inMemoryRepositoryInstance) {
    inMemoryRepositoryInstance = new InMemoryMilitaryRankRepository();
  }

  return inMemoryRepositoryInstance;

  // Futuramente poderíamos decidir baseado em env var:
  //
  // if (process.env.DB_TYPE === 'prisma') {
  //   return new PrismaMilitaryRankRepository(prismaClient);
  // }
  // if (process.env.DB_TYPE === 'mongodb') {
  //   return new MongoMilitaryRankRepository(mongoClient);
  // }
};

// Para testes: permite limpar o singleton
export const clearRepositoryInstance = (): void => {
  inMemoryRepositoryInstance = null;
};
