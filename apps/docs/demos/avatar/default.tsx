"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";

export default function AvatarDefault() {
  return (
    <Avatar>
      <AvatarImage
        alt="@shadcn"
        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
      />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
