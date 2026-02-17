"use client";

import { Avatar, AvatarFallback } from "keystoneui/avatar";
import { Button } from "keystoneui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "keystoneui/empty";

export default function EmptyWithAvatar() {
  return (
    <Empty className="max-w-md">
      <EmptyHeader>
        <Avatar className="mb-2 size-16">
          <AvatarFallback className="text-lg">JD</AvatarFallback>
        </Avatar>
        <EmptyTitle>Welcome, John!</EmptyTitle>
        <EmptyDescription>
          You don&apos;t have any projects yet. Create your first project to get
          started.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="sm">Get Started</Button>
      </EmptyContent>
    </Empty>
  );
}
