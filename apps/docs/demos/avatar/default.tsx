"use client";

import { Avatar, AvatarFallback, AvatarImage } from "keystoneui/avatar";

export default function AvatarDefault() {
  return (
    <Avatar>
      <AvatarImage alt="@shadcn" src="https://github.com/shadcn.png" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
