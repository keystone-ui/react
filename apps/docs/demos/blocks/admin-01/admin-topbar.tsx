"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@keystoneui/react/breadcrumb";
import { Button } from "@keystoneui/react/button";
import { Separator } from "@keystoneui/react/separator";
import { Bell as BellIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import type { AdminSection } from "./admin-sidebar";

const TITLES: Record<AdminSection, string> = {
  billing: "Billing",
  overview: "Overview",
  settings: "Settings",
  users: "Users",
};

interface AdminTopbarProps {
  section: AdminSection;
}

export function AdminTopbar({ section }: AdminTopbarProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator className="mr-1 h-4" orientation="vertical" />

      <Breadcrumb className="min-w-0">
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:block">
            <BreadcrumbLink href="#">Northwind</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{TITLES[section]}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Search lives in the table's own toolbar, not here: it filters the
          table, and a field in the app chrome reads as global search. */}
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <Button aria-label="Notifications" size="icon-sm" variant="ghost">
          <BellIcon />
        </Button>
      </div>
    </header>
  );
}
