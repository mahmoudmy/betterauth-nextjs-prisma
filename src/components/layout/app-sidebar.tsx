"use client"

import * as React from "react"
import {
  Users,
  LayoutDashboard,
} from "lucide-react"
import { NavUser } from "@/components/layout/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "@/lib/auth-client"
import { usePathname } from "next/navigation"
import Link from "next/link"

const navItems = [
  {
    title: 'پلتفرم',
    items: [
      {
        title: "داشبورد",
        url: "/dashboard",
        icon: LayoutDashboard,
      },

    ]
  },
  {
    title: 'مدیریت',
    items: [
      {
        title: "کاربران",
        url: "/dashboard/admin/users",
        icon: Users,
      },
    ]
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const pathname = usePathname();

  const getAvatarFromUser = (user: unknown): string => {
    if (!user || typeof user !== "object") return "";
    const obj = user as Record<string, unknown>;
    const image = obj["image"];
    if (typeof image === "string") return image;
    const avatar = obj["avatar"];
    if (typeof avatar === "string") return avatar;
    return "";
  };

  return (
    <Sidebar collapsible="icon" {...props} dir="rtl" side="right">
      <SidebarHeader />
      <SidebarContent>
        {navItems.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>{item.title}</Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: session?.user?.name ?? "",
            email: session?.user?.email ?? "",
            avatar: getAvatarFromUser(session?.user),
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
