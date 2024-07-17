import { LoginService } from "@/backend/data/services";
import { AuthValidator } from "@/backend/data/validators";
import { MilitaryPrismaRespository } from "@/backend/infra/adapters";
import { BcryptHashCompareAdapter } from "@/backend/infra/adapters/bcrypt/hash-compare";
import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialProvider({
      name: "credentials",
      credentials: {
        rg: {
          label: "RG",
          type: "number",
        },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        const militaryRepository = new MilitaryPrismaRespository();
        const hashCompare = new BcryptHashCompareAdapter();

        const loginService = new LoginService({
          repository: militaryRepository,
          validator: new AuthValidator({
            repository: militaryRepository,
            hashCompare,
          }),
        });

        const user = await loginService.login({
          rg: Number(credentials.rg),
          password: credentials.password,
        });

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    redirect: () => {
      return "/";
    },
  },
});

export { handler as GET, handler as POST };
