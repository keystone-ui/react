"use client";

import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import { Field, FieldDescription, FieldLabel } from "@keystoneui/react/field";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import { Textarea } from "@keystoneui/react/textarea";
import { BotIcon, ChevronDownIcon } from "lucide-react";

export default function ButtonGroupWithPopover() {
  return (
    <ButtonGroup>
      <Button variant="outline">
        <BotIcon />
        Copilot
      </Button>
      <Popover>
        <PopoverTrigger
          render={
            <Button aria-label="Open Popover" size="icon" variant="outline">
              <ChevronDownIcon />
            </Button>
          }
        />
        <PopoverContent align="end" className="rounded-xl text-sm">
          <PopoverHeader>
            <PopoverTitle>Start a new task with Copilot</PopoverTitle>
            <PopoverDescription>
              Describe your task in natural language.
            </PopoverDescription>
          </PopoverHeader>
          <Field>
            <FieldLabel className="sr-only" htmlFor="task">
              Task Description
            </FieldLabel>
            <Textarea
              className="resize-none"
              id="task"
              placeholder="I need to..."
            />
            <FieldDescription>
              Copilot will open a pull request for review.
            </FieldDescription>
          </Field>
        </PopoverContent>
      </Popover>
    </ButtonGroup>
  );
}
