"use client";

import { Command as CommandPrimitive } from "cmdk";
import { CheckIcon, SearchIcon } from "lucide-react";
import type * as React from "react";
import { InputGroup, InputGroupAddon } from "./input-group";
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "./modal";
import { cn, POPUP_ITEM_HEIGHT } from "./utils";

// =============================================================================
// Command (Root)
// =============================================================================
function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      className={cn(
        "flex size-full flex-col overflow-hidden rounded-xl bg-popover p-1 text-popover-foreground",
        className
      )}
      data-slot="command"
      {...props}
    />
  );
}

// =============================================================================
// CommandDialog
// =============================================================================
export interface CommandDialogProps
  extends Omit<React.ComponentProps<typeof Modal>, "children"> {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
  children: React.ReactNode;
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: CommandDialogProps) {
  return (
    <Modal {...props}>
      <ModalContent
        className={cn(
          "top-1/3 translate-y-0 overflow-hidden rounded-xl! p-0",
          className
        )}
        scrollBehavior="inside"
        showCloseButton={showCloseButton}
      >
        <ModalHeader className="sr-only">
          <ModalTitle>{title}</ModalTitle>
          <ModalDescription>{description}</ModalDescription>
        </ModalHeader>
        {children}
      </ModalContent>
    </Modal>
  );
}

// =============================================================================
// CommandInput
// =============================================================================
function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div className="p-1 pb-0" data-slot="command-input-wrapper">
      <InputGroup>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <CommandPrimitive.Input
          className={cn(
            "flex h-10 flex-1 rounded-none border-0 bg-transparent px-3 py-1 text-sm shadow-none outline-hidden dark:bg-transparent",
            "placeholder:text-muted-foreground/70",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          data-slot="input-group-control"
          {...props}
        />
      </InputGroup>
    </div>
  );
}

// =============================================================================
// CommandList
// =============================================================================
function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      className={cn(
        "no-scrollbar max-h-72 scroll-py-1 overflow-y-auto overflow-x-hidden outline-none",
        className
      )}
      data-slot="command-list"
      {...props}
    />
  );
}

// =============================================================================
// CommandEmpty
// =============================================================================
function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      className={cn("py-6 text-center text-sm", className)}
      data-slot="command-empty"
      {...props}
    />
  );
}

// =============================================================================
// CommandGroup
// =============================================================================
function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      className={cn(
        "overflow-hidden p-1 text-foreground **:[[cmdk-group-heading]]:px-1.5 **:[[cmdk-group-heading]]:py-1 **:[[cmdk-group-heading]]:font-medium **:[[cmdk-group-heading]]:text-muted-foreground **:[[cmdk-group-heading]]:text-xs",
        className
      )}
      data-slot="command-group"
      {...props}
    />
  );
}

// =============================================================================
// CommandSeparator
// =============================================================================
function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border-muted", className)}
      data-slot="command-separator"
      {...props}
    />
  );
}

// =============================================================================
// CommandItem
// =============================================================================
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground",
        "not-data-[variant=destructive]:data-[selected=true]:**:text-accent-foreground",
        `group/command-item relative flex ${POPUP_ITEM_HEIGHT} cursor-pointer select-none items-center gap-1.5 rounded-md px-1.5 text-sm outline-hidden`,
        "data-[disabled=true]:pointer-events-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
        "[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className
      )}
      data-slot="command-item"
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  );
}

// =============================================================================
// CommandShortcut
// =============================================================================
function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "ml-auto text-muted-foreground text-xs tracking-widest group-data-[selected=true]/command-item:text-accent-foreground",
        className
      )}
      data-slot="command-shortcut"
      {...props}
    />
  );
}

// =============================================================================
// Exports
// =============================================================================
export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
