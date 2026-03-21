import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b px-4 shrink-0 bg-card/80 backdrop-blur-sm sticky top-0 z-10">
            <SidebarTrigger className="mr-3" />
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md sankalp-gradient flex items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">S</span>
              </div>
              <span className="text-sm font-semibold tracking-tight">Sankalp</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">· Exam Prep</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-muted/30">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
