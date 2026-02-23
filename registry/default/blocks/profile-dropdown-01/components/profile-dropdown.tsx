"use client";

import {
  ChevronRight,
  Gift,
  Headset,
  LogOut,
  Settings,
  Star,
  Trophy,
  Wallet,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

export function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="relative size-10 rounded-full" variant="ghost">
          <Avatar size="lg">
            <AvatarImage alt="User" src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage alt="User" src="https://github.com/shadcn.png" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">John Doe</span>
                <Badge size="xs" variant="default">
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">$1,250.00</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-muted-foreground text-xs">Lvl</span>
              <span className="font-bold text-lg">7</span>
            </div>
          </div>
        </div>

        <div className="px-4 py-3">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Level 7</span>
            <span className="text-muted-foreground">Level 8</span>
          </div>
          <Progress value={42}>
            <ProgressTrack className="h-1.5">
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
          <p className="mt-1 text-center text-muted-foreground text-xs">
            42% to next level
          </p>
        </div>

        <Separator />

        {[
          { icon: Wallet, label: "Wallet" },
          { icon: Trophy, label: "Rewards" },
          { icon: Gift, label: "Bonuses" },
          { icon: Star, label: "Points" },
          { icon: Settings, label: "Settings" },
          { icon: Headset, label: "Support" },
        ].map(({ icon: Icon, label }) => (
          <DropdownMenuItem
            className="flex cursor-pointer items-center justify-between px-4 py-3"
            key={label}
          >
            <span className="flex items-center gap-3">
              <Icon className="size-4 text-muted-foreground" />
              {label}
            </span>
            <ChevronRight className="size-4 text-muted-foreground" />
          </DropdownMenuItem>
        ))}

        <Separator />

        <DropdownMenuItem className="flex cursor-pointer items-center justify-center gap-2 px-4 py-3 text-destructive">
          <LogOut className="size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
