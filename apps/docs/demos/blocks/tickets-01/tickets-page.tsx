"use client";

import { arrayMove } from "@dnd-kit/sortable";
import { Button } from "@keystoneui/react/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@keystoneui/react/dropdown-menu";
import {
  SelectionBar,
  SelectionBarBullet,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarGroup,
  SelectionBarLabel,
  SelectionBarLink,
  SelectionBarSeparator,
} from "@keystoneui/react/selection-bar";
import {
  ChevronDownIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  MoreHorizontalIcon,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DeleteTicketsDialog } from "./delete-tickets-dialog";
import {
  channelLabels,
  healthLabels,
  initialTickets,
  priorityLabels,
  statusLabels,
  type Ticket,
  type TicketAssignee,
  type TicketChannel,
  type TicketHealth,
  type TicketPriority,
  type TicketStatus,
  ticketAssignees,
} from "./mock-tickets";
import { NewTicketModal } from "./new-ticket-modal";
import { TicketsPagination } from "./tickets-pagination";
import {
  type SortState,
  type TicketColumnId,
  TicketsTable,
  ticketColumns,
} from "./tickets-table";
import {
  type SortPreset,
  type StatusFilter,
  TicketsToolbar,
  type ViewMode,
} from "./tickets-toolbar";

const ALL_COLUMN_IDS = ticketColumns.map((c) => c.id);

const PRIORITY_RANK: Record<TicketPriority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  todo: 4,
};
const STATUS_RANK: Record<TicketStatus, number> = {
  open: 0,
  pending: 1,
  resolved: 2,
  closed: 3,
};

