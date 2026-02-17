"use client";

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "keystoneui/avatar";
import { PlusIcon } from "lucide-react";

export default function AvatarWithBadge() {
  return (
    <div className="flex items-center gap-4">
      <Avatar>
        <AvatarImage
          alt="@evilrabbit"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face"
        />
        <AvatarFallback>ER</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
      </Avatar>
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
    </div>
  );
}
