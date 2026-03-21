import {
  LayoutDashboard, BookOpen, FlaskConical, User, Zap, ChevronDown, GraduationCap,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Last Minute Revision", url: "/revision", icon: Zap },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { semester, setSemester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];
  const labs = semData?.subjects.filter(s => s.isLab) || [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            S
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">Sankalp</span>
          )}
        </div>
        {!collapsed && (
          <Select value={String(semester)} onValueChange={v => setSemester(Number(v))}>
            <SelectTrigger className="mt-3 h-9 text-sm">
              <GraduationCap className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 8 }, (_, i) => (
                <SelectItem key={i + 1} value={String(i + 1)}>
                  Semester {i + 1}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {subjects.length > 0 && (
          <SidebarGroup defaultOpen>
            <SidebarGroupLabel>
              <BookOpen className="mr-2 h-3.5 w-3.5" />
              Subjects
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {subjects.map(sub => (
                  <SidebarMenuItem key={sub.id}>
                    <SidebarMenuButton asChild>
                      <NavLink to={`/subject/${sub.id}`} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                        <span className="mr-2 h-4 w-4 shrink-0 rounded bg-muted flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                          {sub.code.slice(-2)}
                        </span>
                        {!collapsed && <span className="truncate">{sub.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {labs.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>
              <FlaskConical className="mr-2 h-3.5 w-3.5" />
              Labs
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labs.map(lab => (
                  <SidebarMenuItem key={lab.id}>
                    <SidebarMenuButton asChild>
                      <NavLink to={`/lab/${lab.id}`} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                        <FlaskConical className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate">{lab.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3">
        <div className="flex items-center justify-between">
          {!collapsed && <span className="text-xs text-muted-foreground">Sem {semester} · CSE</span>}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
