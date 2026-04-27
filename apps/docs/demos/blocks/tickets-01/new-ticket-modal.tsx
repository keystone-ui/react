"use client";

import { Button } from "@keystoneui/react/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from "@keystoneui/react/modal";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@keystoneui/react/select";
import { useState } from "react";

import {
  categoryLabels,
  channelLabels,
  priorityLabels,
  statusLabels,
  type Ticket,
  type TicketAssignee,
  type TicketCategory,
  type TicketChannel,
  type TicketPriority,
  type TicketStatus,
} from "./mock-tickets";

type NewTicketDraft = Omit<Ticket, "id" | "ticketNumber" | "health"> & {
  assigneeName?: string;
};

interface NewTicketModalProps {
  assigneeOptions: TicketAssignee[];
  onOpenChange: (open: boolean) => void;
  onSubmit: (draft: Omit<Ticket, "id" | "ticketNumber" | "health">) => void;
  open: boolean;
}

const initialDraft: NewTicketDraft = {
  subject: "",
  status: "open",
  priority: "medium",
  category: "other",
  channel: "email",
};

export function NewTicketModal({
  open,
  onOpenChange,
  assigneeOptions,
  onSubmit,
}: NewTicketModalProps) {
  const [draft, setDraft] = useState<NewTicketDraft>(initialDraft);
  const [touched, setTouched] = useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setTouched(true);
    if (draft.subject.trim().length === 0) {
      return;
    }

    const assignee = draft.assigneeName
      ? assigneeOptions.find((a) => a.name === draft.assigneeName)
      : undefined;

    onSubmit({
      subject: draft.subject.trim(),
      status: draft.status,
      priority: draft.priority,
      category: draft.category,
      channel: draft.channel,
      assignee,
    });

    setDraft(initialDraft);
    setTouched(false);
    onOpenChange(false);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDraft(initialDraft);
      setTouched(false);
    }
    onOpenChange(next);
  };

  return (
    <Modal onOpenChange={handleOpenChange} open={open}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>New ticket</ModalTitle>
          <ModalDescription>
            Capture an incoming request. You can edit details later.
          </ModalDescription>
        </ModalHeader>

        <form className="contents" onSubmit={handleSubmit}>
          <FieldGroup>
            <Field
              data-invalid={
                touched && draft.subject.trim().length === 0 ? "" : undefined
              }
            >
              <FieldLabel htmlFor="ticket-subject">Subject</FieldLabel>
              <Input
                aria-invalid={
                  touched && draft.subject.trim().length === 0
                    ? true
                    : undefined
                }
                autoFocus
                id="ticket-subject"
                onChange={(event) =>
                  setDraft((d) => ({ ...d, subject: event.target.value }))
                }
                placeholder="Short summary of the issue"
                value={draft.subject}
              />
              {touched && draft.subject.trim().length === 0 ? (
                <FieldDescription className="text-destructive">
                  Subject is required.
                </FieldDescription>
              ) : null}
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      status: value as TicketStatus,
                    }))
                  }
                  value={draft.status}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(["open", "pending", "resolved", "closed"] as const).map(
                        (option) => (
                          <SelectItem key={option} value={option}>
                            {statusLabels[option]}
                          </SelectItem>
                        )
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Priority</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      priority: value as TicketPriority,
                    }))
                  }
                  value={draft.priority}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(
                        ["urgent", "high", "medium", "low", "todo"] as const
                      ).map((option) => (
                        <SelectItem key={option} value={option}>
                          {priorityLabels[option]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      category: value as TicketCategory,
                    }))
                  }
                  value={draft.category}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(
                        [
                          "billing",
                          "technical",
                          "access",
                          "subscription",
                          "other",
                        ] as const
                      ).map((option) => (
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
                  onValueChange={(value) =>
                    setDraft((d) => ({
                      ...d,
                      channel: value as TicketChannel,
                    }))
                  }
                  value={draft.channel}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(["email", "chat", "slack"] as const).map((option) => (
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
              <FieldLabel>Assignee</FieldLabel>
              <Select
                onValueChange={(value) =>
                  setDraft((d) => ({
                    ...d,
                    assigneeName:
                      value === "__unassigned" || value == null
                        ? undefined
                        : (value as string),
                  }))
                }
                value={draft.assigneeName ?? "__unassigned"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="__unassigned">Unassigned</SelectItem>
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

          <ModalFooter>
            <ModalClose render={<Button variant="outline" />}>
              Cancel
            </ModalClose>
            <Button type="submit">Create ticket</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
