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
          src="https://github.com/evilrabbit.png"
        />
        <AvatarFallback>ER</AvatarFallback>
        <AvatarBadge className="bg-green-600 dark:bg-green-800" />
      </Avatar>
      <Avatar>
        <AvatarImage alt="@pranathip" src="https://github.com/pranathip.png" />
        <AvatarFallback>PP</AvatarFallback>
        <AvatarBadge>
          <PlusIcon />
        </AvatarBadge>
      </Avatar>
    </div>
  );
}
