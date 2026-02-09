import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { Calendar } from "@keystone/ui/calendar";
import { Button } from "@keystone/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystone/ui/popover";
import { Field, FieldGroup, FieldLabel } from "@keystone/ui/field";
import { Input } from "@keystone/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@keystone/ui/input-group";
import { addDays, format } from "date-fns";
import { CalendarIcon, ChevronDownIcon } from "lucide-react";
import { parseDate } from "chrono-node";
import { type DateRange } from "react-day-picker";

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Components/Date Picker",
  parameters: {
    docs: {
      description: {
        component: `
The Date Picker is built using a composition of the \`<Popover />\` and the \`<Calendar />\` components.

\`\`\`tsx
import { Calendar } from "@keystone/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@keystone/ui/popover";
import { Button } from "@keystone/ui/button";
import { format } from "date-fns";

<Popover>
  <PopoverTrigger
    render={
      <Button variant="outline" className="justify-start font-normal">
        {date ? format(date, "PPP") : "Pick a date"}
      </Button>
    }
  />
  <PopoverContent className="w-auto p-0">
    <Calendar mode="single" selected={date} onSelect={setDate} />
  </PopoverContent>
</Popover>
\`\`\`

## Installation

The Date Picker requires two components:

- [\`Calendar\`](?path=/docs/components-calendar--docs) — the date selection grid
- [\`Popover\`](?path=/docs/components-popover--docs) — the popup container

## Date Formatting

Use [date-fns format](https://date-fns.org/docs/format) strings:

| Format   | Example               |
|----------|-----------------------|
| \`PPP\`    | June 1st, 2025        |
| \`PP\`     | Jun 1, 2025           |
| \`P\`      | 06/01/2025            |
| \`yyyy-MM-dd\` | 2025-06-01       |
| \`MMMM do, yyyy\` | June 1st, 2025 |
| \`EEE, MMM d\` | Sun, Jun 1        |
`,
      },
    },
  },
} satisfies Meta;

export default meta;
type Story = StoryObj;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return format(date, "MMMM dd, yyyy");
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

// =============================================================================
// Default
// =============================================================================
export const Default: Story = {
  render: function DefaultStory() {
    const [date, setDate] = React.useState<Date>();

    return (
      <Popover>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              data-empty={!date}
              className="data-[empty=true]:text-muted-foreground w-[212px] font-normal [&>span]:w-full [&>span]:justify-between"
            >
              {date ? format(date, "PPP") : <span>Pick a date</span>}
              <ChevronDownIcon className="text-muted-foreground" />
            </Button>
          }
        />
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={date}
          />
        </PopoverContent>
      </Popover>
    );
  },
};

// =============================================================================
// Basic (with label)
// =============================================================================
export const Basic: Story = {
  render: function BasicStory() {
    const [date, setDate] = React.useState<Date>();

    return (
      <Field className="mx-auto w-44">
        <FieldLabel htmlFor="date-picker-simple">Date</FieldLabel>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id="date-picker-simple"
                className="justify-start font-normal"
              >
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story: "A basic date picker with a Field label.",
      },
    },
  },
};

// =============================================================================
// Range
// =============================================================================
export const Range: Story = {
  render: function RangeStory() {
    const [date, setDate] = React.useState<DateRange | undefined>({
      from: new Date(new Date().getFullYear(), 0, 20),
      to: addDays(new Date(new Date().getFullYear(), 0, 20), 20),
    });

    return (
      <Field className="mx-auto w-60">
        <FieldLabel htmlFor="date-picker-range">Date Range</FieldLabel>
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id="date-picker-range"
                className="justify-start px-2.5 font-normal"
              >
                <CalendarIcon data-icon="inline-start" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={setDate}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date range picker using `mode=\"range\"` with two months displayed side by side.",
      },
    },
  },
};

// =============================================================================
// Date of Birth
// =============================================================================
export const DateOfBirth: Story = {
  render: function DateOfBirthStory() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <Field className="mx-auto w-44">
        <FieldLabel htmlFor="dob">Date of birth</FieldLabel>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                id="dob"
                className="justify-start font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
              </Button>
            }
          />
          <PopoverContent
            className="w-auto overflow-hidden p-0"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              defaultMonth={date}
              captionLayout="dropdown"
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date picker with `captionLayout=\"dropdown\"` for easy month and year navigation. Closes on select.",
      },
    },
  },
};

