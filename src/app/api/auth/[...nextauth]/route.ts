import { prismaClient } from "@/backend/infra/adapters";
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

        const military = await prismaClient.military.findUnique({
          where: {
            rg: Number(credentials.rg),
          },
        });

        if (!military) {
          return null;
        }

        const hashCompare = new BcryptHashCompareAdapter();
        const match = await hashCompare.compare(
          credentials.password,
          military.password
        );

        if (!match) {
          return null;
        }

        return {
          id: military.id,
          name: military.name,
        };
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
