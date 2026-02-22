import type { Meta, StoryObj } from "@storybook/react-vite";
import { countries as countryDataList } from "country-data-list";
import { Button } from "@keystoneui/react/button";
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
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@keystoneui/react/field";
import { InputGroupAddon } from "@keystoneui/react/input-group";
import { GlobeIcon, SearchIcon } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { CircleFlag } from "react-circle-flags";
import { FaBitcoin, FaEthereum } from "react-icons/fa";
import {
  SiCardano,
  SiDogecoin,
  SiLitecoin,
  SiPolkadot,
  SiRipple,
  SiSolana,
} from "react-icons/si";
import { expect, userEvent, within } from "storybook/test";

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

    await userEvent.click(input);
    await new Promise((r) => setTimeout(r, 500));

    await expect(
      document.querySelector("[role='listbox']")
    ).toBeInTheDocument();
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
