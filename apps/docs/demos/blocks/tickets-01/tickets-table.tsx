"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Avatar, AvatarFallback, AvatarImage } from "@keystoneui/react/avatar";
import { Button } from "@keystoneui/react/button";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import { Input } from "@keystoneui/react/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@keystoneui/react/table";
import { cn } from "@keystoneui/react/utils";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  ExternalLinkIcon,
  GripVerticalIcon,
  HashIcon,
  MailIcon,
  MessageSquareIcon,
  MinusIcon,
  TagIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useId, useMemo } from "react";

import {
  categoryLabels,
  channelLabels,
  healthLabels,
  priorityLabels,
  statusLabels,
  type Ticket,
  type TicketAssignee,
  type TicketCategory,
  type TicketChannel,
  type TicketHealth,
  type TicketPriority,
  type TicketStatus,
} from "./mock-tickets";
import { TicketChannelCell } from "./ticket-channel-cell";
import { TicketHealthBadge } from "./ticket-health-badge";
import { TicketPriorityCell } from "./ticket-priority-cell";
import { TicketStatusBadge } from "./ticket-status-badge";
import { useCellEditing } from "./use-cell-editing";

export type TicketColumnId =
  | "ticketNumber"
  | "subject"
  | "status"
  | "priority"
  | "assignee"
  | "category"
  | "channel"
  | "health";

interface ColumnDef {
  icon: React.ComponentType<{ className?: string }>;
  id: TicketColumnId;
  label: string;
  /** Whether this column is hidden on small screens. */
  responsive?: boolean;
  width?: string;
}

export const ticketColumns: ColumnDef[] = [
  { id: "ticketNumber", label: "ID", icon: HashIcon, width: "w-[88px]" },
  { id: "subject", label: "Subject", icon: TagIcon },
  {
    id: "status",
    label: "Status",
    icon: ChevronsUpDownIcon,
    width: "w-[140px]",
  },
  {
    id: "priority",
    label: "Priority",
    icon: TriangleAlertIcon,
    width: "w-[140px]",
  },
  { id: "assignee", label: "Assignee", icon: UserDot, width: "w-[180px]" },
  {
    id: "category",
    label: "Category",
    icon: TagIcon,
    width: "w-[140px]",
    responsive: true,
  },
  {
    id: "channel",
    label: "Channel",
    icon: MailIcon,
    width: "w-[120px]",
    responsive: true,
  },
  {
    id: "health",
    label: "Health",
    icon: TimerIcon,
    width: "w-[140px]",
    responsive: true,
  },
];

function UserDot({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <title>Assignee</title>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function TimerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <title>Health</title>
      <circle cx="12" cy="13" r="7" />
      <path d="M12 9v4l2 2" />
    </svg>
  );
}

export type SortDirection = "asc" | "desc" | null;
export interface SortState {
  columnId: TicketColumnId;
  direction: SortDirection;
}

function nextSortDirection(current: SortDirection): SortDirection {
  if (current === null) {
    return "asc";
  }
  if (current === "asc") {
    return "desc";
  }
  return null;
}

