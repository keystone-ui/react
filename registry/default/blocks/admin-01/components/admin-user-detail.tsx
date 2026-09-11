"use client";

import { ArchiveIcon, ArrowLeftIcon, PencilIcon } from "lucide-react";
import type { ReactNode } from "react";
import { STATUS_VARIANT } from "@/components/admin-filters";
import { statusLabels, type User } from "@/components/mock-admin";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@/components/ui/description-list";

interface AdminUserDetailProps {
  /** The user who sent the invite, resolved from `user.invitedBy`. */
  inviter: User | null;
  onBack: () => void;
  onOpenUser: (id: string) => void;
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
export function AdminUserDetail({
  inviter,
  onBack,
  onOpenUser,
  user,
}: AdminUserDetailProps) {
  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("");

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Full width with the actions at the far edge, while the card below is
          capped — so the buttons reach the container without the record's two
          columns drifting apart on a wide screen. Wraps, because the name, its
          badge and two labelled actions do not share a line on a phone. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
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
          <h2 className="min-w-0 truncate font-semibold text-lg">
            {user.name}
          </h2>
          <Badge variant={STATUS_VARIANT[user.status]}>
            {statusLabels[user.status]}
          </Badge>
        </div>

        {/* Same 32px tier as the back button, so the header sits on one rung
            of the control ladder. */}
        <div className="flex shrink-0 items-center gap-2">
          <Button size="sm" variant="outline">
            <PencilIcon />
            Edit user
          </Button>
          <Button size="sm" variant="outline">
            <ArchiveIcon />
            Archive user
          </Button>
        </div>
      </div>

      <Card className="max-w-4xl gap-0 py-0" variant="outline">
        <CardHeader className="border-border border-b px-6 py-4">
          <CardTitle className="text-base">User information</CardTitle>
        </CardHeader>
        {/* The card's own padding is zeroed so each section carries it, which
            lets the rules between them run the full width of the card rather
            than stopping short of its edges. */}
        <CardContent className="flex flex-col p-0">
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
            <Pair term="Invited by">
              {inviter ? (
                <button
                  className="cursor-pointer rounded-sm text-left hover:underline focus-visible:outline-2 focus-visible:outline-ring/50 focus-visible:outline-offset-2"
                  onClick={() => onOpenUser(inviter.id)}
                  type="button"
                >
                  {inviter.name}
                </button>
              ) : (
                <Empty />
              )}
            </Pair>
          </Section>
        </CardContent>
      </Card>
    </div>
  );
}

function Section({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="flex flex-col gap-4 border-border border-t px-6 py-5 first:border-t-0">
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      {/* The grid lives here rather than behind a `columns` prop: it is four
          classes on the element we already style, and it is written once for
          every section. */}
      <DescriptionList
        className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2"
        orientation="stacked"
      >
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
