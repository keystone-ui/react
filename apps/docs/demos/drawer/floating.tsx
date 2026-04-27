"use client";

import { Avatar, AvatarFallback } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { Drawer, DrawerContent, DrawerTitle } from "@keystoneui/react/drawer";
import { Separator } from "@keystoneui/react/separator";
import { ExternalLink } from "lucide-react";
import { useState } from "react";

interface Customer {
  company: string;
  email: string;
  id: string;
  initials: string;
  language: string;
  location: string;
  name: string;
  owner: string;
  phone: string;
  responseTime: string;
  source: string;
  status: "At risk" | "Healthy" | "Paused";
  summary: string;
}

const CUSTOMERS: Customer[] = [
  {
    id: "marcus-lind",
    name: "Marcus Lind",
    company: "Polar Banking",
    email: "marcus@polarbanking.fi",
    initials: "ML",
    owner: "Devon Reed",
    status: "At risk",
    source: "Executive expansion motion",
    responseTime: "Slow response",
    phone: "(817) 517-2317",
    location: "Nordics",
    language: "English, Swedish",
    summary:
      "Stakeholders are hesitant to renew until audit exports and multilingual queue governance are stabilized.",
  },
  {
    id: "alia-hassan",
    name: "Alia Hassan",
    company: "Northwind Logistics",
    email: "alia@northwind.co",
    initials: "AH",
    owner: "Priya Patel",
    status: "Healthy",
    source: "Inbound trial",
    responseTime: "Within SLA",
    phone: "(206) 555-0114",
    location: "Pacific Northwest",
    language: "English",
    summary:
      "Recently expanded to a second region. CSAT trending up after the Q1 onboarding revamp.",
  },
  {
    id: "tomas-vega",
    name: "Tomas Vega",
    company: "Ferro Studio",
    email: "tomas@ferrostudio.es",
    initials: "TV",
    owner: "Jordan Liu",
    status: "Paused",
    source: "Reactivation",
    responseTime: "Within SLA",
    phone: "(34) 91 555 0102",
    location: "Iberia",
    language: "English, Spanish",
    summary:
      "Paused billing during a reorg. Champion confirmed expected restart next quarter.",
  },
];

const STATUS_VARIANT: Record<
  Customer["status"],
  "destructive" | "default" | "secondary"
> = {
  "At risk": "destructive",
  Healthy: "default",
  Paused: "secondary",
};

export default function DrawerFloating() {
  const [active, setActive] = useState<Customer | null>(null);

  return (
    <>
      <div className="flex flex-col gap-1 rounded-md border bg-background p-1">
        {CUSTOMERS.map((customer) => (
          <button
            className="flex items-center gap-3 rounded-sm px-2 py-2 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
            key={customer.id}
            onClick={() => setActive(customer)}
            type="button"
          >
            <Avatar size="sm">
              <AvatarFallback>{customer.initials}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate font-medium text-sm">
                {customer.name}
              </span>
              <span className="truncate text-muted-foreground text-xs">
                {customer.company} · {customer.email}
              </span>
            </div>
            <Badge variant={STATUS_VARIANT[customer.status]}>
              {customer.status}
            </Badge>
          </button>
        ))}
      </div>

      <Drawer
        onOpenChange={(open) => {
          if (!open) {
            setActive(null);
          }
        }}
        open={active !== null}
        swipeDirection="right"
      >
        <DrawerContent variant="floating">
          {active && (
            <>
              <div className="flex items-center gap-3 border-b p-4">
                <Avatar size="lg">
                  <AvatarFallback>{active.initials}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <DrawerTitle className="truncate">{active.name}</DrawerTitle>
                  <span className="truncate text-muted-foreground text-xs">
                    {active.company} · {active.email}
                  </span>
                </div>
                <Button size="sm" variant="outline">
                  <ExternalLink className="size-3.5" />
                  Visit site
                </Button>
              </div>

              <div className="no-scrollbar flex flex-col gap-5 overflow-y-auto p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Owner · {active.owner}</Badge>
                  <Badge variant={STATUS_VARIANT[active.status]}>
                    {active.status}
                  </Badge>
                  <Badge variant="secondary">{active.responseTime}</Badge>
                </div>

                <p className="text-muted-foreground text-sm leading-relaxed">
                  {active.summary}
                </p>

                <Separator />

                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">Source</dt>
                    <dd>{active.source}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">Phone</dt>
                    <dd>{active.phone}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">Location</dt>
                    <dd>{active.location}</dd>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <dt className="text-muted-foreground text-xs">Language</dt>
                    <dd>{active.language}</dd>
                  </div>
                </dl>
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
