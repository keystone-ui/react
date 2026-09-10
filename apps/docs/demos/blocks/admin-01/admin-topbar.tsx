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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@keystoneui/react/input-group";
import { Separator } from "@keystoneui/react/separator";
import { Bell as BellIcon, Search as SearchIcon } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

import type { AdminSection } from "./admin-sidebar";

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
