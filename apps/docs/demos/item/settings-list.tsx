"use client";

import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@keystoneui/react/item";
import {
  ChevronRightIcon,
  GlobeIcon,
  LockIcon,
  PaletteIcon,
  UserIcon,
} from "lucide-react";

const settings = [
  {
    icon: UserIcon,
    title: "Account",
    description: "Manage your profile and preferences.",
  },
  {
    icon: LockIcon,
    title: "Security",
    description: "Password, two-factor authentication, and sessions.",
  },
  {
    icon: PaletteIcon,
    title: "Appearance",
    description: "Theme, colors, and display settings.",
  },
  {
    icon: GlobeIcon,
    title: "Language & Region",
    description: "Language, timezone, and date format.",
  },
];

export default function ItemSettingsList() {
  return (
    <ItemGroup className="max-w-md">
      {settings.map((setting, index) => (
        <div key={setting.title}>
          {index > 0 && <ItemSeparator />}
          <Item
            render={
              <a href="/settings">
                <ItemMedia variant="icon">
                  <setting.icon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>{setting.title}</ItemTitle>
                  <ItemDescription>{setting.description}</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <ChevronRightIcon className="size-4" />
                </ItemActions>
              </a>
            }
          />
        </div>
      ))}
    </ItemGroup>
  );
}
