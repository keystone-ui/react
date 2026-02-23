"use client";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@keystoneui/react/avatar";
import { PlusIcon } from "lucide-react";

export default function AvatarBadgeWithIcon() {
  return (
    <Avatar>
      <AvatarImage
        alt="@pranathip"
        src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face"
      />
      <AvatarFallback>PP</AvatarFallback>
      <AvatarBadge>
        <PlusIcon />
      </AvatarBadge>
    </Avatar>
  );
}
