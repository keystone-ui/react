"use client";

import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  ComboboxValue,
  useComboboxAnchor,
} from "@keystoneui/react/combobox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@keystoneui/react/drawer";
import { Field, FieldGroup, FieldLabel } from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import {
  Plus as PlusIcon,
  Ticket as TicketIcon,
  X as XIcon,
} from "lucide-react";
import { Fragment, useEffect, useState } from "react";

import {
  categoryLabels,
  channelLabels,
  healthLabels,
  statusLabels,
  type Ticket,
  type TicketAssignee,
  type TicketCategory,
  type TicketChannel,
  type TicketHealth,
  type TicketPriority,
  type TicketStatus,
} from "./mock-tickets";
import { TicketPriorityCell } from "./ticket-priority-cell";

const PRIORITY_OPTIONS: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
];
const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];
const CATEGORY_OPTIONS: TicketCategory[] = [
  "billing",
  "technical",
  "access",
  "subscription",
  "other",
];
const CHANNEL_OPTIONS: TicketChannel[] = ["email", "chat", "slack"];
const HEALTH_OPTIONS: TicketHealth[] = ["on-track", "warning", "breached"];

const UNASSIGNED = "__unassigned";

interface TicketDraft {
  assigneeName: string;
  category: TicketCategory;
  channel: TicketChannel;
  health: TicketHealth;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  tags: string[];
}

interface TicketDetailDrawerProps {
  assigneeOptions: TicketAssignee[];
  availableTags: string[];
  onClose: () => void;
  onSave: (id: string, patch: Partial<Ticket>) => void;
  ticket: Ticket | null;
}

function toDraft(ticket: Ticket): TicketDraft {
  return {
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    channel: ticket.channel,
    health: ticket.health,
    assigneeName: ticket.assignee?.name ?? UNASSIGNED,
    tags: ticket.tags ?? [],
  };
}

