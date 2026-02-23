"use client";

import { Alert, AlertDescription, AlertTitle } from "@keystoneui/react/alert";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@keystoneui/react/avatar";
import { Badge } from "@keystoneui/react/badge";
import { Button } from "@keystoneui/react/button";
import { ButtonGroup } from "@keystoneui/react/button-group";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@keystoneui/react/card";
import { Checkbox } from "@keystoneui/react/checkbox";
import {
  CircularProgress,
  CircularProgressIndicator,
  CircularProgressTrack,
} from "@keystoneui/react/circular-progress";
import {
  DescriptionList,
  DescriptionListDetails,
  DescriptionListItem,
  DescriptionListTerm,
} from "@keystoneui/react/description-list";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@keystoneui/react/field";
import { Input } from "@keystoneui/react/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@keystoneui/react/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@keystoneui/react/input-otp";
import { Label } from "@keystoneui/react/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@keystoneui/react/native-select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@keystoneui/react/pagination";
import { RadioGroup, RadioGroupItem } from "@keystoneui/react/radio-group";
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
  SliderValue,
} from "@keystoneui/react/slider";
import { Switch } from "@keystoneui/react/switch";
import { Textarea } from "@keystoneui/react/textarea";
import {
  BadgeCheckIcon,
  BathIcon,
  BedIcon,
  CheckIcon,
  CopyIcon,
  FlameIcon,
  InfoIcon,
  LandPlotIcon,
  MinusIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  TrendingUpIcon,
  ZapIcon,
} from "lucide-react";
import { useCallback, useId, useState } from "react";

const AVATAR_URLS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
];

const PILL_OPTIONS = [
  { label: "Social Media", value: "social-media" },
  { label: "Search Engine", value: "search-engine" },
  { label: "Referral", value: "referral" },
  { label: "Other", value: "other" },
];

const ORDER_ITEMS = [
  { label: "Subtotal", value: "$1,250.00" },
  { label: "Shipping", value: "$12.50" },
  { label: "Tax", value: "$125.00" },
];