const STATUS_OPTIONS: TicketStatus[] = [
  "open",
  "pending",
  "resolved",
  "closed",
];
const PRIORITY_OPTIONS: TicketPriority[] = [
  "urgent",
  "high",
  "medium",
  "low",
  "todo",
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

interface TicketsTableProps {
  assigneeOptions: TicketAssignee[];
  /** When false, drag handles render dimmed and listeners are not attached. */
  dragEnabled: boolean;
  onOpenTicket: (id: string) => void;
  onReorder: (activeId: string, overId: string) => void;
  onSortChange: (next: SortState | null) => void;
  onToggleAllVisible: (checked: boolean) => void;
  onToggleRow: (id: string, checked: boolean) => void;
  onUpdateTicket: (id: string, patch: Partial<Ticket>) => void;
  selectedIds: Set<string>;
  sort: SortState | null;
  tickets: Ticket[];
  visibleColumns: Set<TicketColumnId>;
}

export function TicketsTable({
  tickets,
  assigneeOptions,
  dragEnabled,
  onOpenTicket,
  onReorder,
  selectedIds,
  onToggleRow,
  onToggleAllVisible,
  visibleColumns,
  sort,
  onSortChange,
  onUpdateTicket,
}: TicketsTableProps) {
  const editing = useCellEditing();
  const visibleColumnDefs = ticketColumns.filter((col) =>
    visibleColumns.has(col.id)
  );

  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const ticketIds = useMemo(() => tickets.map((t) => t.id), [tickets]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      onReorder(String(active.id), String(over.id));
    }
  };

  const visibleCount = tickets.length;
  const selectedVisibleCount = tickets.filter((t) =>
    selectedIds.has(t.id)
  ).length;
  const allVisibleSelected =
    visibleCount > 0 && selectedVisibleCount === visibleCount;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  const summary = {
    openCount: tickets.filter((t) => t.status === "open").length,
    urgentCount: tickets.filter((t) => t.priority === "urgent").length,
    unassignedCount: tickets.filter((t) => !t.assignee).length,
    breachedCount: tickets.filter((t) => t.health === "breached").length,
  };

  const handleSubjectCommit = (rowId: string) => {
    const value = editing.draftValue.trim();
    if (value.length > 0) {
      onUpdateTicket(rowId, { subject: value });
    }
    editing.cancel();
  };

  const handleSortClick = (columnId: TicketColumnId) => {
    if (sort?.columnId !== columnId) {
      onSortChange({ columnId, direction: "asc" });
      return;
    }
    const next = nextSortDirection(sort.direction);
    onSortChange(next === null ? null : { columnId, direction: next });
  };

  const renderRowCells = (ticket: Ticket) => (
    <>
      <TableCell className="px-3">
        <Checkbox
          aria-label={`Select ticket ${ticket.ticketNumber}`}
          checked={selectedIds.has(ticket.id)}
          onCheckedChange={(c) => onToggleRow(ticket.id, Boolean(c))}
        />
      </TableCell>
      {visibleColumnDefs.map((column) => (
        <TableCell
          className={cn(
            column.width,
            column.responsive && "hidden lg:table-cell"
          )}
          key={column.id}
        >
          {renderCell({
            ticket,
            columnId: column.id,
            assigneeOptions,
            editing,
            onCommitSubject: () => handleSubjectCommit(ticket.id),
            onOpenTicket,
            onUpdateTicket,
          })}
        </TableCell>
      ))}
    </>
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <DndContext
        collisionDetection={closestCenter}
        id={sortableId}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <Table hoverable>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead aria-hidden="true" className="w-8" />
              <TableHead className="w-10 px-3">
                <SelectAllCheckbox
                  checked={allVisibleSelected}
                  indeterminate={someVisibleSelected}
                  onChange={(checked) => onToggleAllVisible(checked)}
                />
              </TableHead>
              {visibleColumnDefs.map((column) => (
                <TableHead
                  className={cn(
                    column.width,
                    column.responsive && "hidden lg:table-cell"
                  )}
                  key={column.id}
                >
                  <SortableHeader
                    column={column}
                    onClick={() => handleSortClick(column.id)}
                    sort={sort}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody>
            {tickets.length === 0 ? (
              <TableRow>
                <TableCell
                  className="h-32 text-center text-muted-foreground"
                  colSpan={visibleColumnDefs.length + 2}
                >
                  No tickets match your filters.
                </TableCell>
              </TableRow>
            ) : (
              <SortableContext
                items={ticketIds}
                strategy={verticalListSortingStrategy}
              >
                {tickets.map((ticket) => (
                  <DraggableRow
                    dragEnabled={dragEnabled}
                    isSelected={selectedIds.has(ticket.id)}
                    key={ticket.id}
                    ticket={ticket}
                  >
                    {renderRowCells(ticket)}
                  </DraggableRow>
                ))}
              </SortableContext>
            )}
          </TableBody>

          <TableFooter className="bg-muted/30">
            <TableRow>
              <TableCell aria-hidden="true" />
              <TableCell className="px-3" />
              {visibleColumnDefs.map((column) => (
                <TableCell
                  className={cn(
                    "text-muted-foreground text-xs",
                    column.responsive && "hidden lg:table-cell"
                  )}
                  key={column.id}
                >
                  {renderSummary(column.id, tickets.length, summary)}
                </TableCell>
              ))}
            </TableRow>
          </TableFooter>
        </Table>
      </DndContext>
    </div>
  );
}

function DragHandle({ id, disabled }: { id: string; disabled: boolean }) {
  const { attributes, listeners } = useSortable({ id });
  const handleAttrs = disabled ? {} : { ...attributes, ...listeners };

  return (
    <button
      aria-label={
        disabled ? "Switch to Manual sort to reorder" : "Drag to reorder"
      }
      className={cn(
        "inline-flex size-7 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 active:cursor-grabbing",
        disabled && "cursor-not-allowed opacity-40 hover:bg-transparent"
      )}
      disabled={disabled}
      type="button"
      {...handleAttrs}
    >
      <GripVerticalIcon className="size-3.5" />
    </button>
  );
}

function DraggableRow({
  ticket,
  isSelected,
  dragEnabled,
  children,
}: {
  ticket: Ticket;
  isSelected: boolean;
  dragEnabled: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  return (
    <TableRow
      className="group/row relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      data-dragging={isDragging || undefined}
      data-state={isSelected ? "selected" : undefined}
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      <TableCell className="px-1">
        <DragHandle disabled={!dragEnabled} id={ticket.id} />
      </TableCell>
      {children}
    </TableRow>
  );
}

function SortableHeader({
  column,
  sort,
  onClick,
}: {
  column: ColumnDef;
  sort: SortState | null;
  onClick: () => void;
}) {
  const Icon = column.icon;
  const isActive = sort?.columnId === column.id;
  const direction = isActive ? sort.direction : null;
  let SortIcon = ArrowUpDownIcon;
  if (direction === "asc") {
    SortIcon = ArrowUpIcon;
  } else if (direction === "desc") {
    SortIcon = ArrowDownIcon;
  }

  return (
    <button
      className={cn(
        "group inline-flex h-8 w-full cursor-pointer items-center gap-1.5 rounded-md px-1.5 text-left text-muted-foreground text-xs uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground",
        isActive && "text-foreground"
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="font-medium normal-case tracking-normal">
        {column.label}
      </span>
      <SortIcon
        className={cn(
          "ml-auto size-3 shrink-0 transition-opacity",
          isActive ? "opacity-100" : "opacity-0 group-hover:opacity-50"
        )}
      />
    </button>
  );
}

function renderCell({
  ticket,
  columnId,
  assigneeOptions,
  editing,
  onCommitSubject,
  onOpenTicket,
  onUpdateTicket,
}: {
  ticket: Ticket;
  columnId: TicketColumnId;
  assigneeOptions: TicketAssignee[];
  editing: ReturnType<typeof useCellEditing>;
  onCommitSubject: () => void;
  onOpenTicket: (id: string) => void;
  onUpdateTicket: (id: string, patch: Partial<Ticket>) => void;
}) {
  switch (columnId) {
    case "ticketNumber":
      return (
        <span className="font-mono text-muted-foreground text-xs">
          {ticket.ticketNumber}
        </span>
      );

    case "subject": {
      const isEditing = editing.isEditing(ticket.id, "subject");
      if (isEditing) {
        return (
          <Input
            autoFocus
            className="h-8"
            onBlur={onCommitSubject}
            onChange={(event) => editing.setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                onCommitSubject();
              } else if (event.key === "Escape") {
                event.preventDefault();
                editing.cancel();
              }
            }}
            size="sm"
            value={editing.draftValue}
          />
        );
      }
      return (
        <div className="flex items-center justify-between gap-2">
          <button
            className="min-w-0 flex-1 cursor-text truncate rounded-md py-1 text-left text-sm hover:bg-muted/60"
            onClick={() =>
              editing.startEdit(
                { rowId: ticket.id, columnId: "subject" },
                ticket.subject
              )
            }
            type="button"
          >
            {ticket.subject}
          </button>
          <Button
            className="shrink-0 opacity-0 transition-opacity focus-visible:opacity-100 group-hover/row:opacity-100"
            onClick={() => onOpenTicket(ticket.id)}
            size="sm"
            variant="outline"
          >
            <ExternalLinkIcon className="size-3.5" />
            Open
          </Button>
        </div>
      );
    }

    case "status":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="cursor-pointer rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            <TicketStatusBadge status={ticket.status} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onUpdateTicket(ticket.id, {
                    status: value as TicketStatus,
                  })
                }
                value={ticket.status}
              >
                {STATUS_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {statusLabels[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "priority":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="-mx-1.5 inline-flex h-8 cursor-pointer items-center rounded-md px-1.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            <TicketPriorityCell priority={ticket.priority} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onUpdateTicket(ticket.id, {
                    priority: value as TicketPriority,
                  })
                }
                value={ticket.priority}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {priorityLabels[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "assignee":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="-mx-1.5 inline-flex h-8 cursor-pointer items-center rounded-md px-1.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            <AssigneeDisplay assignee={ticket.assignee} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) => {
                  if (value === "__unassigned") {
                    onUpdateTicket(ticket.id, { assignee: undefined });
                    return;
                  }
                  const matched = assigneeOptions.find((a) => a.name === value);
                  if (matched) {
                    onUpdateTicket(ticket.id, { assignee: matched });
                  }
                }}
                value={ticket.assignee?.name ?? "__unassigned"}
              >
                <DropdownMenuRadioItem value="__unassigned">
                  Unassigned
                </DropdownMenuRadioItem>
                {assigneeOptions.map((assignee) => (
                  <DropdownMenuRadioItem
                    key={assignee.name}
                    value={assignee.name}
                  >
                    {assignee.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "category":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="-mx-1.5 inline-flex h-8 cursor-pointer items-center rounded-md px-1.5 text-sm outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            {categoryLabels[ticket.category]}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onUpdateTicket(ticket.id, {
                    category: value as TicketCategory,
                  })
                }
                value={ticket.category}
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {categoryLabels[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "channel":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="-mx-1.5 inline-flex h-8 cursor-pointer items-center rounded-md px-1.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            <TicketChannelCell channel={ticket.channel} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onUpdateTicket(ticket.id, {
                    channel: value as TicketChannel,
                  })
                }
                value={ticket.channel}
              >
                {CHANNEL_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {channelLabels[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    case "health":
      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            className="-mx-1.5 inline-flex h-8 cursor-pointer items-center rounded-md px-1.5 outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-ring/50"
            data-slot="dropdown-menu-trigger"
          >
            <TicketHealthBadge health={ticket.health} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  onUpdateTicket(ticket.id, { health: value as TicketHealth })
                }
                value={ticket.health}
              >
                {HEALTH_OPTIONS.map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {healthLabels[option]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      );

    default:
      return null;
  }
}

function renderSummary(
  columnId: TicketColumnId,
  totalCount: number,
  summary: {
    openCount: number;
    urgentCount: number;
    unassignedCount: number;
    breachedCount: number;
  }
) {
  switch (columnId) {
    case "subject":
      return `${totalCount} ${totalCount === 1 ? "ticket" : "tickets"}`;
    case "status":
      return `${summary.openCount} open`;
    case "priority":
      return `${summary.urgentCount} urgent`;
    case "assignee":
      return `${summary.unassignedCount} unassigned`;
    case "health":
      return `${summary.breachedCount} breached`;
    default:
      return null;
  }
}

function AssigneeDisplay({ assignee }: { assignee?: TicketAssignee }) {
  if (!assignee) {
    return (
      <span className="inline-flex items-center gap-2 text-muted-foreground text-sm">
        <span className="size-5 rounded-full border border-border border-dashed" />
        Unassigned
      </span>
    );
  }

  const initials = assignee.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <span className="inline-flex items-center gap-2 text-sm">
      <Avatar className="size-5">
        {assignee.avatarUrl ? (
          <AvatarImage alt={assignee.name} src={assignee.avatarUrl} />
        ) : null}
        <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
      </Avatar>
      {assignee.name}
    </span>
  );
}

// ---------------------------------------------------------------------------
// SelectAllCheckbox — visually distinguishes indeterminate from checked
// ---------------------------------------------------------------------------

function SelectAllCheckbox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: (next: boolean) => void;
}) {
  if (indeterminate) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: native <input type="checkbox"> can't render a custom indeterminate icon in a way that matches the row checkbox styling
      <button
        aria-checked="mixed"
        aria-label="Toggle selection"
        className="peer relative flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-sm border border-primary bg-primary text-primary-foreground"
        onClick={() => onChange(true)}
        role="checkbox"
        type="button"
      >
        <MinusIcon className="size-3.5" />
      </button>
    );
  }

  return (
    <Checkbox
      aria-label="Select all visible"
      checked={checked}
      onCheckedChange={(next) => onChange(Boolean(next))}
    />
  );
}

// Re-export the icons used in column defs above
export {
  HashIcon,
  MailIcon,
  MessageSquareIcon,
  TagIcon,
  TimerIcon,
  TriangleAlertIcon,
  UserDot,
};
