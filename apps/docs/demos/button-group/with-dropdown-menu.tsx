"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  AlertTriangleIcon,
  CheckIcon,
  ChevronDownIcon,
  GitForkIcon,
  StarIcon,
  UserRoundXIcon,
  VolumeOffIcon,
} from "lucide-react";

export default function ButtonGroupWithDropdownMenu() {
  return (
    <div className="flex flex-wrap items-start gap-8">
      <ButtonGroup>
        <Button variant="outline">
          <StarIcon /> Star
        </Button>
        <Button variant="outline">1.2k</Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">
          <GitForkIcon /> Fork
        </Button>
        <Button variant="outline">342</Button>
      </ButtonGroup>

      <ButtonGroup>
        <Button variant="outline">
          <CheckIcon /> Following
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="outline">
                <ChevronDownIcon className="size-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <VolumeOffIcon className="size-4" />
                Mute Conversation
              </DropdownMenuItem>
              <DropdownMenuItem>
                <AlertTriangleIcon className="size-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem>
                <UserRoundXIcon className="size-4" />
                Block User
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </ButtonGroup>
    </div>
  );
}
