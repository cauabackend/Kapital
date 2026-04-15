import { Sidebar } from "@/components/layout/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <main className="relative flex-1 overflow-y-auto">
        {/* Subtle ambient glow */}
        <div className="pointer-events-none fixed right-0 top-0 h-[500px] w-[500px] bg-[radial-gradient(ellipse_at_center,_hsl(42_70%_60%_/_0.03)_0%,_transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl px-8 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
