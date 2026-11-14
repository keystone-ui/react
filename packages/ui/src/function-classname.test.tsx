/**
 * Every exported part whose `className` type accepts a function (it inherits a
 * Base UI part's props) must honour one: Base UI calls it with the part's state
 * and the result lands on the element, merged with the part's own classes
 * exactly as a string would be. `cn()` drops a function, so a wrapper that
 * passes `cn(base, className)` silently loses it.
 *
 * Each case renders the part three ways (no className, a string, a function
 * returning the same string) and asserts the function result is
 * byte-identical to the string result, which itself keeps the base classes.
 */
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "./accordion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./carousel";
import { Checkbox } from "./checkbox";
import {
  CircularProgress,
  CircularProgressLabel,
  CircularProgressValue,
} from "./circular-progress";
import { CodeBlock, CodeBlockCopyButton } from "./code-block";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxClear,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  ComboboxTrigger,
} from "./combobox";
import { CopyButton } from "./copy-button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { InputGroup, InputGroupButton } from "./input-group";
import { InputOTP, InputOTPSeparator, InputOTPSlot } from "./input-otp";
import {
  Modal,
  ModalClose,
  ModalContent,
  ModalDescription,
  ModalOverlay,
  ModalPortal,
  ModalTitle,
  ModalTrigger,
} from "./modal";
import {
  Popover,
  PopoverArrow,
  PopoverClose,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "./progress";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import {
  SelectionBar,
  SelectionBarButton,
  SelectionBarClose,
  SelectionBarLink,
} from "./selection-bar";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "./slider";
import { Switch } from "./switch";
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "./tabs";
import { Tag } from "./tag";
import { TagGroup, TagGroupItem } from "./tag-group";
import { Toggle } from "./toggle";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

// Each part's state type differs, so the table takes any state.
type ClassNameArg = string | ((state: any) => string) | undefined;

interface Case {
  /** Exported part under test; it receives `data-testid="probe"`. */
  name: string;
  render: (className: ClassNameArg) => ReactElement;
  /** Keys the state passed to the function must contain. */
  state?: Record<string, unknown>;
}

const probe = { "data-testid": "probe" } as const;

const CASES: Case[] = [
  // --- Accordion (fixed on the base branch; kept as a regression guard)
  {
    name: "Accordion",
    render: (c) => (
      <Accordion className={c} {...probe}>
        <AccordionItem value="a">
          <AccordionTrigger>A</AccordionTrigger>
          <AccordionPanel>a</AccordionPanel>
        </AccordionItem>
      </Accordion>
    ),
    state: { disabled: false },
  },
  ...(
    [
      "AccordionItem",
      "AccordionHeader",
      "AccordionTrigger",
      "AccordionPanel",
    ] as const
  ).map(
    (name): Case => ({
      name,
      render: (c) => (
        <Accordion defaultValue={["a"]}>
          <AccordionItem
            value="a"
            {...(name === "AccordionItem" ? { className: c, ...probe } : {})}
          >
            {name === "AccordionHeader" ? (
              <AccordionHeader className={c} {...probe}>
                A
              </AccordionHeader>
            ) : (
              <AccordionTrigger
                {...(name === "AccordionTrigger"
                  ? { className: c, ...probe }
                  : {})}
              >
                A
              </AccordionTrigger>
            )}
            <AccordionPanel
              {...(name === "AccordionPanel" ? { className: c, ...probe } : {})}
            >
              a
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      ),
      state: { open: true },
    })
  ),

  // --- AlertDialog
  {
    name: "AlertDialogTrigger",
    render: (c) => (
      <AlertDialog>
        <AlertDialogTrigger className={c} {...probe}>
          Open
        </AlertDialogTrigger>
      </AlertDialog>
    ),
  },
  ...(
    [
      ["AlertDialogContent", { open: true }],
      ["AlertDialogTitle", undefined],
      ["AlertDialogDescription", undefined],
      ["AlertDialogAction", undefined],
      ["AlertDialogCancel", undefined],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <AlertDialog open>
            <AlertDialogContent {...on("AlertDialogContent")}>
              <AlertDialogTitle {...on("AlertDialogTitle")}>T</AlertDialogTitle>
              <AlertDialogDescription {...on("AlertDialogDescription")}>
                D
              </AlertDialogDescription>
              <AlertDialogCancel {...on("AlertDialogCancel")}>
                No
              </AlertDialogCancel>
              <AlertDialogAction {...on("AlertDialogAction")}>
                Yes
              </AlertDialogAction>
            </AlertDialogContent>
          </AlertDialog>
        );
      },
      state,
    })
  ),
  {
    name: "AlertDialogPortal",
    render: (c) => (
      <AlertDialog open>
        <AlertDialogPortal className={c} {...probe}>
          <AlertDialogOverlay />
        </AlertDialogPortal>
      </AlertDialog>
    ),
  },
  {
    name: "AlertDialogOverlay",
    render: (c) => (
      <AlertDialog open>
        <AlertDialogPortal>
          <AlertDialogOverlay className={c} {...probe} />
        </AlertDialogPortal>
      </AlertDialog>
    ),
    state: { open: true },
  },

  // --- Avatar
  {
    name: "Avatar",
    render: (c) => (
      <Avatar className={c} {...probe}>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    ),
  },
  {
    name: "AvatarImage",
    render: (c) => (
      <Avatar>
        <AvatarImage alt="" className={c} src="/a.png" {...probe} />
      </Avatar>
    ),
    state: { imageLoadingStatus: "loaded" },
  },
  {
    name: "AvatarFallback",
    render: (c) => (
      <Avatar>
        <AvatarFallback className={c} {...probe}>
          AB
        </AvatarFallback>
      </Avatar>
    ),
  },

  // --- Button and the parts that render one
  {
    name: "Button",
    render: (c) => (
      <Button className={c} {...probe}>
        B
      </Button>
    ),
    state: { disabled: false },
  },
  ...(["CarouselPrevious", "CarouselNext"] as const).map(
    (name): Case => ({
      name,
      render: (c) => (
        <Carousel>
          <CarouselContent>
            <CarouselItem>one</CarouselItem>
            <CarouselItem>two</CarouselItem>
          </CarouselContent>
          {name === "CarouselPrevious" ? (
            <CarouselPrevious className={c} {...probe} />
          ) : (
            <CarouselNext className={c} {...probe} />
          )}
        </Carousel>
      ),
    })
  ),
  {
    name: "CopyButton",
    render: (c) => <CopyButton className={c} value="x" {...probe} />,
  },
  {
    name: "CodeBlockCopyButton",
    render: (c) => (
      <CodeBlock code="x">
        <CodeBlockCopyButton className={c} {...probe} />
      </CodeBlock>
    ),
  },
  {
    name: "InputGroupButton",
    render: (c) => (
      <InputGroup>
        <InputGroupButton className={c} {...probe}>
          B
        </InputGroupButton>
      </InputGroup>
    ),
  },
  {
    name: "SelectionBarButton",
    render: (c) => (
      <SelectionBar open>
        <SelectionBarButton className={c} {...probe}>
          B
        </SelectionBarButton>
      </SelectionBar>
    ),
  },
  {
    name: "SelectionBarLink",
    render: (c) => (
      <SelectionBar open>
        <SelectionBarLink className={c} {...probe}>
          L
        </SelectionBarLink>
      </SelectionBar>
    ),
  },
  {
    name: "SelectionBarClose",
    render: (c) => (
      <SelectionBar open>
        <SelectionBarClose className={c} {...probe} />
      </SelectionBar>
    ),
  },

  // --- Form controls
  {
    name: "Checkbox",
    render: (c) => <Checkbox className={c} {...probe} />,
    state: { checked: false },
  },
  {
    name: "Switch",
    render: (c) => <Switch className={c} {...probe} />,
    state: { checked: false },
  },
  {
    name: "RadioGroup",
    render: (c) => (
      <RadioGroup className={c} {...probe}>
        <RadioGroupItem value="a" />
      </RadioGroup>
    ),
  },
  {
    name: "RadioGroupItem",
    render: (c) => (
      <RadioGroup>
        <RadioGroupItem className={c} value="a" {...probe} />
      </RadioGroup>
    ),
    state: { checked: false },
  },
  {
    name: "Toggle",
    render: (c) => (
      <Toggle className={c} {...probe}>
        T
      </Toggle>
    ),
    state: { pressed: false },
  },
  {
    name: "ToggleGroup",
    render: (c) => (
      <ToggleGroup className={c} {...probe}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>
    ),
  },
  {
    name: "ToggleGroupItem",
    render: (c) => (
      <ToggleGroup>
        <ToggleGroupItem className={c} value="a" {...probe}>
          A
        </ToggleGroupItem>
      </ToggleGroup>
    ),
    state: { pressed: false },
  },
  {
    name: "Tag",
    render: (c) => (
      <Tag className={c} {...probe}>
        T
      </Tag>
    ),
    state: { pressed: false },
  },
  {
    name: "TagGroup",
    render: (c) => (
      <TagGroup className={c} {...probe}>
        <TagGroupItem value="a">A</TagGroupItem>
      </TagGroup>
    ),
  },
  {
    name: "TagGroupItem",
    render: (c) => (
      <TagGroup>
        <TagGroupItem className={c} value="a" {...probe}>
          A
        </TagGroupItem>
      </TagGroup>
    ),
    state: { pressed: false },
  },
  {
    name: "InputOTP",
    render: (c) => (
      <InputOTP className={c} length={2} {...probe}>
        <InputOTPSlot />
        <InputOTPSlot />
      </InputOTP>
    ),
  },
  {
    name: "InputOTPSlot",
    render: (c) => (
      <InputOTP length={2}>
        <InputOTPSlot className={c} {...probe} />
        <InputOTPSlot />
      </InputOTP>
    ),
  },
  {
    name: "InputOTPSeparator",
    render: (c) => (
      <InputOTP length={2}>
        <InputOTPSlot />
        <InputOTPSeparator className={c} {...probe} />
        <InputOTPSlot />
      </InputOTP>
    ),
  },

  // --- Collapsible
  ...(["Collapsible", "CollapsibleTrigger", "CollapsibleContent"] as const).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Collapsible defaultOpen {...on("Collapsible")}>
            <CollapsibleTrigger {...on("CollapsibleTrigger")}>
              T
            </CollapsibleTrigger>
            <CollapsibleContent {...on("CollapsibleContent")}>
              C
            </CollapsibleContent>
          </Collapsible>
        );
      },
      state: { open: true },
    })
  ),

  // --- Progress and CircularProgress
  ...(
    [
      "Progress",
      "ProgressTrack",
      "ProgressIndicator",
      "ProgressLabel",
      "ProgressValue",
    ] as const
  ).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Progress value={40} {...on("Progress")}>
            <ProgressLabel {...on("ProgressLabel")}>L</ProgressLabel>
            <ProgressValue {...on("ProgressValue")} />
            <ProgressTrack {...on("ProgressTrack")}>
              <ProgressIndicator {...on("ProgressIndicator")} />
            </ProgressTrack>
          </Progress>
        );
      },
      state: { status: "progressing" },
    })
  ),
  ...(
    [
      "CircularProgress",
      "CircularProgressLabel",
      "CircularProgressValue",
    ] as const
  ).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <CircularProgress value={40} {...on("CircularProgress")}>
            <CircularProgressValue {...on("CircularProgressValue")} />
            <CircularProgressLabel {...on("CircularProgressLabel")}>
              L
            </CircularProgressLabel>
          </CircularProgress>
        );
      },
      state: { status: "progressing" },
    })
  ),

  // --- Slider
  ...(
    [
      "Slider",
      "SliderControl",
      "SliderTrack",
      "SliderIndicator",
      "SliderThumb",
      "SliderValue",
    ] as const
  ).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Slider defaultValue={30} {...on("Slider")}>
            <SliderValue {...on("SliderValue")} />
            <SliderControl {...on("SliderControl")}>
              <SliderTrack {...on("SliderTrack")}>
                <SliderIndicator {...on("SliderIndicator")} />
                <SliderThumb {...on("SliderThumb")} />
              </SliderTrack>
            </SliderControl>
          </Slider>
        );
      },
      state: { disabled: false },
    })
  ),

  // --- Tabs
  ...(
    ["Tabs", "TabsList", "TabsTrigger", "TabsIndicator", "TabsContent"] as const
  ).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Tabs defaultValue="a" {...on("Tabs")}>
            <TabsList {...on("TabsList")}>
              <TabsTrigger value="a" {...on("TabsTrigger")}>
                A
              </TabsTrigger>
              {name === "TabsIndicator" && (
                <TabsIndicator className={c} {...probe} />
              )}
            </TabsList>
            <TabsContent value="a" {...on("TabsContent")}>
              a
            </TabsContent>
          </Tabs>
        );
      },
    })
  ),
  {
    name: "TabsList (scrollable)",
    render: (c) => (
      <Tabs defaultValue="a">
        <TabsList className={c} scrollable {...probe}>
          <TabsTrigger value="a">A</TabsTrigger>
        </TabsList>
      </Tabs>
    ),
  },

  // --- Modal
  {
    name: "ModalTrigger",
    render: (c) => (
      <Modal>
        <ModalTrigger className={c} {...probe}>
          Open
        </ModalTrigger>
      </Modal>
    ),
  },
  ...(
    [
      ["ModalContent", { open: true }],
      ["ModalTitle", undefined],
      ["ModalDescription", undefined],
      ["ModalClose", undefined],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Modal open>
            <ModalContent {...on("ModalContent")}>
              <ModalTitle {...on("ModalTitle")}>T</ModalTitle>
              <ModalDescription {...on("ModalDescription")}>D</ModalDescription>
              <ModalClose {...on("ModalClose")}>Close</ModalClose>
            </ModalContent>
          </Modal>
        );
      },
      state,
    })
  ),
  {
    name: "ModalPortal",
    render: (c) => (
      <Modal open>
        <ModalPortal className={c} {...probe}>
          <ModalOverlay />
        </ModalPortal>
      </Modal>
    ),
  },
  {
    name: "ModalOverlay",
    render: (c) => (
      <Modal open>
        <ModalPortal>
          <ModalOverlay className={c} {...probe} />
        </ModalPortal>
      </Modal>
    ),
    state: { open: true },
  },

  // --- Drawer
  {
    name: "DrawerTrigger",
    render: (c) => (
      <Drawer>
        <DrawerTrigger className={c} {...probe}>
          Open
        </DrawerTrigger>
      </Drawer>
    ),
  },
  ...(
    [
      ["DrawerContent", { open: true }],
      ["DrawerTitle", undefined],
      ["DrawerDescription", undefined],
      ["DrawerClose", undefined],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Drawer open>
            <DrawerContent {...on("DrawerContent")}>
              <DrawerTitle {...on("DrawerTitle")}>T</DrawerTitle>
              <DrawerDescription {...on("DrawerDescription")}>
                D
              </DrawerDescription>
              <DrawerClose {...on("DrawerClose")}>Close</DrawerClose>
            </DrawerContent>
          </Drawer>
        );
      },
      state,
    })
  ),
  {
    name: "DrawerPortal",
    render: (c) => (
      <Drawer open>
        <DrawerPortal className={c} {...probe}>
          <DrawerOverlay />
        </DrawerPortal>
      </Drawer>
    ),
  },
  {
    name: "DrawerOverlay",
    render: (c) => (
      <Drawer open>
        <DrawerPortal>
          <DrawerOverlay className={c} {...probe} />
        </DrawerPortal>
      </Drawer>
    ),
    state: { open: true },
  },

  // --- Popover
  ...(
    [
      ["PopoverTrigger", { open: true }],
      ["PopoverContent", { open: true }],
      ["PopoverTitle", undefined],
      ["PopoverDescription", undefined],
      ["PopoverClose", undefined],
      ["PopoverArrow", { open: true }],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Popover open>
            <PopoverTrigger {...on("PopoverTrigger")}>Open</PopoverTrigger>
            <PopoverContent {...on("PopoverContent")}>
              <PopoverArrow {...on("PopoverArrow")} />
              <PopoverTitle {...on("PopoverTitle")}>T</PopoverTitle>
              <PopoverDescription {...on("PopoverDescription")}>
                D
              </PopoverDescription>
              <PopoverClose {...on("PopoverClose")}>Close</PopoverClose>
            </PopoverContent>
          </Popover>
        );
      },
      state,
    })
  ),

  // --- Tooltip
  ...(["TooltipTrigger", "TooltipContent"] as const).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Tooltip open>
            <TooltipTrigger {...on("TooltipTrigger")}>Hover</TooltipTrigger>
            <TooltipContent {...on("TooltipContent")}>Tip</TooltipContent>
          </Tooltip>
        );
      },
      state: { open: true },
    })
  ),

  // --- DropdownMenu
  ...(
    [
      ["DropdownMenuTrigger", { open: true }],
      ["DropdownMenuContent", { open: true }],
      ["DropdownMenuGroup", undefined],
      ["DropdownMenuLabel", undefined],
      ["DropdownMenuItem", { highlighted: false }],
      ["DropdownMenuSeparator", undefined],
      ["DropdownMenuCheckboxItem", { checked: false }],
      ["DropdownMenuRadioGroup", undefined],
      ["DropdownMenuRadioItem", { checked: false }],
      ["DropdownMenuSubTrigger", { open: true }],
      ["DropdownMenuSubContent", { open: true }],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <DropdownMenu open>
            <DropdownMenuTrigger {...on("DropdownMenuTrigger")}>
              Open
            </DropdownMenuTrigger>
            <DropdownMenuContent {...on("DropdownMenuContent")}>
              <DropdownMenuGroup {...on("DropdownMenuGroup")}>
                <DropdownMenuLabel {...on("DropdownMenuLabel")}>
                  L
                </DropdownMenuLabel>
                <DropdownMenuItem {...on("DropdownMenuItem")}>
                  I
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator {...on("DropdownMenuSeparator")} />
              <DropdownMenuCheckboxItem {...on("DropdownMenuCheckboxItem")}>
                C
              </DropdownMenuCheckboxItem>
              <DropdownMenuRadioGroup
                defaultValue="x"
                {...on("DropdownMenuRadioGroup")}
              >
                <DropdownMenuRadioItem
                  value="y"
                  {...on("DropdownMenuRadioItem")}
                >
                  R
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
              <DropdownMenuSub open>
                <DropdownMenuSubTrigger {...on("DropdownMenuSubTrigger")}>
                  More
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent {...on("DropdownMenuSubContent")}>
                  <DropdownMenuItem>S</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      state,
    })
  ),
  {
    name: "DropdownMenuPortal",
    render: (c) => (
      <DropdownMenu open>
        <DropdownMenuPortal className={c} {...probe}>
          <span />
        </DropdownMenuPortal>
      </DropdownMenu>
    ),
  },

  // --- Select
  ...(
    [
      ["SelectTrigger", { open: true }],
      ["SelectValue", undefined],
      ["SelectContent", { open: true }],
      ["SelectGroup", undefined],
      ["SelectLabel", undefined],
      ["SelectItem", { selected: true }],
      ["SelectSeparator", undefined],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Select defaultValue="a" open>
            <SelectTrigger {...on("SelectTrigger")}>
              <SelectValue {...on("SelectValue")} />
            </SelectTrigger>
            <SelectContent {...on("SelectContent")}>
              <SelectGroup {...on("SelectGroup")}>
                <SelectLabel {...on("SelectLabel")}>L</SelectLabel>
                <SelectItem value="a" {...on("SelectItem")}>
                  A
                </SelectItem>
              </SelectGroup>
              <SelectSeparator {...on("SelectSeparator")} />
              <SelectItem value="b">B</SelectItem>
            </SelectContent>
          </Select>
        );
      },
      state,
    })
  ),

  // --- Combobox (ComboboxInput is in the report: it renders an InputGroup div)
  ...(
    [
      ["ComboboxTrigger", { open: true }],
      ["ComboboxClear", undefined],
      ["ComboboxContent", { open: true }],
      ["ComboboxList", undefined],
      ["ComboboxGroup", undefined],
      ["ComboboxLabel", undefined],
      ["ComboboxItem", { selected: true }],
      ["ComboboxSeparator", undefined],
    ] as const
  ).map(
    ([name, state]): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Combobox defaultValue="a" items={["a", "b"]} open>
            <ComboboxTrigger {...on("ComboboxTrigger")}>Pick</ComboboxTrigger>
            <ComboboxClear {...on("ComboboxClear")} />
            <ComboboxContent {...on("ComboboxContent")}>
              <ComboboxList {...on("ComboboxList")}>
                <ComboboxGroup {...on("ComboboxGroup")}>
                  <ComboboxLabel {...on("ComboboxLabel")}>L</ComboboxLabel>
                  <ComboboxItem value="a" {...on("ComboboxItem")}>
                    a
                  </ComboboxItem>
                </ComboboxGroup>
                <ComboboxSeparator {...on("ComboboxSeparator")} />
                <ComboboxItem value="b">b</ComboboxItem>
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
        );
      },
      state,
    })
  ),
  {
    name: "ComboboxEmpty",
    render: (c) => (
      <Combobox items={[]} open>
        <ComboboxTrigger>Pick</ComboboxTrigger>
        <ComboboxContent>
          <ComboboxEmpty className={c} {...probe}>
            None
          </ComboboxEmpty>
        </ComboboxContent>
      </Combobox>
    ),
  },
  ...(["ComboboxChips", "ComboboxChip", "ComboboxChipsInput"] as const).map(
    (name): Case => ({
      name,
      render: (c) => {
        const on = (n: string) =>
          n === name ? { className: c, ...probe } : {};
        return (
          <Combobox defaultValue={["a"]} items={["a", "b"]} multiple>
            <ComboboxChips {...on("ComboboxChips")}>
              <ComboboxChip {...on("ComboboxChip")}>a</ComboboxChip>
              <ComboboxChipsInput {...on("ComboboxChipsInput")} />
            </ComboboxChips>
          </Combobox>
        );
      },
    })
  ),
];

