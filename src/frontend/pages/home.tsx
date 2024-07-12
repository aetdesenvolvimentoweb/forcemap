import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { LogOut } from "../components/auth/logout";
import { Footer } from "../components/footer/page";
import { Header } from "../components/header/page";

export const HomePage = async () => {
  const session = await getServerSession();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 flex items-center justify-center flex-col gap-2">
        Olá, {session?.user?.name}, seja bem vindo!
        <LogOut />
      </main>
      <Footer />
    </div>
  );
};
