import { Footer } from "../components/footer/page";
import { Header } from "../components/header/page";

export const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        Em desenvolvimento...
      </main>
      <Footer />
    </div>
  );
};
