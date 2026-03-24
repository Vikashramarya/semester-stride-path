import {
  LayoutDashboard, BookOpen, FlaskConical, User, Zap, GraduationCap, Video,
  Timer, CalendarCheck, FileQuestion,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
import { ThemeToggle } from "@/components/ThemeToggle";
import sankalpLogo from "@/assets/sankalp-logo.png";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, SidebarHeader, useSidebar,
} from "@/components/ui/sidebar";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const mainNav = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Syllabus", url: "/syllabus", icon: BookOpen },
  { title: "Study Planner", url: "/planner", icon: CalendarCheck },
  { title: "Pomodoro Timer", url: "/pomodoro", icon: Timer },
  { title: "Lecture Videos", url: "/lectures", icon: Video },
  { title: "PYQ Papers", url: "/pyq", icon: FileQuestion },
  { title: "Quick Revision", url: "/revision", icon: Zap },
  { title: "Profile", url: "/profile", icon: User },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { semester, setSemester } = useProgress();
  const semData = getSemester(semester);
  const subjects = semData?.subjects.filter(s => !s.isLab) || [];
  const labs = semData?.subjects.filter(s => s.isLab) || [];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sankalp-gradient text-primary-foreground font-bold text-sm shadow-sm">
            S
          </div>
          {!collapsed && (
            <div>
              <span className="text-base font-bold tracking-tight">Sankalp</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Exam Preparation</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Select value={String(semester)} onValueChange={v => setSemester(Number(v))}>
            <SelectTrigger className="mt-3 h-9 text-sm bg-muted/50 border-0">
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
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end={item.url === "/"} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
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
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">
              <BookOpen className="mr-1.5 h-3 w-3" />
              Subjects
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {subjects.map(sub => (
                  <SidebarMenuItem key={sub.id}>
                    <SidebarMenuButton asChild>
                      <NavLink to={`/subject/${sub.id}`} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                        <span className="mr-2 h-5 w-5 shrink-0 rounded-md bg-muted flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                          {sub.code.slice(-2)}
                        </span>
                        {!collapsed && <span className="truncate text-[13px]">{sub.name}</span>}
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
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider">
              <FlaskConical className="mr-1.5 h-3 w-3" />
              Labs
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labs.map(lab => (
                  <SidebarMenuItem key={lab.id}>
                    <SidebarMenuButton asChild>
                      <NavLink to={`/lab/${lab.id}`} className="hover:bg-muted/50" activeClassName="bg-primary/10 text-primary font-medium">
                        <FlaskConical className="mr-2 h-4 w-4 shrink-0" />
                        {!collapsed && <span className="truncate text-[13px]">{lab.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-3 border-t">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                <GraduationCap className="h-3 w-3 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Sem {semester}</span>
            </div>
          )}
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
