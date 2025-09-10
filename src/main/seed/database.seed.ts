import { PasswordHasherProtocol } from "../../application/protocols";
import {
  MilitaryInputDTO,
  MilitaryRankInputDTO,
  UserInputDTO,
} from "../../domain/dtos";
import { UserRole } from "../../domain/entities";
import {
  MilitaryRankRepository,
  MilitaryRepository,
  UserRepository,
} from "../../domain/repositories";

export class DatabaseSeed {
  private static hasSeeded = false;

  constructor(
    private readonly militaryRankRepository: MilitaryRankRepository,
    private readonly militaryRepository: MilitaryRepository,
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasherProtocol,
  ) {}

  public async run(): Promise<void> {
    if (DatabaseSeed.hasSeeded) {
      return;
    }

    await this.seedMilitaryRanks([
      { abbreviation: "Cel", order: 1 },
      { abbreviation: "TC", order: 2 },
      { abbreviation: "Maj", order: 3 },
      { abbreviation: "Cap", order: 4 },
      { abbreviation: "1º Ten", order: 5 },
      { abbreviation: "2º Ten", order: 6 },
      { abbreviation: "Asp Of", order: 7 },
      { abbreviation: "ST", order: 8 },
      { abbreviation: "1º Sgt", order: 9 },
      { abbreviation: "2º Sgt", order: 10 },
      { abbreviation: "3º Sgt", order: 11 },
      { abbreviation: "Cb", order: 12 },
      { abbreviation: "Sd 1ª Classe", order: 13 },
      { abbreviation: "Sd 2ª Classe", order: 14 },
    ]);

    const militaryRankAdmin =
      await this.militaryRankRepository.findByAbbreviation("Cel");

    await this.seedMilitaries([
      {
        militaryRankId: militaryRankAdmin!.id,
        rg: 9999,
        name: "Administrador",
      },
    ]);

    const admin = await this.militaryRepository.findByRg(9999);
    console.log("military admin", admin);
    console.log("vai iniciar o hash da senha");
    const hashedPassword = await this.passwordHasher.hash("F0rceAdmin!");
    console.log("hashed password", hashedPassword);

    await this.seedUsers([
      {
        militaryId: admin!.id,
        role: UserRole.ADMIN,
        password: hashedPassword,
      },
    ]);

    const users = await this.userRepository.listAll();
    console.log("users seeded", users);

    DatabaseSeed.hasSeeded = true;
    console.log("✅ Database seeded successfully");
  }

  private async seedMilitaryRanks(
    ranks: MilitaryRankInputDTO[],
  ): Promise<void> {
    for (const rank of ranks) {
      await this.militaryRankRepository.create(rank);
    }
  }

  private async seedMilitaries(militaries: MilitaryInputDTO[]): Promise<void> {
    for (const military of militaries) {
      await this.militaryRepository.create({
        name: military.name,
        rg: military.rg,
        militaryRankId: military.militaryRankId,
      });
    }
  }

  private async seedUsers(users: UserInputDTO[]): Promise<void> {
    for (const user of users) {
      await this.userRepository.create({
        militaryId: user.militaryId,
        role: user.role,
        password: user.password,
      });
    }
  }
}
