import Header from "@/components/Header";
import ListChat from "./ListChat";

export default function ChatLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 md:px-6 flex-grow pt-16 md:pt-20 pb-16">
        <div className="mt-8">
          <h1 className="text-3xl md:text-4xl font-black mb-6 relative inline-block">
            <span className="relative z-10">TIN NHẮN</span>
            <div className="absolute bottom-0 left-0 w-full h-3 bg-yellow-custom -z-0"></div>
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <ListChat />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