const TOKEN = "probe-class";

/**
 * jsdom never loads an image, so AvatarImage would never mount. Base UI takes
 * an image that is `complete` with a width as already decoded.
 */
class DecodedImage {
  complete = true;
  naturalWidth = 1;
  crossOrigin: string | null = null;
  onerror: (() => void) | null = null;
  onload: (() => void) | null = null;
  src = "";
}
const realImage = window.Image;
beforeAll(() => {
  window.Image = DecodedImage as unknown as typeof window.Image;
});
afterAll(() => {
  window.Image = realImage;
});

function classOf(testCase: Case, className: ClassNameArg) {
  const { unmount } = render(testCase.render(className));
  const value = screen.getByTestId("probe").getAttribute("class") ?? "";
  unmount();
  return value;
}

describe("function className reaches the DOM on every part that declares it", () => {
  it.each(CASES.map((c) => [c.name, c] as const))("%s", (_name, testCase) => {
    const none = classOf(testCase, undefined).split(" ").filter(Boolean);
    const asString = classOf(testCase, TOKEN);
    const fn = vi.fn((_state: unknown) => TOKEN);
    const asFunction = classOf(testCase, fn);

    // A string keeps the part's own classes and adds the consumer's.
    expect(asString.split(" ")).toEqual(
      expect.arrayContaining([...none, TOKEN])
    );
    // A function gives exactly what the same string gives.
    expect(asFunction).toBe(asString);
    // Base UI called it with the part's state.
    expect(fn).toHaveBeenCalledWith(
      testCase.state
        ? expect.objectContaining(testCase.state)
        : expect.any(Object)
    );
  });
});
