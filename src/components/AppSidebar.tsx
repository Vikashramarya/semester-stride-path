import {
  LayoutDashboard, BookOpen, FlaskConical, User, Zap, GraduationCap, Video,
  Timer, CalendarCheck, FileQuestion, Bell, Bot, Brain, StickyNote, Star, Flame, MessageCircle, FlaskRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useProgress } from "@/context/ProgressContext";
import { getSemester } from "@/data/syllabus";
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
  { title: "Important Questions", url: "/important-questions", icon: Star },
  { title: "Study Planner", url: "/planner", icon: CalendarCheck },
  { title: "Backlog Recovery", url: "/backlog-planner", icon: Flame },
  { title: "Pomodoro Timer", url: "/pomodoro", icon: Timer },
  { title: "Lecture Videos", url: "/lectures", icon: Video },
  { title: "PYQ Papers", url: "/pyq", icon: FileQuestion },
  { title: "My Notes", url: "/notes", icon: StickyNote },
  { title: "Quick Revision", url: "/revision", icon: Zap },
  { title: "Test Series", url: "/test-series", icon: FlaskRound },
  { title: "AI Chatbot", url: "/chatbot", icon: Bot },
  { title: "Quiz Mode", url: "/quiz", icon: Brain },
  { title: "Doubt Hub", url: "/doubt-hub", icon: MessageCircle },
  { title: "University Notices", url: "/notices", icon: Bell },
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
        <div className="flex items-center gap-2.5 group">
          <img
            src={sankalpLogo}
            alt="Sankalp"
            className="h-9 w-9 shrink-0 rounded-xl object-contain transition-transform duration-300 group-hover:scale-110"
          />
          {!collapsed && (
            <div className="animate-fade-in">
              <span className="text-base font-bold font-display tracking-tight gradient-text">Sankalp</span>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">Exam Preparation</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Select value={String(semester)} onValueChange={v => setSemester(Number(v))}>
            <SelectTrigger className="mt-3 h-9 text-sm glass border-0 transition-all duration-200 hover:bg-muted/60">
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
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item, index) => (
                <SidebarMenuItem
                  key={item.title}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 25}ms` }}
                >
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="group/item rounded-xl transition-all duration-200 hover:bg-primary/8 hover:translate-x-0.5"
                      activeClassName="bg-primary/12 text-primary font-medium shadow-sm"
                    >
                      <item.icon className="mr-2 h-4 w-4 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-primary" />
                      {!collapsed && (
                        <span className="transition-colors duration-200">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {subjects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              <BookOpen className="mr-1.5 h-3 w-3" />
              Subjects
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {subjects.map((sub, index) => (
                  <SidebarMenuItem
                    key={sub.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(mainNav.length + index) * 25}ms` }}
                  >
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/subject/${sub.id}`}
                        className="group/item rounded-xl transition-all duration-200 hover:bg-primary/8 hover:translate-x-0.5"
                        activeClassName="bg-primary/12 text-primary font-medium shadow-sm"
                      >
                        <span className="mr-2 h-5 w-5 shrink-0 rounded-md bg-primary/10 flex items-center justify-center text-[9px] font-bold text-primary/70 transition-all duration-200 group-hover/item:bg-primary/20 group-hover/item:text-primary group-hover/item:scale-110">
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
            <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
              <FlaskConical className="mr-1.5 h-3 w-3" />
              Labs
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {labs.map((lab, index) => (
                  <SidebarMenuItem
                    key={lab.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${(mainNav.length + subjects.length + index) * 25}ms` }}
                  >
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={`/lab/${lab.id}`}
                        className="group/item rounded-xl transition-all duration-200 hover:bg-primary/8 hover:translate-x-0.5"
                        activeClassName="bg-primary/12 text-primary font-medium shadow-sm"
                      >
                        <FlaskConical className="mr-2 h-4 w-4 shrink-0 transition-all duration-200 group-hover/item:scale-110 group-hover/item:text-primary" />
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

      <SidebarFooter className="p-3 border-t border-border/50">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center gap-2 animate-fade-in">
              <div className="h-7 w-7 rounded-full sankalp-gradient flex items-center justify-center">
                <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <div>
                <span className="text-xs font-medium">Sem {semester}</span>
                <p className="text-[9px] text-muted-foreground">B.Tech CSE</p>
              </div>
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