export function TicketDetailDrawer({
  ticket,
  assigneeOptions,
  availableTags,
  onClose,
  onSave,
}: TicketDetailDrawerProps) {
  const [draft, setDraft] = useState<TicketDraft | null>(
    ticket ? toDraft(ticket) : null
  );
  const [tagInput, setTagInput] = useState("");
  const tagsAnchor = useComboboxAnchor();

  // Reseed the draft whenever a different ticket is opened.
  useEffect(() => {
    if (ticket) {
      setDraft(toDraft(ticket));
    } else {
      setDraft(null);
    }
  }, [ticket]);

  const handleSave = () => {
    if (!(ticket && draft)) {
      return;
    }
    const assignee =
      draft.assigneeName === UNASSIGNED
        ? undefined
        : assigneeOptions.find((a) => a.name === draft.assigneeName);
    onSave(ticket.id, {
      subject: draft.subject.trim() || ticket.subject,
      status: draft.status,
      priority: draft.priority,
      category: draft.category,
      channel: draft.channel,
      health: draft.health,
      assignee,
      tags: draft.tags,
    });
    onClose();
  };

  return (
    <Drawer
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open={Boolean(ticket)}
      swipeDirection="right"
    >
      <DrawerContent variant="floating">
        {ticket && draft ? (
          <>
            <DrawerHeader className="flex flex-row items-center gap-1 border-b md:gap-1">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                <TicketIcon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <DrawerTitle className="truncate text-base">
                  {ticket.subject}
                </DrawerTitle>
              </div>
              <Badge
                className="font-mono text-xs"
                size="default"
                variant="secondary"
              >
                {ticket.ticketNumber}
              </Badge>
              <DrawerClose
                aria-label="Close"
                render={
                  <Button size="icon-sm" variant="ghost">
                    <XIcon className="size-4" />
                  </Button>
                }
              />
            </DrawerHeader>

            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="ticket-detail-subject">
                    Ticket name
                  </FieldLabel>
                  <Input
                    id="ticket-detail-subject"
                    onChange={(event) =>
                      setDraft((d) =>
                        d ? { ...d, subject: event.target.value } : d
                      )
                    }
                    value={draft.subject}
                  />
                </Field>

                <Field>
                  <FieldLabel>Priority</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value) {
                        setDraft((d) =>
                          d ? { ...d, priority: value as TicketPriority } : d
                        );
                      }
                    }}
                    value={draft.priority}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option} value={option}>
                            <TicketPriorityCell priority={option} />
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Status</FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          setDraft((d) =>
                            d ? { ...d, status: value as TicketStatus } : d
                          );
                        }
                      }}
                      value={draft.status}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {STATUS_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {statusLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Health</FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          setDraft((d) =>
                            d ? { ...d, health: value as TicketHealth } : d
                          );
                        }
                      }}
                      value={draft.health}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {HEALTH_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {healthLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel>Category</FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          setDraft((d) =>
                            d ? { ...d, category: value as TicketCategory } : d
                          );
                        }
                      }}
                      value={draft.category}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {categoryLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field>
                    <FieldLabel>Channel</FieldLabel>
                    <Select
                      onValueChange={(value) => {
                        if (value) {
                          setDraft((d) =>
                            d ? { ...d, channel: value as TicketChannel } : d
                          );
                        }
                      }}
                      value={draft.channel}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {CHANNEL_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              {channelLabels[option]}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Tags</FieldLabel>
                  <TagsCombobox
                    availableTags={availableTags}
                    inputValue={tagInput}
                    onInputValueChange={setTagInput}
                    onValueChange={(next) => {
                      setDraft((d) => (d ? { ...d, tags: next } : d));
                      setTagInput("");
                    }}
                    tagsAnchor={tagsAnchor}
                    value={draft.tags}
                  />
                </Field>

                <Field>
                  <FieldLabel>Assignee</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      if (value) {
                        setDraft((d) =>
                          d ? { ...d, assigneeName: value } : d
                        );
                      }
                    }}
                    value={draft.assigneeName}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
                        {assigneeOptions.map((option) => (
                          <SelectItem key={option.name} value={option.name}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              </FieldGroup>
            </div>

            <DrawerFooter className="flex-row justify-end gap-2 border-t">
              <DrawerClose render={<Button variant="outline">Cancel</Button>} />
              <Button onClick={handleSave}>Save changes</Button>
            </DrawerFooter>
          </>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

interface TagsComboboxProps {
  availableTags: string[];
  inputValue: string;
  onInputValueChange: (next: string) => void;
  onValueChange: (next: string[]) => void;
  tagsAnchor: ReturnType<typeof useComboboxAnchor>;
  value: string[];
}

function TagsCombobox({
  availableTags,
  inputValue,
  onInputValueChange,
  onValueChange,
  tagsAnchor,
  value,
}: TagsComboboxProps) {
  const trimmed = inputValue.trim();
  const lower = trimmed.toLowerCase();
  const exactMatch = availableTags.some((t) => t.toLowerCase() === lower);
  const items =
    trimmed && !exactMatch ? [...availableTags, trimmed] : availableTags;

  return (
    <Combobox
      inputValue={inputValue}
      items={items}
      multiple
      onInputValueChange={onInputValueChange}
      onValueChange={(next) => onValueChange(next as string[])}
      value={value}
    >
      <ComboboxChips className="w-full" ref={tagsAnchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((tag) => (
                <ComboboxChip key={tag}>{tag}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                placeholder={
                  values.length === 0
                    ? "Select existing or type to create…"
                    : ""
                }
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
      <ComboboxContent anchor={tagsAnchor}>
        <ComboboxList>
          {(item: string) => {
            const isCreate = !availableTags.includes(item);
            return (
              <Fragment key={item}>
                {isCreate && <ComboboxSeparator className="first:hidden" />}
                <ComboboxItem value={item}>
                  {isCreate ? (
                    <span className="inline-flex items-center gap-1.5">
                      <PlusIcon className="size-3.5" />
                      Add &quot;{item}&quot;
                    </span>
                  ) : (
                    item
                  )}
                </ComboboxItem>
              </Fragment>
            );
          }}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