// =============================================================================
// With Input
// =============================================================================
export const WithInput: Story = {
  render: function WithInputStory() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(
      new Date("2025-06-01")
    );
    const [month, setMonth] = React.useState<Date | undefined>(date);
    const [value, setValue] = React.useState(formatDate(date));

    return (
      <Field className="mx-auto w-48">
        <FieldLabel htmlFor="date-input">Subscription Date</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="date-input"
            value={value}
            placeholder="June 01, 2025"
            onChange={(e) => {
              const parsed = new Date(e.target.value);
              setValue(e.target.value);
              if (isValidDate(parsed)) {
                setDate(parsed);
                setMonth(parsed);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <InputGroupButton
                    id="date-picker-input"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Select date"
                  >
                    <CalendarIcon />
                    <span className="sr-only">Select date</span>
                  </InputGroupButton>
                }
              />
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                alignOffset={-8}
                sideOffset={10}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  month={month}
                  onMonthChange={setMonth}
                  onSelect={(date) => {
                    setDate(date);
                    setValue(formatDate(date));
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date picker with a text input field. The input syncs bidirectionally with the calendar — typing a valid date updates the calendar, and selecting a date updates the input. Press ArrowDown to open the calendar.",
      },
    },
  },
};

// =============================================================================
// With Time
// =============================================================================
export const WithTime: Story = {
  render: function WithTimeStory() {
    const [open, setOpen] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);

    return (
      <FieldGroup className="mx-auto max-w-xs flex-row">
        <Field>
          <FieldLabel htmlFor="date-picker-time">Date</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id="date-picker-time"
                  className="w-32 font-normal [&>span]:w-full [&>span]:justify-between"
                >
                  {date ? format(date, "PPP") : "Select date"}
                  <ChevronDownIcon className="text-muted-foreground" />
                </Button>
              }
            />
            <PopoverContent
              className="w-auto overflow-hidden p-0"
              align="start"
            >
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                defaultMonth={date}
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <Field className="w-32">
          <FieldLabel htmlFor="time-picker">Time</FieldLabel>
          <Input
            type="time"
            id="time-picker"
            step="1"
            defaultValue="10:30:00"
            className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
          />
        </Field>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "A date picker alongside a separate time input for combined date and time selection.",
      },
    },
  },
};

// =============================================================================
// Natural Language
// =============================================================================
export const NaturalLanguage: Story = {
  render: function NaturalLanguageStory() {
    const [open, setOpen] = React.useState(false);
    const [value, setValue] = React.useState("In 2 days");
    const [date, setDate] = React.useState<Date | undefined>(
      parseDate(value) || undefined
    );

    return (
      <Field className="mx-auto max-w-xs">
        <FieldLabel htmlFor="date-natural">Schedule Date</FieldLabel>
        <InputGroup>
          <InputGroupInput
            id="date-natural"
            value={value}
            placeholder="Tomorrow or next week"
            onChange={(e) => {
              setValue(e.target.value);
              const parsed = parseDate(e.target.value);
              if (parsed) {
                setDate(parsed);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setOpen(true);
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <InputGroupButton
                    id="date-picker-natural"
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Select date"
                  >
                    <CalendarIcon />
                    <span className="sr-only">Select date</span>
                  </InputGroupButton>
                }
              />
              <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="end"
                sideOffset={8}
              >
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  defaultMonth={date}
                  onSelect={(date) => {
                    setDate(date);
                    setValue(formatDate(date));
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </InputGroupAddon>
        </InputGroup>
        <div className="text-muted-foreground px-1 text-sm">
          Your post will be published on{" "}
          <span className="font-medium">{formatDate(date)}</span>.
        </div>
      </Field>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Uses the `chrono-node` library to parse natural language dates. Try typing "tomorrow", "next week", "in 3 days", or "March 15".',
      },
    },
  },
};

// =============================================================================
// Controlled
// =============================================================================
export const Controlled: Story = {
  render: function ControlledStory() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());
    const [open, setOpen] = React.useState(false);

    return (
      <div className="mx-auto flex max-w-xs flex-col gap-4">
        <Field>
          <FieldLabel htmlFor="date-controlled">Controlled Date</FieldLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
              render={
                <Button
                  variant="outline"
                  id="date-controlled"
                  className="justify-start font-normal"
                >
                  <CalendarIcon data-icon="inline-start" />
                  {date ? format(date, "PPP") : "Pick a date"}
                </Button>
              }
            />
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setOpen(false);
                }}
                defaultMonth={date}
              />
            </PopoverContent>
          </Popover>
        </Field>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setDate(undefined)}
          >
            Clear
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Selected: {date ? format(date, "yyyy-MM-dd") : "none"}
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully controlled date picker with external state management. The selected date can be set or cleared from outside the picker.",
      },
    },
  },
};

// =============================================================================
// Date Formats
// =============================================================================
export const DateFormats: Story = {
  render: function DateFormatsStory() {
    const [date, setDate] = React.useState<Date>(new Date(2025, 5, 1));

    const formats = [
      { label: "PPP", example: "Long" },
      { label: "PP", example: "Medium" },
      { label: "P", example: "Short" },
      { label: "yyyy-MM-dd", example: "ISO" },
      { label: "MMMM do, yyyy", example: "Full" },
      { label: "EEE, MMM d", example: "Compact" },
      { label: "dd/MM/yyyy", example: "EU" },
      { label: "MM/dd/yyyy", example: "US" },
    ];

    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Popover>
          <PopoverTrigger
            render={
              <Button
                variant="outline"
                className="w-fit justify-start font-normal"
              >
                <CalendarIcon data-icon="inline-start" />
                {format(date, "PPP")}
              </Button>
            }
          />
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => d && setDate(d)}
              defaultMonth={date}
            />
          </PopoverContent>
        </Popover>
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="px-3 py-2 text-left font-medium">Format</th>
                <th className="px-3 py-2 text-left font-medium">Code</th>
                <th className="px-3 py-2 text-left font-medium">Result</th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr key={f.label} className="border-b last:border-b-0">
                  <td className="text-muted-foreground px-3 py-2">
                    {f.example}
                  </td>
                  <td className="px-3 py-2">
                    <code className="bg-muted rounded px-1 py-0.5 text-xs">
                      {f.label}
                    </code>
                  </td>
                  <td className="px-3 py-2 font-medium">
                    {format(date, f.label)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Reference for common `date-fns` format strings. Select a date to see how each format renders.",
      },
    },
  },
};
