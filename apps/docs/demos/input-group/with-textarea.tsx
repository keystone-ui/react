"use client";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@keystoneui/react/input-group";
import { SendHorizonalIcon } from "lucide-react";

export default function InputGroupWithTextarea() {
  return (
    <div className="max-w-sm">
      <InputGroup>
        <InputGroupTextarea placeholder="Write a message..." rows={3} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Send" size="icon-xs">
            <SendHorizonalIcon className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
