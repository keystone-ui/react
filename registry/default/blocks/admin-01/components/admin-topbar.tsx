"use client";

import { BellIcon, SearchIcon } from "lucide-react";
import type { AdminSection } from "@/components/admin-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: Record<AdminSection, string> = {
  billing: "Billing",
  overview: "Overview",
  settings: "Settings",
  users: "Users",
};

interface AdminTopbarProps {
  onSearchChange: (value: string) => void;
  search: string;
  section: AdminSection;
}

export function AdminTopbar({
  onSearchChange,
  search,
  section,
}: AdminTopbarProps) {
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

      <div className="ml-auto flex shrink-0 items-center gap-2">
        <InputGroup className="hidden w-56 sm:flex" size="sm">
          <InputGroupAddon align="inline-start">
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            aria-label="Search users"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search users…"
            type="search"
            value={search}
          />
        </InputGroup>
        <Button aria-label="Notifications" size="icon-sm" variant="ghost">
          <BellIcon />
        </Button>
      </div>
    </header>
  );
}
