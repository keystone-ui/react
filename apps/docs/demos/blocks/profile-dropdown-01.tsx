"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
} from "@keystoneui/react/circular-progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@keystoneui/react/progress";
import { Separator } from "@keystoneui/react/separator";
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

function ProfileDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative cursor-pointer" type="button">
          <CircularProgress className="size-13" color="default" value={42}>
            <CircularProgressTrack />
            <CircularProgressIndicator />
            <Avatar className="relative" size="lg">
              <AvatarImage
                alt="User"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <span className="absolute right-0 bottom-0 z-10 inline-flex size-5 items-center justify-center rounded-full bg-primary font-bold text-[10px] text-primary-foreground ring-2 ring-background">
              7
            </span>
          </CircularProgress>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-3">
        <div className="rounded-md bg-primary/10 p-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage
                alt="User"
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base">John Doe</span>
                <Badge size="sm" variant="default">
                  Pro
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">$1,250.00</p>
            </div>
            <svg
              className="size-10 shrink-0"
              fill="none"
              viewBox="0 0 40 40"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Level 7</title>
              <path
                d="M20 40C19.4515 40 18.9422 39.8433 18.4721 39.6082L3.78061 31.1459C2.84035 30.5975 2.25269 29.5788 2.25269 28.4819V11.5181C2.25269 10.4212 2.84035 9.40255 3.78061 8.85407L18.4721 0.391773C18.9422 0.117532 19.4515 0 20 0C20.5485 0 21.0578 0.156709 21.5279 0.391773L36.2194 8.85407C37.1596 9.40255 37.7473 10.4212 37.7473 11.5181V28.4819C37.7473 29.5788 37.1596 30.5975 36.2194 31.1459L21.5279 39.6082C21.0578 39.8825 20.5485 40 20 40Z"
                fill="url(#paint0_linear_1745_759)"
              />
              <path
                d="M32.4191 12.0667L20.5876 5.24988C20.1958 5.01481 19.7257 5.01481 19.3731 5.24988L7.54156 12.0667C7.14979 12.3018 6.91473 12.6936 6.91473 13.1245V14.1823C6.91473 13.7514 7.14979 13.3204 7.54156 13.1245L19.3731 6.30767C19.7649 6.0726 20.235 6.0726 20.5876 6.30767L32.4191 13.1245C32.8109 13.3596 33.046 13.7514 33.046 14.1823V13.1245C33.046 12.6936 32.8109 12.2626 32.4191 12.0667Z"
                fill="#9FA4D5"
              />
              <path
                d="M32.4192 27.8552L20.5876 34.672C20.1959 34.9071 19.7258 34.9071 19.3732 34.672L7.54162 27.8552C7.14985 27.6201 6.91479 27.2283 6.91479 26.7974V27.8552C6.91479 28.2861 7.14985 28.7171 7.54162 28.9129L19.3732 35.7298C19.7649 35.9649 20.2351 35.9649 20.5876 35.7298L32.4192 28.9129C32.811 28.6779 33.046 28.2861 33.046 27.8552V26.7974C33.046 27.2283 32.811 27.6593 32.4192 27.8552Z"
                fill="#EDEDED"
              />
              <path
                d="M32.4192 13.1245L20.5876 6.30765C20.1959 6.07258 19.7258 6.07258 19.3732 6.30765L7.54162 13.1245C7.14985 13.3596 6.91479 13.7513 6.91479 14.1823V26.7582C6.91479 27.1891 7.14985 27.6201 7.54162 27.816L19.3732 34.6328C19.7649 34.8679 20.2351 34.8679 20.5876 34.6328L32.4192 27.816C32.811 27.5809 33.046 27.1891 33.046 26.7582V14.1823C33.046 13.7513 32.811 13.3204 32.4192 13.1245Z"
                fill="url(#paint1_linear_1745_759)"
              />
              <path
                d="M27.7963 10.4602L20.6269 6.30743C20.2351 6.07237 19.7649 6.07237 19.4123 6.30743L7.58081 13.1243C7.18903 13.3593 6.95398 13.7511 6.95398 14.1821V22.6444L27.7963 10.421V10.4602Z"
                fill="white"
                opacity="0.1"
              />
              <path
                d="M32.6229 25.3716L33.1261 27.4846L35.2391 27.9878L33.1261 28.491L32.6229 30.604L32.1197 28.491L30.0067 27.9878L32.1197 27.4846L32.6229 25.3716Z"
                fill="#F0F2F5"
              />
              <path
                d="M5.54025 20.4701L5.85869 21.953L7.34161 22.2715L5.85869 22.5899L5.54025 24.0728L5.22181 22.5899L3.73889 22.2715L5.22181 21.953L5.54025 20.4701Z"
                fill="#F0F2F5"
              />
              <text
                dominantBaseline="central"
                fill="#4A4E7E"
                fontFamily="inherit"
                fontSize="14"
                fontWeight="700"
                textAnchor="middle"
                x="20"
                y="20"
              >
                7
              </text>
              <defs>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint0_linear_1745_759"
                  x1="-18.9814"
                  x2="155.749"
                  y1="-1.88051"
                  y2="96.1018"
                >
                  <stop offset="0.1" stopColor="#B9C0E4" />
                  <stop offset="0.3" stopColor="#C0C6E6" />
                  <stop offset="0.5" stopColor="#D3D8EE" />
                  <stop offset="0.8" stopColor="#F4F5FA" />
                  <stop offset="0.9" stopColor="white" />
                </linearGradient>
                <linearGradient
                  gradientUnits="userSpaceOnUse"
                  id="paint1_linear_1745_759"
                  x1="4.52919"
                  x2="38.7582"
                  y1="-16.5673"
                  y2="63.7126"
                >
                  <stop offset="0.5" stopColor="#AEB2DB" />
                  <stop offset="0.9" stopColor="white" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="py-2">
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">Level 7</span>
            <span className="text-muted-foreground">42% to next level</span>
          </div>
          <Progress value={42}>
            <ProgressTrack className="h-1.5">
              <ProgressIndicator />
            </ProgressTrack>
          </Progress>
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
            className="flex cursor-pointer items-center justify-between"
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

        <DropdownMenuItem
          className="-mb-3 flex cursor-pointer items-center justify-center gap-2"
          variant="destructive"
        >
          <LogOut className="size-4" />
          Log Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function ProfileDropdown01() {
  return (
    <div className="flex min-h-[400px] items-start justify-center pt-4">
      <ProfileDropdown />
    </div>
  );
}
