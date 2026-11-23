import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Button } from "@keystoneui/react/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@keystoneui/react/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { InputGroupAddon } from "@keystoneui/react/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@keystoneui/react/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@keystoneui/react/tooltip";
import { cn, mergeClassName } from "@keystoneui/react/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { countries as countryDataList } from "country-data-list";
import {
  ChevronDown as ChevronDownIcon,
  CircleX as CircleXIcon,
  Globe as GlobeIcon,
  Mail as MailIcon,
  Plus as PlusIcon,
  Search as SearchIcon,
  Trash2 as Trash2Icon,
  X as XIcon,
} from "lucide-react";
import * as React from "react";
import { Fragment, useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { hydrateRoot } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import {
  SiCardano,
  SiDogecoin,
  SiLitecoin,
  SiPolkadot,
  SiRipple,
  SiSolana,
} from "react-icons/si";
import { expect, userEvent, waitFor, within } from "storybook/test";

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  parameters: {
    docs: {
      description: {
        component: `
A filterable select component that allows users to search through predefined options.

\`\`\`tsx
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
} from "@keystoneui/react/combobox";

// Basic usage
<Combobox items={frameworks}>
  <ComboboxInput placeholder="Select a framework" />
  <ComboboxContent>
    <ComboboxEmpty>No items found.</ComboboxEmpty>
    <ComboboxList>
      {(item) => (
        <ComboboxItem key={item} value={item}>
          {item}
        </ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>
\`\`\`

## Features

- Filterable items with keyboard support
- Single and multiple selection
- Clear button support
- Grouped items with labels
- Chips for multi-select display
- Custom item rendering
- Popup mode with trigger button
- Input group addon support
- Form integration
`,
      },
    },
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the combobox is disabled",
    },
    multiple: {
      control: "boolean",
      description: "Whether multiple items can be selected",
    },
    autoHighlight: {
      control: "boolean",
      description: "Whether to auto-highlight the first item",
    },
  },
  subcomponents: {
    ComboboxTrigger,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxGroup,
    ComboboxLabel,
    ComboboxEmpty,
    ComboboxValue,
    ComboboxChips,
    ComboboxChip,
    ComboboxChipsInput,
    ComboboxSeparator,
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof Combobox>;

// Sample data
const frameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
] as const;