export function DemoComponents() {
  const sliderId = useId();

  const [gpuCount, setGpuCount] = useState(8);
  const [isCopied, setIsCopied] = useState(false);

  const handleGpuAdjustment = useCallback((adjustment: number) => {
    setGpuCount((prev) => Math.max(1, Math.min(99, prev + adjustment)));
  }, []);

  const handleGpuInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number.parseInt(e.target.value, 10);
      if (!Number.isNaN(value) && value >= 1 && value <= 99) {
        setGpuCount(value);
      }
    },
    []
  );

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText("https://example.com/api/key");
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  }, []);

  return (
    <div className="mx-auto max-w-7xl columns-1 gap-4 p-6 md:columns-2 lg:columns-3">
      {/* field.stories — Required */}
      <div className="mb-4 break-inside-avoid">
        <Field>
          <FieldLabel htmlFor="demo-email">
            Email<span className="ml-1 text-destructive">*</span>
          </FieldLabel>
          <Input id="demo-email" required type="email" />
          <FieldDescription>
            We&apos;ll never share your email.
          </FieldDescription>
        </Field>
      </div>

      {/* native-select.stories — FieldExample */}
      <div className="mb-4 break-inside-avoid">
        <Field>
          <FieldLabel htmlFor="demo-status">Status</FieldLabel>
          <NativeSelect id="demo-status">
            <NativeSelectOption value="">Select status</NativeSelectOption>
            <NativeSelectOption value="todo">Todo</NativeSelectOption>
            <NativeSelectOption value="in-progress">
              In Progress
            </NativeSelectOption>
            <NativeSelectOption value="done">Done</NativeSelectOption>
            <NativeSelectOption value="cancelled">Cancelled</NativeSelectOption>
          </NativeSelect>
          <FieldDescription>
            Choose the current status of the task.
          </FieldDescription>
        </Field>
      </div>

      {/* slider.stories — WithLabelAndValue */}
      <div className="mb-4 break-inside-avoid">
        <Slider aria-labelledby={sliderId} defaultValue={48}>
          <div className="flex justify-between">
            <span className="font-medium text-sm" id={sliderId}>
              Volume
            </span>
            <SliderValue />
          </div>
          <SliderControl>
            <SliderTrack>
              <SliderIndicator />
              <SliderThumb />
            </SliderTrack>
          </SliderControl>
        </Slider>
      </div>

      {/* input-otp.stories — Form */}
      <Card className="mb-4 break-inside-avoid">
        <CardHeader>
          <CardTitle>Verify your login</CardTitle>
          <CardDescription>
            Enter the verification code we sent to your email address:{" "}
            <span className="font-medium">m@example.com</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <div className="flex items-center justify-between">
              <FieldLabel htmlFor="demo-otp">Verification code</FieldLabel>
              <Button size="xs" variant="outline">
                <RefreshCwIcon className="size-3" />
                Resend Code
              </Button>
            </div>
            <InputOTP id="demo-otp" maxLength={6}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription>
              <span className="cursor-pointer underline underline-offset-4 transition-colors hover:text-primary">
                I no longer have access to this email address.
              </span>
            </FieldDescription>
          </Field>
        </CardContent>
        <CardFooter>
          <Field className="w-full">
            <Button className="w-full" type="submit">
              Verify
            </Button>
            <div className="text-center text-muted-foreground text-sm">
              Having trouble signing in?{" "}
              <span className="cursor-pointer underline underline-offset-4 transition-colors hover:text-primary">
                Contact support
              </span>
            </div>
          </Field>
        </CardFooter>
      </Card>

      {/* avatar.stories — GroupWithCount */}
      <div className="mb-4 break-inside-avoid">
        <AvatarGroup>
          {AVATAR_URLS.map((url, i) => (
            <Avatar key={url}>
              <AvatarImage alt={`User ${i + 1}`} src={url} />
              <AvatarFallback>U{i + 1}</AvatarFallback>
            </Avatar>
          ))}
          <AvatarGroupCount>+3</AvatarGroupCount>
        </AvatarGroup>
      </div>

      {/* card.stories — LoginForm */}
      <Card className="mb-4 break-inside-avoid">
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link">Sign Up</Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="demo-login-email">Email</Label>
                <Input
                  id="demo-login-email"
                  placeholder="m@example.com"
                  type="email"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="demo-login-password">Password</Label>
                  <span className="ml-auto inline-block cursor-pointer text-sm underline-offset-4 hover:underline">
                    Forgot your password?
                  </span>
                </div>
                <Input id="demo-login-password" type="password" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" type="submit">
            Login
          </Button>
          <Button className="w-full" variant="outline">
            Login with Google
          </Button>
        </CardFooter>
      </Card>

      {/* card.stories — SocialCard */}
      <Card className="mb-4 break-inside-avoid">
        <CardHeader className="flex-row items-center gap-3">
          <Avatar size="lg">
            <AvatarImage alt="shadcn" src={AVATAR_URLS[0]} />
            <AvatarFallback>SC</AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-1 font-semibold text-sm leading-tight">
              shadcn
              <BadgeCheckIcon className="size-4 fill-blue-500 text-white" />
            </div>
            <p className="text-muted-foreground text-xs">@shadcn</p>
          </div>
          <Button size="sm">Follow</Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm leading-relaxed">
            Building open source tools for the web. Creator of shadcn/ui and
            taxonomy.
          </p>
          <div className="flex gap-4 text-sm">
            <span>
              <span className="font-semibold">4</span>{" "}
              <span className="text-muted-foreground">Following</span>
            </span>
            <span>
              <span className="font-semibold">97.1K</span>{" "}
              <span className="text-muted-foreground">Followers</span>
            </span>
          </div>
        </CardContent>
      </Card>

      {/* card.stories — WithImage */}
      <Card className="mb-4 break-inside-avoid overflow-hidden pt-0!">
        {/* biome-ignore lint: theme preview context, not a page */}
        <img
          alt="Event cover"
          className="aspect-video w-full object-cover"
          height={450}
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=450&fit=crop"
          width={800}
        />
        <CardHeader>
          <CardAction>
            <Badge variant="default">Featured</Badge>
          </CardAction>
          <CardTitle>Design systems meetup</CardTitle>
          <CardDescription>
            A practical talk on component APIs, accessibility, and shipping
            faster.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button className="w-full">View Event</Button>
        </CardFooter>
      </Card>

      {/* switch.stories — Description */}
      <div className="mb-4 break-inside-avoid">
        <Field orientation="horizontal">
          <FieldContent>
            <FieldLabel htmlFor="demo-focus-mode">
              Share across devices
            </FieldLabel>
            <FieldDescription>
              Focus is shared across devices, and turns off when you leave the
              app.
            </FieldDescription>
          </FieldContent>
          <Switch id="demo-focus-mode" />
        </Field>
      </div>

      {/* badge.stories — WithIcon / Status Dots */}
      <div className="mb-4 flex break-inside-avoid flex-wrap gap-2">
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-green-500"
          />
          Active
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-yellow-500"
          />
          Pending
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-red-500"
          />
          Failed
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-blue-500"
          />
          Processing
        </Badge>
        <Badge variant="outline">
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-gray-400"
          />
          Inactive
        </Badge>
      </div>

      {/* input-group.stories — SearchWithResultsCount */}
      <div className="mb-4 break-inside-avoid">
        <InputGroup>
          <InputGroupAddon>
            <SearchIcon className="size-4" />
          </InputGroupAddon>
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-xs">12 results</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* input-group.stories — TextPrefix */}
      <div className="mb-4 break-inside-avoid">
        <InputGroup>
          <InputGroupAddon>
            <InputGroupText>https://</InputGroupText>
          </InputGroupAddon>
          <InputGroupInput placeholder="example.com" />
        </InputGroup>
      </div>

      {/* input-group.stories — CopyToClipboard */}
      <div className="mb-4 break-inside-avoid">
        <InputGroup>
          <InputGroupInput readOnly value="https://example.com/api/key" />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              aria-label="Copy to clipboard"
              onClick={handleCopy}
              size="icon-xs"
            >
              {isCopied ? (
                <CheckIcon className="size-4" />
              ) : (
                <CopyIcon className="size-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>

      {/* field.stories — PaymentMethod */}
      <div className="mb-4 break-inside-avoid">
        <form>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Payment Method</FieldLegend>
              <FieldDescription>
                All transactions are secure and encrypted
              </FieldDescription>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="demo-card-name">Name on Card</FieldLabel>
                  <Input id="demo-card-name" placeholder="Evil Rabbit" />
                </Field>
                <Field>
                  <FieldLabel htmlFor="demo-card-number">
                    Card Number
                  </FieldLabel>
                  <Input
                    id="demo-card-number"
                    placeholder="1234 5678 9012 3456"
                  />
                  <FieldDescription>
                    Enter your 16-digit card number
                  </FieldDescription>
                </Field>
                <div className="grid grid-cols-3 gap-4">
                  <Field>
                    <FieldLabel htmlFor="demo-exp-month">Month</FieldLabel>
                    <Input id="demo-exp-month" placeholder="MM" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="demo-exp-year">Year</FieldLabel>
                    <Input id="demo-exp-year" placeholder="YYYY" />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="demo-cvv">CVV</FieldLabel>
                    <Input id="demo-cvv" placeholder="123" />
                  </Field>
                </div>
              </FieldGroup>
            </FieldSet>
            <FieldSeparator />
            <FieldSet>
              <FieldLegend>Billing Address</FieldLegend>
              <FieldDescription>
                The billing address associated with your payment method
              </FieldDescription>
              <FieldGroup>
                <Field orientation="horizontal">
                  <Checkbox defaultChecked id="demo-same-shipping" />
                  <FieldLabel
                    className="font-normal"
                    htmlFor="demo-same-shipping"
                  >
                    Same as shipping address
                  </FieldLabel>
                </Field>
              </FieldGroup>
            </FieldSet>
            <FieldSet>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="demo-comments">Comments</FieldLabel>
                  <Textarea
                    className="resize-none"
                    id="demo-comments"
                    placeholder="Add any additional comments"
                  />
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field orientation="horizontal">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </div>

      {/* field.stories — SettingsForm */}
      <div className="mb-4 break-inside-avoid">
        <FieldSet>
          <FieldGroup>
            <FieldSet>
              <FieldLegend>Compute Environment</FieldLegend>
              <FieldDescription>
                Select the compute environment for your cluster.
              </FieldDescription>
              <RadioGroup defaultValue="kubernetes">
                <FieldLabel htmlFor="demo-kubernetes">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Kubernetes</FieldTitle>
                      <FieldDescription>
                        Run GPU workloads on a K8s configured cluster. This is
                        the default.
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      aria-label="Kubernetes"
                      id="demo-kubernetes"
                      value="kubernetes"
                    />
                  </Field>
                </FieldLabel>
                <FieldLabel htmlFor="demo-vm">
                  <Field orientation="horizontal">
                    <FieldContent>
                      <FieldTitle>Virtual Machine</FieldTitle>
                      <FieldDescription>
                        Access a VM configured cluster to run workloads. (Coming
                        soon)
                      </FieldDescription>
                    </FieldContent>
                    <RadioGroupItem
                      aria-label="Virtual Machine"
                      id="demo-vm"
                      value="vm"
                    />
                  </Field>
                </FieldLabel>
              </RadioGroup>
            </FieldSet>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="demo-gpus">Number of GPUs</FieldLabel>
                <FieldDescription>You can add more later.</FieldDescription>
              </FieldContent>
              <ButtonGroup>
                <Input
                  className="h-7 w-14! font-mono"
                  id="demo-gpus"
                  maxLength={3}
                  onChange={handleGpuInputChange}
                  size={3}
                  value={gpuCount}
                />
                <Button
                  aria-label="Decrement"
                  disabled={gpuCount <= 1}
                  onClick={() => handleGpuAdjustment(-1)}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <MinusIcon />
                </Button>
                <Button
                  aria-label="Increment"
                  disabled={gpuCount >= 99}
                  onClick={() => handleGpuAdjustment(1)}
                  size="icon-sm"
                  type="button"
                  variant="outline"
                >
                  <PlusIcon />
                </Button>
              </ButtonGroup>
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="demo-tinting">
                  Wallpaper Tinting
                </FieldLabel>
                <FieldDescription>
                  Allow the wallpaper to be tinted.
                </FieldDescription>
              </FieldContent>
              <Switch defaultChecked id="demo-tinting" />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>

      {/* badge.stories — StatsBadges / Card with Stats Footer */}
      <div className="mb-4 break-inside-avoid overflow-hidden rounded-lg border bg-card">
        <div className="border-b p-4">
          <h4 className="font-medium">Luxury Apartment</h4>
          <p className="text-muted-foreground text-sm">
            123 Main Street, Anytown
          </p>
        </div>
        <div className="p-4">
          <p className="text-sm">
            Modern apartment with stunning views and premium amenities.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 bg-muted/50 px-4 py-3">
          <Badge variant="outline">
            <BedIcon />3
          </Badge>
          <Badge variant="outline">
            <BathIcon />2
          </Badge>
          <Badge variant="outline">
            <LandPlotIcon />
            120m²
          </Badge>
          <div className="ml-auto font-medium tabular-nums">$1,200/mo</div>
        </div>
      </div>

      {/* checkbox.stories — PillCheckboxGroup */}
      <Card className="mb-4 break-inside-avoid py-4 shadow-none">
        <CardContent className="px-4">
          <form>
            <FieldGroup>
              <FieldSet className="gap-4">
                <FieldLegend>How did you hear about us?</FieldLegend>
                <FieldDescription className="line-clamp-1">
                  Select the option that best describes how you heard about us.
                </FieldDescription>
                <FieldGroup className="flex flex-row flex-wrap gap-2 rounded-full">
                  {PILL_OPTIONS.map((option) => (
                    <FieldLabel
                      className="w-fit!"
                      htmlFor={`demo-pill-${option.value}`}
                      key={option.value}
                    >
                      <Field
                        className="gap-1.5 overflow-hidden px-3! py-1.5! transition-all duration-100 ease-linear group-has-data-checked/field-label:px-2!"
                        orientation="horizontal"
                      >
                        <Checkbox
                          className="-ml-6 -translate-x-1 rounded-full transition-all duration-100 ease-linear data-checked:ml-0 data-checked:translate-x-0"
                          defaultChecked={option.value === "social-media"}
                          id={`demo-pill-${option.value}`}
                          value={option.value}
                        />
                        <FieldTitle>{option.label}</FieldTitle>
                      </Field>
                    </FieldLabel>
                  ))}
                </FieldGroup>
              </FieldSet>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {/* description-list.stories — OrderSummary */}
      <Card className="mb-4 break-inside-avoid">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <DescriptionList>
            {ORDER_ITEMS.map((item) => (
              <DescriptionListItem key={item.label}>
                <DescriptionListTerm>{item.label}</DescriptionListTerm>
                <DescriptionListDetails>{item.value}</DescriptionListDetails>
              </DescriptionListItem>
            ))}
            <DescriptionListItem className="font-medium">
              <DescriptionListTerm className="text-foreground">
                Total
              </DescriptionListTerm>
              <DescriptionListDetails>$1,387.50</DescriptionListDetails>
            </DescriptionListItem>
          </DescriptionList>
        </CardContent>
      </Card>

      {/* circular-progress.stories — CustomCenterContent */}
      <div className="mb-4 flex break-inside-avoid items-center justify-center gap-6">
        <CircularProgress color="success" size="lg" value={85}>
          <CircularProgressTrack />
          <CircularProgressIndicator />
          <div className="relative flex flex-col items-center">
            <TrendingUpIcon className="size-6 text-foreground" />
            <span className="text-muted-foreground text-xs">Growth</span>
          </div>
        </CircularProgress>
        <CircularProgress color="destructive" size="lg" value={92}>
          <CircularProgressTrack />
          <CircularProgressIndicator />
          <div className="relative flex flex-col items-center">
            <FlameIcon className="size-6 text-foreground" />
            <span className="text-muted-foreground text-xs">CPU</span>
          </div>
        </CircularProgress>
        <CircularProgress color="warning" size="lg" value={60}>
          <CircularProgressTrack />
          <CircularProgressIndicator />
          <div className="relative flex flex-col items-center">
            <ZapIcon className="size-6 text-foreground" />
            <span className="text-muted-foreground text-xs">Energy</span>
          </div>
        </CircularProgress>
      </div>

      {/* pagination.stories — Default */}
      <div className="mb-4 break-inside-avoid">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>
                2
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      {/* alert.stories — Info */}
      <Alert className="mb-4 break-inside-avoid" variant="info">
        <InfoIcon />
        <AlertTitle>New Feature is Available</AlertTitle>
        <AlertDescription>
          Check out our latest trading tools and analytics
        </AlertDescription>
      </Alert>
    </div>
  );
}
