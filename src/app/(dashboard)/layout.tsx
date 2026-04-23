import { Sidebar } from "@/components/layout/sidebar";
import { BottomNav } from "@/components/layout/bottom-nav";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <MobileHeader />

        <main className="relative flex-1 overflow-y-auto">
          {/* Subtle ambient glow */}
          <div className="pointer-events-none fixed right-0 top-0 h-[500px] w-[500px] bg-[radial-gradient(ellipse_at_center,_hsl(42_70%_60%_/_0.03)_0%,_transparent_70%)]" />

          <div className="relative mx-auto max-w-6xl px-4 py-6 pb-24 md:px-8 md:py-10 md:pb-10">
            {children}
          </div>
        </main>
      </div>

      <BottomNav />
    </div>
  );
}
