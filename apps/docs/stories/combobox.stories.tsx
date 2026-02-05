import type { Meta, StoryObj } from "@storybook/react-vite";
import * as React from "react";
import { useState } from "react";
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
} from "@acme/ui/combobox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@acme/ui/field";
import { InputGroupAddon } from "@acme/ui/input";
import { Button } from "@acme/ui/button";
import { GlobeIcon, SearchIcon } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import {
  FaBitcoin,
  FaEthereum,
} from "react-icons/fa";
import {
  SiSolana,
  SiCardano,
  SiPolkadot,
  SiLitecoin,
  SiDogecoin,
  SiRipple,
} from "react-icons/si";

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
} from "@acme/ui/combobox";

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
};

// =============================================================================
// Custom Items (Object Values)
// =============================================================================
type Framework = {
  label: string;
  value: string;
};

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
        itemToStringValue={(framework) => framework.label}
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
          multiple
          autoHighlight
          items={frameworks}
          defaultValue={[frameworks[0]]}
        >
          <ComboboxChips ref={anchor} className="w-full max-w-xs">
            <ComboboxValue>
              {(values: string[]) => (
                <React.Fragment>
                  {values.map((value) => (
                    <ComboboxChip key={value}>{value}</ComboboxChip>
                  ))}
                  <ComboboxChipsInput placeholder="Search..." />
                </React.Fragment>
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
      <Combobox items={frameworks} defaultValue={frameworks[0]}>
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
        <ComboboxInput placeholder="Select a timezone" className="w-56" />
        <ComboboxContent>
          <ComboboxEmpty>No timezones found.</ComboboxEmpty>
          <ComboboxList>
            {(group, index) => (
              <ComboboxGroup key={group.value} items={group.items}>
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
const countries = [
  {
    code: "ar",
    value: "argentina",
    label: "Argentina",
    continent: "South America",
  },
  { code: "au", value: "australia", label: "Australia", continent: "Oceania" },
  { code: "br", value: "brazil", label: "Brazil", continent: "South America" },
  { code: "ca", value: "canada", label: "Canada", continent: "North America" },
  { code: "cn", value: "china", label: "China", continent: "Asia" },
  {
    code: "co",
    value: "colombia",
    label: "Colombia",
    continent: "South America",
  },
  { code: "eg", value: "egypt", label: "Egypt", continent: "Africa" },
  { code: "fr", value: "france", label: "France", continent: "Europe" },
  { code: "de", value: "germany", label: "Germany", continent: "Europe" },
  { code: "it", value: "italy", label: "Italy", continent: "Europe" },
  { code: "jp", value: "japan", label: "Japan", continent: "Asia" },
  { code: "ke", value: "kenya", label: "Kenya", continent: "Africa" },
  { code: "mx", value: "mexico", label: "Mexico", continent: "North America" },
  {
    code: "nz",
    value: "new-zealand",
    label: "New Zealand",
    continent: "Oceania",
  },
  { code: "ng", value: "nigeria", label: "Nigeria", continent: "Africa" },
  {
    code: "za",
    value: "south-africa",
    label: "South Africa",
    continent: "Africa",
  },
  { code: "kr", value: "south-korea", label: "South Korea", continent: "Asia" },
  {
    code: "gb",
    value: "united-kingdom",
    label: "United Kingdom",
    continent: "Europe",
  },
  {
    code: "us",
    value: "united-states",
    label: "United States",
    continent: "North America",
  },
];

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
        <ComboboxInput placeholder="Search countries..." className="w-64" />
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(country) => (
              <ComboboxItem key={country.code} value={country} className="py-2">
                <div className="flex flex-col">
                  <span className="font-medium">{country.label}</span>
                  <span className="text-muted-foreground text-xs">
                    {country.continent} ({country.code.toUpperCase()})
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
export const CountriesWithFlags: Story = {
  name: "Countries with Flags",
  render: () => (
    <Field>
      <FieldLabel>Country</FieldLabel>
      <Combobox
        items={countries}
        itemToStringValue={(country: (typeof countries)[number]) =>
          country.label
        }
      >
        <ComboboxInput placeholder="Search countries..." className="w-64" />
        <ComboboxContent>
          <ComboboxEmpty>No countries found.</ComboboxEmpty>
          <ComboboxList>
            {(country) => (
              <ComboboxItem key={country.code} value={country}>
                <ReactCountryFlag
                  countryCode={country.code}
                  svg
                  style={{
                    width: "1.25em",
                    height: "1.25em",
                  }}
                />
                <span>{country.label}</span>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Use <code>react-country-flag</code> to display flags alongside country
        names.
      </FieldDescription>
    </Field>
  ),
};

// =============================================================================
// Invalid
// =============================================================================
export const Invalid: Story = {
  render: () => (
    <Field data-invalid>
      <FieldLabel>Framework</FieldLabel>
      <Combobox items={frameworks}>
        <ComboboxInput placeholder="Select a framework" aria-invalid="true" />
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
          <ComboboxInput placeholder="Select a framework" disabled />
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
                  key={item}
                  value={item}
                  disabled={item === "Remix" || item === "Astro"}
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
      <Combobox items={frameworks} autoHighlight>
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
              variant="outline"
              className="w-64 justify-between font-normal focus-visible:outline-0 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:border-ring"
            >
              <ComboboxValue placeholder="Select a country" />
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput showTrigger={false} placeholder="Search" />
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
    value: 0.00234,
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
    value: 15420.5,
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
              variant="outline"
              className="w-64 justify-between font-normal focus-visible:outline-0 focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring focus-visible:border-ring"
            >
              <ComboboxValue placeholder="Select cryptocurrency" />
            </Button>
          }
        />
        <ComboboxContent>
          <ComboboxInput showTrigger={false} placeholder="Search">
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
                  key={item.symbol}
                  value={item}
                  className="justify-between"
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
              <ComboboxGroup key={group.value} items={group.items}>
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
          <Combobox items={frameworks} value={value} onValueChange={setValue}>
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
          <Button variant="outline" size="sm" onClick={() => setValue(null)}>
            Clear
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setValue("SvelteKit")}
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
          <Combobox name="framework" items={frameworks} defaultValue="Next.js">
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
        <ComboboxInput placeholder="Select a framework" className="w-56" />
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
