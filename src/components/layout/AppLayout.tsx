import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {

  return (
    <div className="h-screen bg-app-bg flex overflow-hidden">
      {/* Sidebar: visible on md+ screens */}
      <Sidebar />

      {/* Main content area */}
      <main className="flex-1 flex flex-col h-screen">
        <div className="flex-1 w-full mx-auto p-4 sm:p-6 pb-20 md:pb-6 overflow-y-auto">
          {children}
        </div>

        {/* Bottom navigation: visible on mobile only */}
        <BottomNav />
      </main>
    </div>
  );
}
