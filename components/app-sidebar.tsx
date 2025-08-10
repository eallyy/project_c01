"use client"
import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconStackBack
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts/UserContext";
import { useTranslations } from "next-intl";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations("sidebar");
  const { user, refreshSession } = useUser();

    const data = {
      navMain: [
        {
          title: t("main.dashboard"),
          url: "/",
          icon: IconDashboard,
        },
        {
          title: t("main.users"),
          url: "/users",
          icon: IconUsers,
        },
      ],
      documents: [
        {
          name: "Data Library",
          url: "#",
          icon: IconDatabase,
        },
        {
          name: "Reports",
          url: "#",
          icon: IconReport,
        },
        {
          name: "Word Assistant",
          url: "#",
          icon: IconFileWord,
        },
      ],
      navSecondary: [
        {
          title: t("secondary.settings"),
          url: "#",
          icon: IconSettings,
        },
        {
          title: t("secondary.get_help"),
          url: "#",
          icon: IconHelp,
        },
      ],
    }
  React.useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconStackBack className="!size-5" />
                <span className="text-base font-semibold">Project c01</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