function sortByPreset(tickets: Ticket[], preset: SortPreset): Ticket[] {
  switch (preset) {
    case "manual":
      return tickets;
    case "priority-desc":
      return [...tickets].sort(
        (a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      );
    case "past-due":
      return [...tickets].sort((a, b) => {
        const aBreached = a.health === "breached" ? 0 : 1;
        const bBreached = b.health === "breached" ? 0 : 1;
        return aBreached - bBreached;
      });
    case "escalated":
      return [...tickets].sort((a, b) => {
        const aUrgent = a.priority === "urgent" ? 0 : 1;
        const bUrgent = b.priority === "urgent" ? 0 : 1;
        return aUrgent - bUrgent;
      });
    default:
      return [...tickets].sort(
        (a, b) =>
          STATUS_RANK[a.status] - STATUS_RANK[b.status] ||
          a.ticketNumber.localeCompare(b.ticketNumber)
      );
  }
}

function applyColumnSort(tickets: Ticket[], sort: SortState): Ticket[] {
  const direction = sort.direction === "desc" ? -1 : 1;
  return [...tickets].sort((a, b) => {
    const av = compareValueFor(a, sort.columnId);
    const bv = compareValueFor(b, sort.columnId);
    if (av === bv) {
      return 0;
    }
    return av < bv ? -1 * direction : 1 * direction;
  });
}

function compareValueFor(ticket: Ticket, columnId: TicketColumnId): string {
  switch (columnId) {
    case "ticketNumber":
      return ticket.ticketNumber;
    case "subject":
      return ticket.subject.toLowerCase();
    case "status":
      return String(STATUS_RANK[ticket.status]);
    case "priority":
      return String(PRIORITY_RANK[ticket.priority]);
    case "assignee":
      return ticket.assignee?.name.toLowerCase() ?? "~unassigned";
    case "category":
      return ticket.category;
    case "channel":
      return ticket.channel;
    case "health":
      return ticket.health;
    default:
      return "";
  }
}

export function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortPreset, setSortPreset] = useState<SortPreset>("manual");
  const [columnSort, setColumnSort] = useState<SortState | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [view, setView] = useState<ViewMode>("table");
  const [visibleColumns, setVisibleColumns] = useState<Set<TicketColumnId>>(
    () => new Set(ALL_COLUMN_IDS)
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [nextTicketSeq, setNextTicketSeq] = useState(initialTickets.length + 1);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const visibleTickets = useMemo(() => {
    let result = tickets;
    if (statusFilter !== "all") {
      result = result.filter((t) => t.status === statusFilter);
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q) ||
          t.assignee?.name.toLowerCase().includes(q)
      );
    }
    result = sortByPreset(result, sortPreset);
    if (columnSort) {
      result = applyColumnSort(result, columnSort);
    }
    return result;
  }, [tickets, statusFilter, searchQuery, sortPreset, columnSort]);

  const pageCount = Math.max(1, Math.ceil(visibleTickets.length / pageSize));
  const paginatedTickets = useMemo(
    () =>
      visibleTickets.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize),
    [visibleTickets, pageIndex, pageSize]
  );

  // Clamp page when the dataset shrinks beneath the current page (e.g. delete or filter).
  useEffect(() => {
    if (pageIndex >= pageCount) {
      setPageIndex(pageCount - 1);
    }
  }, [pageCount, pageIndex]);

  const handleSearchChange = (next: string) => {
    setSearchQuery(next);
    setPageIndex(0);
  };

  const handleStatusFilterChange = (next: StatusFilter) => {
    setStatusFilter(next);
    setPageIndex(0);
  };

  const handlePageSizeChange = (next: number) => {
    setPageSize(next);
    setPageIndex(0);
  };

  const handleToggleRow = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const handleToggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        for (const t of paginatedTickets) {
          next.add(t.id);
        }
      } else {
        for (const t of paginatedTickets) {
          next.delete(t.id);
        }
      }
      return next;
    });
  };

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleSelectAllFiltered = () => {
    setSelectedIds(new Set(visibleTickets.map((t) => t.id)));
  };

  const handleUpdateTicket = (id: string, patch: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  };

  const applyToSelection = (patch: Partial<Ticket>) => {
    setTickets((prev) =>
      prev.map((t) => (selectedIds.has(t.id) ? { ...t, ...patch } : t))
    );
  };

  const handleCreateTicket = (
    draft: Omit<Ticket, "id" | "ticketNumber" | "health">
  ) => {
    const padded = String(nextTicketSeq).padStart(3, "0");
    const newTicket: Ticket = {
      ...draft,
      id: `t-${padded}`,
      ticketNumber: `#-${padded}`,
      health: "on-track",
    };
    setTickets((prev) => [newTicket, ...prev]);
    setNextTicketSeq((seq) => seq + 1);
  };

  const handleConfirmDelete = () => {
    setTickets((prev) => prev.filter((t) => !selectedIds.has(t.id)));
    setSelectedIds(new Set());
  };

  const handleReorder = (activeId: string, overId: string) => {
    setTickets((prev) => {
      const oldIndex = prev.findIndex((t) => t.id === activeId);
      const newIndex = prev.findIndex((t) => t.id === overId);
      if (oldIndex < 0 || newIndex < 0) {
        return prev;
      }
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const toggleColumn = (id: TicketColumnId) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        if (next.size > 1) {
          next.delete(id);
        }
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const selectedCount = selectedIds.size;
  const visibleSelectedCount = visibleTickets.filter((t) =>
    selectedIds.has(t.id)
  ).length;
  const showSelectAllVisibleAction =
    visibleSelectedCount > 0 && visibleSelectedCount < visibleTickets.length;

  return (
    <div className="flex min-h-svh w-full flex-col bg-background">
      <div className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-2">
          <h1 className="font-semibold text-2xl tracking-tight sm:text-3xl">
            Tickets
          </h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <DownloadIcon />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <PlusIcon />
              New Ticket
            </Button>
            <Button
              aria-label="Toggle ticket metrics"
              size="icon"
              variant="ghost"
            >
              <ChevronDownIcon />
            </Button>
          </div>
        </header>

        <TicketsToolbar
          onSearchChange={handleSearchChange}
          onSortPresetChange={setSortPreset}
          onStatusFilterChange={handleStatusFilterChange}
          onToggleColumn={toggleColumn}
          onViewChange={setView}
          searchQuery={searchQuery}
          sortPreset={sortPreset}
          statusFilter={statusFilter}
          view={view}
          visibleColumns={visibleColumns}
        />

        {view === "table" ? (
          <>
            <TicketsTable
              assigneeOptions={ticketAssignees}
              dragEnabled={sortPreset === "manual" && columnSort === null}
              onReorder={handleReorder}
              onSortChange={setColumnSort}
              onToggleAllVisible={handleToggleAllVisible}
              onToggleRow={handleToggleRow}
              onUpdateTicket={handleUpdateTicket}
              selectedIds={selectedIds}
              sort={columnSort}
              tickets={paginatedTickets}
              visibleColumns={visibleColumns}
            />
            <TicketsPagination
              onPageIndexChange={setPageIndex}
              onPageSizeChange={handlePageSizeChange}
              pageIndex={pageIndex}
              pageSize={pageSize}
              selectedCount={selectedCount}
              totalCount={visibleTickets.length}
            />
          </>
        ) : (
          <div className="flex h-[420px] items-center justify-center rounded-xl border border-border border-dashed bg-muted/20 text-muted-foreground text-sm">
            Kanban view coming soon — switch back to Table view to see tickets.
          </div>
        )}
      </div>

      <SelectionBar open={selectedCount > 0}>
        <SelectionBarClose onClick={handleClearSelection} />
        <SelectionBarGroup>
          <SelectionBarLabel>
            {selectedCount} {selectedCount === 1 ? "ticket" : "tickets"}{" "}
            selected
          </SelectionBarLabel>
          {showSelectAllVisibleAction ? (
            <>
              <SelectionBarBullet />
              <SelectionBarLink onClick={handleSelectAllFiltered}>
                Select all {visibleTickets.length}
              </SelectionBarLink>
            </>
          ) : null}
        </SelectionBarGroup>

        <DropdownMenu>
          <DropdownMenuTrigger render={<SelectionBarButton />}>
            Change status
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-40" side="top">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  applyToSelection({ status: value as TicketStatus })
                }
                value=""
              >
                {(["open", "pending", "resolved", "closed"] as const).map(
                  (status) => (
                    <DropdownMenuRadioItem key={status} value={status}>
                      {statusLabels[status]}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<SelectionBarButton />}>
            Assign
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-48" side="top">
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => applyToSelection({ assignee: undefined })}
              >
                Unassigned
              </DropdownMenuItem>
              {ticketAssignees.map((assignee: TicketAssignee) => (
                <DropdownMenuItem
                  key={assignee.name}
                  onClick={() => applyToSelection({ assignee })}
                >
                  {assignee.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger render={<SelectionBarButton />}>
            Priority
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44" side="top">
            <DropdownMenuGroup>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  applyToSelection({ priority: value as TicketPriority })
                }
                value=""
              >
                {(["urgent", "high", "medium", "low", "todo"] as const).map(
                  (priority) => (
                    <DropdownMenuRadioItem key={priority} value={priority}>
                      {priorityLabels[priority]}
                    </DropdownMenuRadioItem>
                  )
                )}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <SelectionBarSeparator />

        <DropdownMenu>
          <DropdownMenuTrigger render={<SelectionBarButton shape="icon" />}>
            <MoreHorizontalIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-52" side="top">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Health</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  applyToSelection({ health: value as TicketHealth })
                }
                value=""
              >
                {(["on-track", "warning", "breached"] as const).map((h) => (
                  <DropdownMenuRadioItem key={h} value={h}>
                    {healthLabels[h]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuLabel>Channel</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                onValueChange={(value) =>
                  applyToSelection({ channel: value as TicketChannel })
                }
                value=""
              >
                {(["email", "chat", "slack"] as const).map((c) => (
                  <DropdownMenuRadioItem key={c} value={c}>
                    {channelLabels[c]}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <SelectionBarButton tone="success">
          <FileSpreadsheetIcon />
          Export CSV
        </SelectionBarButton>
        <SelectionBarButton
          onClick={() => setDeleteOpen(true)}
          tone="destructive"
        >
          <TrashIcon />
          Delete
        </SelectionBarButton>
      </SelectionBar>

      <NewTicketModal
        assigneeOptions={ticketAssignees}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateTicket}
        open={isCreateOpen}
      />

      <DeleteTicketsDialog
        count={selectedCount}
        onConfirm={handleConfirmDelete}
        onOpenChange={setDeleteOpen}
        open={isDeleteOpen}
      />
    </div>
  );
}