// =============================================================================
// Default (Basic)
// =============================================================================
export const Default: Story = {
  render: () => (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Combobox items={frameworks}>
        <ComboboxInput placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>Choose your favorite framework.</FieldDescription>
    </Field>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText(/select a framework/i);
    const body = within(document.body);
    const listbox = () => document.querySelector("[role='listbox']");

    await userEvent.click(input);
    await waitFor(
      async () => {
        await expect(listbox()).toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // Typing filters the list; ArrowDown highlights the first match and
    // Enter commits it into the input and closes the popup.
    await userEvent.keyboard("nu");
    await waitFor(
      async () => {
        await expect(
          body.getByRole("option", { name: /^nuxt\.js$/i })
        ).toBeVisible();
        await expect(
          body.queryByRole("option", { name: /^remix$/i })
        ).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    await userEvent.keyboard("{ArrowDown}");
    await userEvent.keyboard("{Enter}");
    await waitFor(
      async () => {
        await expect(input).toHaveValue("Nuxt.js");
        await expect(listbox()).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );

    // ArrowDown reopens from the keyboard; Escape closes and keeps the value.
    await userEvent.keyboard("{ArrowDown}");
    await waitFor(
      async () => {
        await expect(listbox()).toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    await userEvent.keyboard("{Escape}");
    await waitFor(
      async () => {
        await expect(listbox()).not.toBeInTheDocument();
      },
      { timeout: 5000 }
    );
    await expect(input).toHaveValue("Nuxt.js");
  },
};

// =============================================================================
// Custom Items (Object Values)
// =============================================================================
interface Framework {
  label: string;
  value: string;
}

const frameworkObjects: Framework[] = [
  { label: "Next.js", value: "next" },
  { label: "SvelteKit", value: "sveltekit" },
  { label: "Nuxt", value: "nuxt" },
  { label: "Remix", value: "remix" },
  { label: "Astro", value: "astro" },
];

export const CustomItems: Story = {
  name: "Custom Items (Objects)",
  render: () => (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Combobox
        items={frameworkObjects}
        itemToStringValue={(framework: Framework) => framework.label}
      >
        <ComboboxInput placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(framework) => (
              <ComboboxItem key={framework.value} value={framework}>
                {framework.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>itemToStringValue</code> when your items are objects.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Multiple Selection
// =============================================================================
export const MultipleSelection: Story = {
  name: "Multiple Selection",
  render: () => {
    const anchor = useComboboxAnchor();

    return (
      <Field>
        <FieldLabel>Frameworks</FieldLabel>
        <Combobox
          autoHighlight
          defaultValue={[frameworks[0]]}
          items={frameworks}
          multiple
        >
          <ComboboxChips className="w-full max-w-xs" ref={anchor}>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder="Search..." />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <FieldDescription>
          Use <code>multiple</code> with chips for multi-select behavior.
        </FieldDescription>
      </Field>
    );
  },
};

// =============================================================================
// Multiple Selection With Create
// =============================================================================
export const MultipleSelectionWithCreate: Story = {
  name: "Multiple Selection With Create",
  render: () => {
    const [pool, setPool] = useState<string[]>([...frameworks]);
    const [selected, setSelected] = useState<string[]>([frameworks[0]]);
    const [inputValue, setInputValue] = useState("");
    const anchor = useComboboxAnchor();

    const trimmed = inputValue.trim();
    const lower = trimmed.toLowerCase();
    const exactMatch = pool.some((p) => p.toLowerCase() === lower);
    const items = trimmed && !exactMatch ? [...pool, trimmed] : pool;

    return (
      <Field>
        <FieldLabel>Frameworks</FieldLabel>
        <Combobox
          inputValue={inputValue}
          items={items}
          multiple
          onInputValueChange={setInputValue}
          onValueChange={(next) => {
            const list = next as string[];
            setSelected(list);
            const additions = list.filter((tag) => !pool.includes(tag));
            if (additions.length > 0) {
              setPool((prev) => Array.from(new Set([...prev, ...additions])));
            }
            setInputValue("");
          }}
          value={selected}
        >
          <ComboboxChips className="w-full max-w-xs" ref={anchor}>
            <ComboboxValue>
              {(values: string[]) => (
                <>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput
                    placeholder={
                      values.length === 0 ? "Select or type to create…" : ""
                    }
                  />
                </>
              )}
            </ComboboxValue>
          </ComboboxChips>
          <ComboboxContent anchor={anchor}>
            <ComboboxList>
              {(item: string) => {
                const isCreate = !pool.includes(item);
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
        <FieldDescription>
          Type a value that doesn&apos;t match any existing item to expose an{" "}
          <code>Add &quot;X&quot;</code> row, separated from the list.
        </FieldDescription>
      </Field>
    );
  },
};

// =============================================================================
// With Clear Button
// =============================================================================
export const WithClearButton: Story = {
  name: "With Clear Button",
  render: () => (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Combobox defaultValue={frameworks[0]} items={frameworks}>
        <ComboboxInput placeholder="Select a framework" showClear />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>showClear</code> prop to show a clear button.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Groups
// =============================================================================
const timezones = [
  {
    value: "Americas",
    items: [
      "(GMT-5) New York",
      "(GMT-8) Los Angeles",
      "(GMT-6) Chicago",
      "(GMT-5) Toronto",
      "(GMT-8) Vancouver",
      "(GMT-3) São Paulo",
    ],
  },
  {
    value: "Europe",
    items: [
      "(GMT+0) London",
      "(GMT+1) Paris",
      "(GMT+1) Berlin",
      "(GMT+1) Rome",
      "(GMT+1) Madrid",
      "(GMT+1) Amsterdam",
    ],
  },
  {
    value: "Asia/Pacific",
    items: [
      "(GMT+9) Tokyo",
      "(GMT+8) Shanghai",
      "(GMT+8) Singapore",
      "(GMT+4) Dubai",
      "(GMT+11) Sydney",
      "(GMT+9) Seoul",
    ],
  },
] as const;

// Regression fixture: the icon-only controls' default names give way to a
// consumer's own, and stay true while the list is open. Names live in an
// object, out of quoted name literals, which the stories-vs-demos lint reads
// as story names.
const cityNames = {
  builtIn: "Clear selection",
  city: "City",
  town: "Town",
  chevron: "Options",
  native: "Effacer la ville",
  labelledBy: "Forget the city",
  remix: "Remove Remix",
  elm: "Remove Elm",
  cluj: "Remove Cluj",
  newYork: "Remove New York",
  arad: "Remove Arad",
  title: "Vider",
  visible: "Reset cities",
  paris: "Remove Paris",
  lyon: "Remove Lyon",
  remixPlain: "Remove Remix",
  ariaClear: "Effacer",
  renderClear: "Effacer la ville en cours",
  tooltipClear: "Effacer avec info-bulle",
  outsideTooltipClear: "Vider avec info-bulle",
  emptyTown: "Empty town",
  clearCountry: "Clear country",
  forwardedTitle: "Effacer le pays",
} as const;

// A label whose text changes on an event, after mount.
const RenamingCity = () => {
  const [city, setCity] = useState("Paris");
  React.useEffect(() => {
    const rename = () => setCity("Lyon");
    window.addEventListener("rename-story-city", rename);
    return () => window.removeEventListener("rename-story-city", rename);
  }, []);
  return <strong>{city}</strong>;
};

// A label that says "Paris" in server markup and "Lyon" once hydrated.
const CityAfterHydration = () => {
  const [city, setCity] = useState("Paris");
  React.useEffect(() => setCity("Lyon"), []);
  return <strong>{city}</strong>;
};

const HydrationChips = () => (
  <Combobox
    defaultValue={["Paris", "Remix"]}
    items={["Paris", "Remix"]}
    multiple
  >
    <ComboboxChips>
      <ComboboxValue>
        {(values: string[]) =>
          values.map((value) => (
            <ComboboxChip key={value}>
              {value === "Paris" ? <CityAfterHydration /> : value}
            </ComboboxChip>
          ))
        }
      </ComboboxValue>
    </ComboboxChips>
  </Combobox>
);

// origin/main's ComboboxChip, copied verbatim (before the remove button was
// named), so the library chip's layout is compared with it in the same run.
function mainWrapText(children: React.ReactNode, className: string) {
  const out: React.ReactNode[] = [];
  let text = "";
  const flush = () => {
    if (text) {
      out.push(
        <span className={className} key={`text-${out.length}`}>
          {text}
        </span>
      );
      text = "";
    }
  };
  for (const child of React.Children.toArray(children)) {
    if (typeof child === "string" || typeof child === "number") {
      text += child;
    } else {
      flush();
      out.push(child);
    }
  }
  flush();
  return out;
}

type LayoutChipProps = ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean;
  removeLabel?: string;
};

function MainChip({
  className,
  children,
  showRemove = true,
  removeLabel: _removeLabel,
  ...props
}: LayoutChipProps) {
  return (
    <ComboboxPrimitive.Chip
      className={mergeClassName(
        cn(
          "flex h-5.5 w-fit min-w-0 max-w-full items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-muted px-1.5 font-medium text-foreground text-xs",
          "has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50",
          "has-data-[slot=combobox-chip-remove]:pr-0"
        ),
        className
      )}
      data-slot="combobox-chip"
      {...props}
    >
      {mainWrapText(children, "min-w-0 truncate")}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          className="-ml-1 size-5 shrink-0 opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          render={<Button size="icon" variant="ghost" />}
        >
          <XIcon className="pointer-events-none size-3" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  );
}

const ElementThenText = () => (
  <>
    <strong>Big</strong>Elm
  </>
);

// The layout fixtures of the design's comparison with origin/main.
const layoutFixtures: Record<
  string,
  {
    children: React.ReactNode;
    className?: string;
    width?: number;
    extra?: Partial<LayoutChipProps>;
  }
> = {
  text: { children: "Elm" },
  iconThenTextArray: {
    children: [<MailIcon aria-hidden="true" key="icon" />, "Elm"],
  },
  fragmentIconBareText: {
    children: (
      <>
        <MailIcon aria-hidden="true" />
        Elm
      </>
    ),
  },
  twoElements: {
    children: (
      <>
        <strong>New</strong>
        <em>York</em>
      </>
    ),
  },
  componentElThenBareText: { children: <ElementThenText /> },
  iconOnly: { children: <MailIcon aria-hidden="true" /> },
  empty: { children: null },
  wrapNarrow: {
    children: (
      <>
        <strong>Silver</strong>
        <em>Spring</em>
      </>
    ),
    className: "h-auto flex-wrap gap-2 px-2",
    width: 74,
  },
  between240: {
    children: (
      <>
        <strong>East</strong>
        <em>Bay</em>
      </>
    ),
    className: "w-full justify-between",
    width: 240,
  },
  reverse240: {
    children: (
      <>
        <strong>East</strong>
        <em>Bay</em>
      </>
    ),
    className: "flex-row-reverse",
    width: 240,
  },
  longText: { children: "Llanfairpwllgwyngyll station", width: 130 },
  removeLabel: { children: "Paris", extra: { removeLabel: "Drop it" } },
  noRemove: { children: "Paris", extra: { showRemove: false } },
};

const LayoutCompare = () => (
  <div className="flex flex-col gap-1">
    {(["ltr", "rtl"] as const).flatMap((dir) =>
      Object.entries(layoutFixtures).flatMap(([key, fixture]) =>
        (["main", "library"] as const).map((variant) => {
          const Chip = variant === "main" ? MainChip : ComboboxChip;
          return (
            <div
              data-case={key}
              data-dir={dir}
              data-variant={variant}
              dir={dir}
              key={`${dir}-${key}-${variant}`}
            >
              <Combobox defaultValue={["x"]} items={["x"]} multiple>
                <ComboboxChips style={{ width: fixture.width ?? 420 }}>
                  <ComboboxValue>
                    {() => (
                      <Chip className={fixture.className} {...fixture.extra}>
                        {fixture.children}
                      </Chip>
                    )}
                  </ComboboxValue>
                </ComboboxChips>
              </Combobox>
            </div>
          );
        })
      )
    )}
  </div>
);

// The chip's box and each visible part's box relative to it.
function chipGeometry(host: Element) {
  const chip = host.querySelector('[data-slot="combobox-chip"]');
  if (!chip) {
    return null;
  }
  const c = chip.getBoundingClientRect();
  const round = (v: number) => Math.round(v * 100) / 100;
  const box = (b: DOMRect) =>
    [b.left - c.left, b.top - c.top, b.width, b.height].map(round);
  const parts: [string, number[]][] = [];
  const walk = (node: Node) => {
    for (const child of node.childNodes) {
      if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) {
        const range = document.createRange();
        range.selectNodeContents(child);
        parts.push([
          `#${child.textContent.trim()}`,
          box(range.getBoundingClientRect()),
        ]);
      } else if (child instanceof Element && !child.hasAttribute("hidden")) {
        parts.push([
          child.tagName.toLowerCase(),
          box(child.getBoundingClientRect()),
        ]);
        if (child.tagName !== "svg" && child.tagName !== "BUTTON") {
          walk(child);
        }
      }
    }
  };
  walk(chip);
  return { chip: [round(c.width), round(c.height)], parts };
}

const RichChips = () => {
  const anchor = useComboboxAnchor();
  return (
    <Combobox
      defaultValue={["Remix", "Elm", "Cluj", "New York", "Arad"]}
      items={["Remix", "Elm", "Cluj", "New York", "Arad"]}
      multiple
    >
      <ComboboxChips ref={anchor}>
        <ComboboxValue>
          {(values: string[]) => (
            <>
              {values.map((value) => {
                if (value === "Remix") {
                  return (
                    <ComboboxChip key={value}>
                      <strong>{value}</strong>
                    </ComboboxChip>
                  );
                }
                if (value === "Cluj") {
                  // Text hidden by CSS is not part of the name.
                  return (
                    <ComboboxChip key={value}>
                      <span style={{ display: "none" }}>Bucharest</span>
                      <strong>{value}</strong>
                    </ComboboxChip>
                  );
                }
                if (value === "Arad") {
                  // Bare text after an element, inside a Fragment.
                  return (
                    <ComboboxChip key={value}>
                      <>
                        <MailIcon aria-hidden="true" />
                        {value}
                      </>
                    </ComboboxChip>
                  );
                }
                if (value === "New York") {
                  // Two flex items: the name keeps the space the gap shows.
                  return (
                    <ComboboxChip data-testid="two-element-chip" key={value}>
                      <strong>New</strong>
                      <em>York</em>
                    </ComboboxChip>
                  );
                }
                return (
                  <ComboboxChip key={value}>
                    <MailIcon aria-hidden="true" />
                    {value}
                  </ComboboxChip>
                );
              })}
              <ComboboxChipsInput aria-label="Frameworks" />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>
    </Combobox>
  );
};

export const ControlNames: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div data-testid="built-in">
        <Combobox defaultValue="Alba" items={["Alba", "Cluj"]}>
          <ComboboxInput aria-label="City" showClear />
        </Combobox>
      </div>
      <div data-testid="chevron">
        <Combobox items={["Alba", "Cluj"]}>
          <ComboboxInput aria-label="Town" />
          <ComboboxContent>
            <ComboboxList>
              {(item: string) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div data-testid="overrides">
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear render={<button type="button">Reset cities</button>} />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <label htmlFor="clear-city">Effacer la ville</label>
          <ComboboxClear id="clear-city" />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear title="Vider" />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <span id="clear-name">Forget the city</span>
          <ComboboxClear aria-labelledby="clear-name" />
        </Combobox>
      </div>
      <div data-testid="undefined-label">
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear aria-label={undefined} />
        </Combobox>
      </div>
      <div data-testid="no-description">
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear aria-label={cityNames.ariaClear} />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear
            render={<button aria-label={cityNames.renderClear} type="button" />}
          />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <Tooltip>
            <ComboboxClear
              render={<TooltipTrigger aria-label={cityNames.tooltipClear} />}
            />
            <TooltipContent>Effacer</TooltipContent>
          </Tooltip>
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <Tooltip>
            <TooltipTrigger
              render={
                <ComboboxClear aria-label={cityNames.outsideTooltipClear} />
              }
            />
            <TooltipContent>Vider</TooltipContent>
          </Tooltip>
        </Combobox>
      </div>
      <div data-testid="replacements">
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear
            render={
              <button aria-label={cityNames.emptyTown} type="button">
                <Trash2Icon />
              </button>
            }
          />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear
            render={(props) => (
              <button {...props} type="button">
                Clear country
              </button>
            )}
          />
        </Combobox>
        <Combobox defaultValue="Alba" items={["Alba"]}>
          <ComboboxClear
            render={(props) => <button {...props} type="button" />}
            title={cityNames.forwardedTitle}
          />
        </Combobox>
      </div>
      <div data-testid="rich-chips">
        <RichChips />
      </div>
      <div data-testid="live-chip">
        <Combobox defaultValue={["Paris"]} items={["Paris"]} multiple>
          <ComboboxChips>
            <ComboboxValue>
              {() => (
                <ComboboxChip>
                  <RenamingCity />
                </ComboboxChip>
              )}
            </ComboboxValue>
          </ComboboxChips>
        </Combobox>
      </div>
      <div data-testid="hydration" />
      <div data-testid="layout">
        <LayoutCompare />
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const overrides = within(canvas.getByTestId("overrides"));
    for (const name of [
      cityNames.visible,
      cityNames.native,
      cityNames.title,
      cityNames.labelledBy,
    ]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(overrides.getByRole("button", { name })).toBeVisible();
    }
    await expect(
      overrides.queryByRole("button", { name: cityNames.builtIn })
    ).not.toBeInTheDocument();
    await expect(
      within(canvas.getByTestId("undefined-label")).getByRole("button", {
        name: cityNames.builtIn,
      })
    ).toBeVisible();

    // Rich chips: each remove button is named after what the chip shows.
    const rich = within(canvas.getByTestId("rich-chips"));
    await expect(
      rich.getByRole("button", { name: cityNames.remix })
    ).toBeVisible();
    await expect(
      rich.getByRole("button", { name: cityNames.elm })
    ).toBeVisible();
    await expect(
      rich.getByRole("button", { name: cityNames.cluj })
    ).toBeVisible();
    await expect(
      rich.getByRole("button", { name: cityNames.newYork })
    ).toBeVisible();
    await expect(
      rich.getByRole("button", { name: cityNames.arad })
    ).toBeVisible();
    // The chip's children are its own flex items, a gap apart.
    const twoElement = rich.getByTestId("two-element-chip");
    const [first, second] = [
      twoElement.querySelector("strong"),
      twoElement.querySelector("em"),
    ].map((part) => part?.getBoundingClientRect());
    await expect(twoElement.querySelector("strong")?.parentElement).toBe(
      twoElement
    );
    await expect((second?.left ?? 0) - (first?.right ?? 0)).toBeCloseTo(
      Number.parseFloat(getComputedStyle(twoElement).columnGap),
      1
    );

    // A child that changes its own text renames the button.
    const live = within(canvas.getByTestId("live-chip"));
    await expect(
      live.getByRole("button", { name: cityNames.paris })
    ).toBeVisible();
    window.dispatchEvent(new Event("rename-story-city"));
    await waitFor(() =>
      expect(live.getByRole("button", { name: cityNames.lyon })).toBeVisible()
    );

    // Server markup names each button, and a hydration effect renames it.
    // Each button references its own word and then its own chip, in order.
    const host = canvas.getByTestId("hydration");
    host.innerHTML = renderToString(<HydrationChips />, {
      identifierPrefix: "hydrated-",
    });
    const removeButtons = () => [
      ...host.querySelectorAll('[data-slot="combobox-chip-remove"]'),
    ];
    const expectOrderedRefs = (button: Element) => {
      const [word, chipRef, ...rest] = (
        button.getAttribute("aria-labelledby") ?? ""
      ).split(" ");
      expect(document.getElementById(word ?? "")?.parentElement).toBe(button);
      expect(document.getElementById(chipRef ?? "")).toBe(
        button.closest('[data-slot="combobox-chip"]')
      );
      expect(rest).toEqual([]);
    };
    await expect(removeButtons()).toHaveLength(2);
    await expect(removeButtons()[0]).toHaveAccessibleName(cityNames.paris);
    await expect(removeButtons()[1]).toHaveAccessibleName(cityNames.remixPlain);
    removeButtons().forEach(expectOrderedRefs);
    const hydrationErrors: unknown[] = [];
    const root = hydrateRoot(host, <HydrationChips />, {
      identifierPrefix: "hydrated-",
      onRecoverableError: (error) => hydrationErrors.push(error),
    });
    await waitFor(() =>
      expect(removeButtons()[0]).toHaveAccessibleName(cityNames.lyon)
    );
    await expect(removeButtons()[1]).toHaveAccessibleName(cityNames.remixPlain);
    removeButtons().forEach(expectOrderedRefs);
    await expect(hydrationErrors).toEqual([]);
    root.unmount();

    // Chip layout equals origin/main's chip, measured in this same run.
    const layout = canvas.getByTestId("layout");
    for (const dir of ["ltr", "rtl"]) {
      for (const key of Object.keys(layoutFixtures)) {
        const at = (variant: string) =>
          layout.querySelector(
            `[data-case="${key}"][data-dir="${dir}"][data-variant="${variant}"]`
          ) as Element;
        // biome-ignore lint/performance/noAwaitInLoops: one case at a time
        await expect({ dir, key, box: chipGeometry(at("library")) }).toEqual({
          dir,
          key,
          box: chipGeometry(at("main")),
        });
      }
    }
    // The narrow wrapping chip keeps each word inside it, over several lines.
    const wrapChip = layout.querySelector(
      '[data-case="wrapNarrow"][data-dir="ltr"][data-variant="library"] [data-slot="combobox-chip"]'
    ) as HTMLElement;
    const wrapBox = wrapChip.getBoundingClientRect();
    await expect(wrapBox.height).toBeGreaterThan(60);
    for (const word of wrapChip.querySelectorAll("strong, em")) {
      const box = word.getBoundingClientRect();
      // biome-ignore lint/performance/noAwaitInLoops: one word at a time
      await expect(box.left >= wrapBox.left && box.right <= wrapBox.right).toBe(
        true
      );
    }

    // No English description on a consumer's name, and no library title.
    const noDescription = within(canvas.getByTestId("no-description"));
    for (const name of [cityNames.ariaClear, cityNames.renderClear]) {
      const button = noDescription.getByRole("button", { name });
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(button).not.toHaveAccessibleDescription();
      await expect(button).not.toHaveAttribute("title");
    }
    // The tooltip cases are read while their own tooltip is open, one at a
    // time: only one tooltip is open at once.
    const openTooltips = () => [
      ...document.querySelectorAll('[data-slot="tooltip-content"][data-open]'),
    ];
    for (const [name, tip] of [
      [cityNames.tooltipClear, "Effacer"],
      [cityNames.outsideTooltipClear, "Vider"],
    ] as const) {
      const button = noDescription.getByRole("button", { name });
      // biome-ignore lint/performance/noAwaitInLoops: one tooltip at a time
      await userEvent.hover(button);
      await waitFor(
        () => {
          expect(button).toHaveAttribute("data-popup-open");
          expect(openTooltips()).toHaveLength(1);
          expect(openTooltips()[0]).toHaveTextContent(tip);
          expect(openTooltips()[0]).toBeVisible();
        },
        { timeout: 3000 }
      );
      await expect(button).toHaveAccessibleName(name);
      await expect(button).not.toHaveAttribute("title");
      await expect(button).not.toHaveAccessibleDescription();
      await userEvent.unhover(button);
      await waitFor(
        () => expect(button).not.toHaveAttribute("data-popup-open"),
        { timeout: 3000 }
      );
    }
    const native = overrides.getByRole("button", { name: cityNames.native });
    await expect(native).not.toHaveAccessibleDescription();
    await expect(native).not.toHaveAttribute("title");

    // The documented replacements name the button.
    const replacements = within(canvas.getByTestId("replacements"));
    for (const name of [
      cityNames.emptyTown,
      cityNames.clearCountry,
      cityNames.forwardedTitle,
    ]) {
      // biome-ignore lint/performance/noAwaitInLoops: one case at a time
      await expect(replacements.getByRole("button", { name })).toBeVisible();
    }

    // The chevron keeps a true name closed and opened from a real keyboard
    // (a synthetic Enter is a click to Base UI, which moves focus to the
    // input and hides the chevron, so it would not test this).
    const chevronBox = within(canvas.getByTestId("chevron"));
    const chevron = chevronBox.getByRole("button", { name: cityNames.chevron });
    await expect(chevron).toHaveAttribute("aria-expanded", "false");
    const user = (
      globalThis as {
        __realUserEvent?: typeof import("vitest/browser").userEvent;
      }
    ).__realUserEvent;
    if (user) {
      chevronBox.getByRole("combobox", { name: cityNames.town }).focus();
      await user.keyboard("{Tab}");
      await expect(chevron).toHaveFocus();
      for (const key of ["{Enter}", " "]) {
        // biome-ignore lint/performance/noAwaitInLoops: one key at a time
        await user.keyboard(key);
        await waitFor(() =>
          expect(chevron).toHaveAttribute("aria-expanded", "true")
        );
        // Base UI marks the addon aria-hidden while the list is open, so
        // a role query cannot see the focused chevron; its name is checked
        // on the element.
        await expect(chevron).toHaveFocus();
        await expect(chevron).toHaveAccessibleName(cityNames.chevron);
        await user.keyboard("{Escape}");
        await waitFor(() =>
          expect(chevron).toHaveAttribute("aria-expanded", "false")
        );
        chevron.focus();
      }
    }

    // The built-in clear is named by hidden text in a 24px box that does not
    // overflow, carries no title, and clears by that name.
    const builtIn = within(canvas.getByTestId("built-in"));
    const clear = builtIn.getByRole("button", { name: cityNames.builtIn });
    const clearBox = clear.getBoundingClientRect();
    await expect([clearBox.width, clearBox.height]).toEqual([24, 24]);
    await expect(clear.scrollWidth).toBeLessThanOrEqual(clear.clientWidth);
    await expect(clear.scrollHeight).toBeLessThanOrEqual(clear.clientHeight);
    await expect(clear.textContent).toBe(cityNames.builtIn);
    await expect(clear).not.toHaveAttribute("title");
    await expect(clear).not.toHaveAccessibleDescription();
    await userEvent.click(clear);
    await waitFor(() =>
      expect(
        builtIn.getByRole("combobox", { name: cityNames.city })
      ).toHaveValue("")
    );
  },
};

export const Groups: Story = {
  render: () => (
    <Field>
      <FieldLabel>Timezone</FieldLabel>
      <Combobox items={timezones}>
        <ComboboxInput className="w-56" placeholder="Select a timezone" />
        <ComboboxContent>
          <ComboboxEmpty>No timezones found.</ComboboxEmpty>
          <ComboboxList>
            {(group, index) => (
              <ComboboxGroup items={group.items} key={group.value}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
                {index < timezones.length - 1 && <ComboboxSeparator />}
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>ComboboxGroup</code> and <code>ComboboxSeparator</code> to
        group items.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Custom Items with Description
// =============================================================================
const countries = countryDataList.all
  .filter(
    (c: { status: string; emoji?: string }) =>
      c.status === "assigned" && c.emoji
  )
  .map((c: { alpha2: string; name: string }) => ({
    code: c.alpha2.toLowerCase(),
    value: c.name.toLowerCase().replace(/\s+/g, "-"),
    label: c.name,
  }))
  .sort((a: { label: string }, b: { label: string }) =>
    a.label.localeCompare(b.label)
  );

export const CustomItemsWithDescription: Story = {
  name: "Custom Items with Description",
  render: () => (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Combobox
        items={countries}
        itemToStringValue={(country: (typeof countries)[number]) =>
          country.label
        }
      >
        <ComboboxInput className="w-64" placeholder="Search countries..." />
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(country) => (
              <ComboboxItem className="py-2" key={country.code} value={country}>
                <div className="flex flex-col">
                  <span className="font-medium">{country.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {country.code.toUpperCase()}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        You can render custom content inside <code>ComboboxItem</code>.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Countries with Flags
// =============================================================================
function CountriesWithFlagsExample() {
  const anchor = useComboboxAnchor();
  const [selected, setSelected] = useState<(typeof countries)[number] | null>(
    null
  );
  return (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Combobox
        items={countries}
        itemToStringValue={(country: (typeof countries)[number]) =>
          country.label
        }
        onValueChange={setSelected}
        value={selected}
      >
        <div className="w-64" ref={anchor}>
          <ComboboxInput placeholder="Search countries...">
            {selected && (
              <InputGroupAddon align="inline-start">
                <CircleFlag
                  className="size-5 shrink-0"
                  countryCode={selected.code}
                />
              </InputGroupAddon>
            )}
          </ComboboxInput>
        </div>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(country) => (
              <ComboboxItem key={country.code} value={country}>
                <CircleFlag
                  className="size-5 shrink-0"
                  countryCode={country.code}
                />
                <span>{country.label}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>react-circle-flags</code> to display flags alongside country
        names.
      </FieldDescription>
    </Field>
  );
}

export const CountriesWithFlags: Story = {
  name: "Countries with Flags",
  render: () => <CountriesWithFlagsExample />,
};

// =============================================================================
// Invalid
// =============================================================================
export const Invalid: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Framework</FieldLabel>
      <Combobox items={frameworks}>
        <ComboboxInput aria-invalid="true" placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError>Please select a framework.</FieldError>
    </Field>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `aria-invalid` prop on `ComboboxInput` to show an error state.",
      },
    },
  },
};

// =============================================================================
// Disabled
// =============================================================================
export const Disabled: Story = {
  render: () => (
    <FieldGroup className="w-full max-w-xs">
      <Field>
        <FieldLabel>Disabled Combobox</FieldLabel>
        <Combobox items={frameworks}>
          <ComboboxInput disabled placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
      <Field>
        <FieldLabel>Disabled Items</FieldLabel>
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem
                  disabled={item === "Remix" || item === "Astro"}
                  key={item}
                  value={item}
                >
                  {item}
                  {(item === "Remix" || item === "Astro") && " (unavailable)"}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </Field>
    </FieldGroup>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `disabled` prop on `ComboboxInput` to disable the entire combobox, or on individual `ComboboxItem` components to disable specific options.",
      },
    },
  },
};

// =============================================================================
// Auto Highlight
// =============================================================================
export const AutoHighlight: Story = {
  name: "Auto Highlight",
  render: () => (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Combobox autoHighlight items={frameworks}>
        <ComboboxInput placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>autoHighlight</code> to automatically highlight the first item
        on filter.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Popup (Button Trigger)
// =============================================================================
export const Popup: Story = {
  render: () => (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Combobox
        items={countries}
        itemToStringValue={(country: (typeof countries)[number]) =>
          country.label
        }
      >
        <ComboboxTrigger
          render={
            <Button
              className="w-64 justify-between font-normal focus-visible:border-ring focus-visible:outline-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
              variant="outline"
            >
              <ComboboxValue placeholder="Select a country" />
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput placeholder="Search" showTrigger={false} />
          <ComboboxSeparator className="my-0" />
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item.code} value={item}>
                {item.label}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use a button trigger with the input inside the popup for a searchable
        select pattern.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Popup Crypto
// =============================================================================
const cryptocurrencies = [
  {
    symbol: "BTC",
    label: "Bitcoin",
    value: 0.002_34,
    icon: FaBitcoin,
  },
  {
    symbol: "ETH",
    label: "Ethereum",
    value: 1.2451,
    icon: FaEthereum,
  },
  {
    symbol: "SOL",
    label: "Solana",
    value: 12.847,
    icon: SiSolana,
  },
  {
    symbol: "ADA",
    label: "Cardano",
    value: 892.31,
    icon: SiCardano,
  },
  {
    symbol: "DOT",
    label: "Polkadot",
    value: 45.621,
    icon: SiPolkadot,
  },
  {
    symbol: "LTC",
    label: "Litecoin",
    value: 3.8742,
    icon: SiLitecoin,
  },
  {
    symbol: "DOGE",
    label: "Dogecoin",
    value: 15_420.5,
    icon: SiDogecoin,
  },
  {
    symbol: "XRP",
    label: "Ripple",
    value: 523.84,
    icon: SiRipple,
  },
];

export const PopupCrypto: Story = {
  name: "Popup Crypto",
  render: () => (
    <Field>
      <FieldLabel>Cryptocurrency</FieldLabel>
      <Combobox
        items={cryptocurrencies}
        itemToStringValue={(crypto: (typeof cryptocurrencies)[number]) =>
          crypto.label
        }
      >
        <ComboboxTrigger
          render={
            <Button
              className="w-64 justify-between font-normal focus-visible:border-ring focus-visible:outline-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset"
              variant="outline"
            >
              <ComboboxValue placeholder="Select cryptocurrency" />
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput placeholder="Search" showTrigger={false}>
            <InputGroupAddon align="inline-start">
              <SearchIcon className="size-4 text-muted-foreground" />
            </InputGroupAddon>
          </ComboboxInput>
          <ComboboxSeparator className="my-0" />
          <ComboboxEmpty>No cryptocurrencies found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => {
              const Icon = item.icon;
              return (
                <ComboboxItem
                  className="justify-between"
                  key={item.symbol}
                  value={item}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="size-4" />
                    {item.symbol}
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {item.value}
                  </span>
                </ComboboxItem>
              );
            }}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Cryptocurrency selector with icons and balance values.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Input Group (with Icon)
// =============================================================================
export const InputGroup: Story = {
  name: "Input Group",
  render: () => (
    <Field>
      <FieldLabel>Timezone</FieldLabel>
      <Combobox items={timezones}>
        <ComboboxInput placeholder="Select a timezone">
          <InputGroupAddon>
            <GlobeIcon />
          </InputGroupAddon>
        </ComboboxInput>
        <ComboboxContent alignOffset={-28} className="w-60">
          <ComboboxEmpty>No timezones found.</ComboboxEmpty>
          <ComboboxList>
            {(group) => (
              <ComboboxGroup items={group.items} key={group.value}>
                <ComboboxLabel>{group.value}</ComboboxLabel>
                <ComboboxCollection>
                  {(item) => (
                    <ComboboxItem key={item} value={item}>
                      {item}
                    </ComboboxItem>
                  )}
                </ComboboxCollection>
              </ComboboxGroup>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>InputGroupAddon</code> inside <code>ComboboxInput</code> to
        add an icon.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Controlled
// =============================================================================
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string | null>(null);

    return (
      <FieldGroup className="w-full max-w-xs">
        <Field>
          <FieldLabel>Framework</FieldLabel>
          <Combobox items={frameworks} onValueChange={setValue} value={value}>
            <ComboboxInput placeholder="Select a framework" />
            <ComboboxContent>
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <FieldDescription>Selected value: {value ?? "none"}</FieldDescription>
        </Field>
        <Field orientation="horizontal">
          <Button onClick={() => setValue(null)} size="sm" variant="outline">
            Clear
          </Button>
          <Button
            onClick={() => setValue("SvelteKit")}
            size="sm"
            variant="outline"
          >
            Set SvelteKit
          </Button>
        </Field>
      </FieldGroup>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the `value` and `onValueChange` props to control the combobox externally.",
      },
    },
  },
};

// =============================================================================
// Form Example
// =============================================================================
export const FormExample: Story = {
  name: "Form",
  render: () => (
    <form
      className="w-full max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        alert(`Framework: ${formData.get("framework")}`);
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel>Framework</FieldLabel>
          <Combobox defaultValue="Next.js" items={frameworks} name="framework">
            <ComboboxInput placeholder="Select a framework" />
            <ComboboxContent>
              <ComboboxEmpty>No items found.</ComboboxEmpty>
              <ComboboxList>
                {(item) => (
                  <ComboboxItem key={item} value={item}>
                    {item}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        </Field>
        <Field orientation="horizontal">
          <Button type="reset" variant="outline">
            Reset
          </Button>
          <Button type="submit">Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Use the `name` prop on `Combobox` to include the selected value in form submissions.",
      },
    },
  },
};

// =============================================================================
// Scrollable
// =============================================================================
const allFrameworks = [
  "Next.js",
  "SvelteKit",
  "Nuxt.js",
  "Remix",
  "Astro",
  "Gatsby",
  "Vite",
  "Create React App",
  "Angular",
  "Vue CLI",
  "Ember.js",
  "Meteor",
  "Blitz.js",
  "RedwoodJS",
  "Fresh",
  "Qwik",
  "SolidStart",
  "Analog",
  "Elder.js",
  "Sapper",
] as const;

export const Scrollable: Story = {
  render: () => (
    <Field>
      <FieldLabel>Framework</FieldLabel>
      <Combobox items={allFrameworks}>
        <ComboboxInput className="w-56" placeholder="Select a framework" />
        <ComboboxContent>
          <ComboboxEmpty>No items found.</ComboboxEmpty>
          <ComboboxList>
            {(item) => (
              <ComboboxItem key={item} value={item}>
                {item}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Long lists automatically become scrollable.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Compact Items
// =============================================================================

export const CompactItems: Story = {
  name: "Compact Items",
  render: () => (
    <div className="flex items-start gap-8">
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">Default (36px)</span>
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent>
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
      <div className="flex flex-col items-center gap-2">
        <span className="text-muted-foreground text-xs">Compact (32px)</span>
        <Combobox items={frameworks}>
          <ComboboxInput placeholder="Select a framework" />
          <ComboboxContent size="compact">
            <ComboboxEmpty>No items found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Use `size="compact"` on `ComboboxContent` to reduce item height from 36px to 32px.',
      },
    },
  },
};

// =============================================================================
// Multiple Selection In A Popover
// =============================================================================
const LABELS = ["Bug", "Feature", "Docs", "Design", "Performance"] as const;
type IssueLabel = (typeof LABELS)[number];

export const MultipleInPopover: Story = {
  render: () => {
    const [value, setValue] = useState<IssueLabel[]>(["Bug"]);

    return (
      <Popover>
        <PopoverTrigger render={<Button size="sm" variant="outline" />}>
          <span className="font-normal text-muted-foreground">Labels:</span>
          {value.length === 0
            ? "All"
            : `${value[0]}${value.length > 1 ? `, +${value.length - 1}` : ""}`}
          <ChevronDownIcon className="text-muted-foreground" />
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64 p-1">
          <Combobox
            autoHighlight
            inline
            items={LABELS}
            multiple
            onValueChange={(next: IssueLabel[]) => setValue(next)}
            open
            value={value}
          >
            <div className="px-1 py-1">
              <ComboboxChips className="min-h-8 py-0.5 pe-1">
                <ComboboxValue>
                  {(values: IssueLabel[]) => (
                    <>
                      {values.map((item) => (
                        <ComboboxChip key={item}>{item}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput
                        aria-label="Search labels"
                        placeholder={values.length > 0 ? "" : "Search…"}
                      />
                    </>
                  )}
                </ComboboxValue>
                {value.length > 0 && (
                  <Button
                    aria-label="Clear labels"
                    className="ms-auto shrink-0 rounded-full text-muted-foreground"
                    onClick={() => setValue([])}
                    size="icon-xs"
                    variant="ghost"
                  >
                    <CircleXIcon />
                  </Button>
                )}
              </ComboboxChips>
            </div>
            <ComboboxEmpty className="px-2 py-1.5 text-muted-foreground text-sm">
              No match
            </ComboboxEmpty>
            <ComboboxList className="max-h-none p-0" data-size="compact">
              {(item: IssueLabel) => (
                <ComboboxItem key={item} value={item}>
                  {item}
                </ComboboxItem>
              )}
            </ComboboxList>
          </Combobox>
        </PopoverContent>
      </Popover>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(document.body);
    const trigger = canvas.getByRole("button", { name: /labels:/i });
    await expect(trigger).toHaveTextContent("Labels:Bug");

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole("option", { name: /^feature$/i })
    );

    // The popover stays open between picks, and the trigger counts the rest.
    // Waited on: the popup may still be animating in when the pick lands.
    await waitFor(async () => {
      await expect(body.getByRole("option", { name: /^bug$/i })).toBeVisible();
      await expect(trigger).toHaveTextContent("Labels:Bug, +1");
    });

    await userEvent.click(
      body.getByRole("button", { name: /^clear labels$/i })
    );
    await waitFor(async () => {
      await expect(trigger).toHaveTextContent("Labels:All");
    });
  },
  parameters: {
    docs: {
      description: {
        story:
          "A multi-select filter, Notion-style: an `inline` combobox inside a popover, with chips in the search field and picked items kept in the list.",
      },
    },
  },
};
