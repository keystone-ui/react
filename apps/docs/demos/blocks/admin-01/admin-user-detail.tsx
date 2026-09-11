"use client";

import { Avatar, AvatarFallback } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { CopyButton } from "@keystoneui/react/copy-button";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";
import { ArrowLeft as ArrowLeftIcon } from "lucide-react";
import type { ReactNode } from "react";

import { STATUS_VARIANT } from "./admin-filters";
import { statusLabels, type User } from "./mock-admin";

interface AdminUserDetailProps {
  onBack: () => void;
  user: User;
}

/**
 * A read-only record view.
 *
 * Three sections of label/value pairs in a `DescriptionList`, which is the
 * `dl`/`dt`/`dd` this is semantically — not a table, and not a form. The
 * `stacked` orientation puts each label above its value; the default row
 * layout right-aligns values against their labels, which reads as a summary
 * rather than a record.
 *
 * Values that identify something get `font-mono` and a `CopyButton`, because
 * an id exists to be pasted somewhere else. Enum values get a `Badge` so they
 * read the same here as they do in the table.
 */
export function AdminUserDetail({ onBack, user }: AdminUserDetailProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    // Capped: a record is read left-to-right across a pair, and on a wide
    // screen an uncapped two-column grid pushes the second column so far from
    // the first that they stop reading as one table of facts.
    <div className="flex w-full max-w-5xl flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          aria-label="Back to users"
          onClick={onBack}
          size="icon-sm"
          variant="ghost"
        >
          <ArrowLeftIcon />
        </Button>
        <Avatar size="sm">
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <h2 className="min-w-0 truncate font-semibold text-lg">{user.name}</h2>
        <Badge variant={STATUS_VARIANT[user.status]}>
          {statusLabels[user.status]}
        </Badge>
      </div>

      <Card variant="outline">
        <CardHeader>
          <CardTitle className="font-semibold">User information</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <Section title="Identity">
            <Pair term="User ID">
              <Mono value={user.id} />
            </Pair>
            <Pair term="Name">{user.name}</Pair>
            <Pair term="Email">
              <Mono value={user.email} />
            </Pair>
          </Section>

          <Section title="Access">
            <Pair term="Role">
              <Badge variant="outline">{user.role}</Badge>
            </Pair>
            <Pair term="Status">
              <Badge variant={STATUS_VARIANT[user.status]}>
                {statusLabels[user.status]}
              </Badge>
            </Pair>
            <Pair term="Seats">{user.seats}</Pair>
            <Pair term="Two-factor">
              {user.twoFactor ? "Enabled" : "Not enabled"}
            </Pair>
          </Section>

          <Section title="Activity">
            <Pair term="Created">{user.createdAt}</Pair>
            <Pair term="Last sign-in">{user.lastSignIn}</Pair>
            <Pair term="Last active">{user.lastActive}</Pair>
            {/* The founding account has no inviter. Rendering the dash here
                rather than omitting the row keeps the grid aligned and says
                "nothing" rather than leaving the reader to wonder. */}
            <Pair term="Invited by">{user.invitedBy ?? <Empty />}</Pair>
          </Section>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-medium text-sm">{title}</h3>
      <DescriptionList columns={2} orientation="stacked">
        {children}
      </DescriptionList>
    </section>
  );
}

function Pair({ children, term }: { children: ReactNode; term: string }) {
  return (
    <DescriptionListItem>
      <DescriptionListTerm>{term}</DescriptionListTerm>
      <DescriptionListDetails>{children}</DescriptionListDetails>
    </DescriptionListItem>
  );
}

function Mono({ value }: { value: string }) {
  return (
    <span className="flex min-w-0 items-center gap-1">
      <span className="truncate font-mono">{value}</span>
      <CopyButton value={value} />
    </span>
  );
}

function Empty() {
  return <span className="text-muted-foreground">-</span>;
}
