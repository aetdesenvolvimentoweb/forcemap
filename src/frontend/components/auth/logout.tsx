"use client";

import { signOut } from "next-auth/react";

export const LogOut = () => {
  return (
    <button
      className="px-4 py-1 bg-blue-600 text-white font-bold rounded-md"
      onClick={async () =>
        await signOut({
          redirect: true,
          callbackUrl: "/api/auth/signin",
        })
      }
    >
      Sair
    </button>
  );
};
