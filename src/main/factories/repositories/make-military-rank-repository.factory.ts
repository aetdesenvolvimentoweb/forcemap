import type { MilitaryRankRepository } from "@domain/repositories";

import { InMemoryMilitaryRankRepository } from "@infra/repositories";

/**
 * 🏭 MAIN LAYER - Factory para Repository
 *
 * Responsabilidade:
 * - Decidir qual implementação usar (InMemory, Prisma, MongoDB, etc.)
 * - Configurar a implementação
 * - Injetar dependências específicas da implementação
 */

export const makeMilitaryRankRepository = (): MilitaryRankRepository => {
  // Por enquanto usamos InMemory
  // Futuramente poderíamos decidir baseado em env var:
  //
  // if (process.env.DB_TYPE === 'prisma') {
  //   return new PrismaMilitaryRankRepository(prismaClient);
  // }
  // if (process.env.DB_TYPE === 'mongodb') {
  //   return new MongoMilitaryRankRepository(mongoClient);
  // }

  return new InMemoryMilitaryRankRepository();
};
