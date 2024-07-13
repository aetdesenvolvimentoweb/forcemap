import NextAuth from "next-auth";
import CredentialProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialProvider({
      name: "credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "Email: exemplo@exemplo.com",
        },
        password: { label: "Senha", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials) {
          return null;
        }

        if (
          credentials.email === "andredavid1@yahoo.com.br" &&
          credentials.password === "12345678"
        ) {
          return {
            id: "valid-id",
            email: credentials.email,
            name: "André David",
          };
        }

        return null;
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
