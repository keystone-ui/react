import type { ComponentType } from "react";

// accordion
import AccordionCustomChevron from "./accordion/custom-chevron";
import AccordionDefault from "./accordion/default";
import AccordionDisabled from "./accordion/disabled";
import AccordionMultiple from "./accordion/multiple";
import AccordionVariants from "./accordion/variants";

// alert
import AlertCustomColors from "./alert/custom-colors";
import AlertDefault from "./alert/default";
import AlertVariants from "./alert/variants";
import AlertWithAction from "./alert/with-action";
import AlertWithoutIcon from "./alert/without-icon";

// alert-dialog
import AlertDialogDefault from "./alert-dialog/default";
import AlertDialogDestructive from "./alert-dialog/destructive";
import AlertDialogSmall from "./alert-dialog/small";
import AlertDialogSmallWithMedia from "./alert-dialog/small-with-media";
import AlertDialogWithMedia from "./alert-dialog/with-media";

// aspect-ratio
import AspectRatioDefault from "./aspect-ratio/default";
import AspectRatioPortrait from "./aspect-ratio/portrait";
import AspectRatioSquare from "./aspect-ratio/square";
import AspectRatioWide from "./aspect-ratio/wide";

// avatar
import AvatarBadgeWithIcon from "./avatar/badge-with-icon";
import AvatarDefault from "./avatar/default";
import AvatarFallback from "./avatar/fallback";
import AvatarGroup from "./avatar/group";
import AvatarGroupWithCount from "./avatar/group-with-count";
import AvatarSizes from "./avatar/sizes";
import AvatarWithBadge from "./avatar/with-badge";

// badge
import BadgeAsLink from "./badge/as-link";
import BadgeCustomColors from "./badge/custom-colors";
import BadgeDefault from "./badge/default";
import BadgeRemovable from "./badge/removable";
import BadgeSizes from "./badge/sizes";
import BadgeStats from "./badge/stats";
import BadgeVariants from "./badge/variants";
import BadgeWithIcon from "./badge/with-icon";
import BadgeWithSpinner from "./badge/with-spinner";
// blocks
import Login01 from "./blocks/login-01";
import Login02 from "./blocks/login-02";
import Login03 from "./blocks/login-03";
import Login04 from "./blocks/login-04";
import ProfileDropdown01 from "./blocks/profile-dropdown-01";
// breadcrumb
import BreadcrumbCollapsed from "./breadcrumb/collapsed";
import BreadcrumbCustomSeparator from "./breadcrumb/custom-separator";
import BreadcrumbDefault from "./breadcrumb/default";
import BreadcrumbLinkComponent from "./breadcrumb/link-component";
import BreadcrumbWithDropdown from "./breadcrumb/with-dropdown";
// button
import ButtonAsLink from "./button/as-link";
import ButtonCustomLoading from "./button/custom-loading";
import ButtonDefault from "./button/default";
import ButtonDisabled from "./button/disabled";
import ButtonFullWidth from "./button/full-width";
import ButtonIconButtons from "./button/icon-buttons";
import ButtonLink from "./button/link";
import ButtonLoading from "./button/loading";
import ButtonRounded from "./button/rounded";
import ButtonSizes from "./button/sizes";
import ButtonSocialButtons from "./button/social-buttons";
import ButtonVariants from "./button/variants";
import ButtonWithIcons from "./button/with-icons";
// button-group
import ButtonGroupDefault from "./button-group/default";
import ButtonGroupEmailToolbar from "./button-group/email-toolbar";
import ButtonGroupNested from "./button-group/nested";
import ButtonGroupSizes from "./button-group/sizes";
import ButtonGroupSplitButton from "./button-group/split-button";
import ButtonGroupToolbar from "./button-group/toolbar";
import ButtonGroupVertical from "./button-group/vertical";
import ButtonGroupWithDropdownMenu from "./button-group/with-dropdown-menu";
import ButtonGroupWithInput from "./button-group/with-input";
import ButtonGroupWithPopover from "./button-group/with-popover";
import ButtonGroupWithSelect from "./button-group/with-select";
// calendar
import CalendarBookedDates from "./calendar/booked-dates";
import CalendarDateTime from "./calendar/date-time";
import CalendarDefault from "./calendar/default";
import CalendarMonthYear from "./calendar/month-year";
import CalendarPresets from "./calendar/presets";
import CalendarRange from "./calendar/range";
import CalendarWeekNumbers from "./calendar/week-numbers";
// card
import CardDefault from "./card/default";
import CardLoginForm from "./card/login-form";
import CardSmall from "./card/small";
import CardSocialCard from "./card/social-card";
import CardWithAction from "./card/with-action";
import CardWithImage from "./card/with-image";
// carousel
import CarouselAutoplay from "./carousel/autoplay";
import CarouselCards from "./carousel/cards";
import CarouselControlled from "./carousel/controlled";
import CarouselDefault from "./carousel/default";
import CarouselMultipleSlides from "./carousel/multiple-slides";
import CarouselSizes from "./carousel/sizes";
import CarouselSpacing from "./carousel/spacing";
import CarouselThumbnails from "./carousel/thumbnails";
import CarouselVertical from "./carousel/vertical";
import CarouselWithCounter from "./carousel/with-counter";
import CarouselWithDots from "./carousel/with-dots";
import CarouselWithMask from "./carousel/with-mask";
// checkbox
import CheckboxControlled from "./checkbox/controlled";
import CheckboxDefault from "./checkbox/default";
import CheckboxDisabled from "./checkbox/disabled";
import CheckboxGroup from "./checkbox/group";
import CheckboxPillGroup from "./checkbox/pill-group";
import CheckboxWithDescription from "./checkbox/with-description";
// circular-progress
import CircularProgressAnimated from "./circular-progress/animated";
import CircularProgressColors from "./circular-progress/colors";
import CircularProgressComplete from "./circular-progress/complete";
import CircularProgressControlled from "./circular-progress/controlled";
import CircularProgressCustomCenterContent from "./circular-progress/custom-center-content";
import CircularProgressDefault from "./circular-progress/default";
import CircularProgressIndeterminate from "./circular-progress/indeterminate";
import CircularProgressSizes from "./circular-progress/sizes";
import CircularProgressWithAvatar from "./circular-progress/with-avatar";
import CircularProgressWithLabel from "./circular-progress/with-label";
// collapsible
import CollapsibleDefault from "./collapsible/default";
import CollapsibleFileTree from "./collapsible/file-tree";
import CollapsibleSettings from "./collapsible/settings";
// combobox
import ComboboxCompactItems from "./combobox/compact-items";
import ComboboxControlled from "./combobox/controlled";
import ComboboxCountries from "./combobox/countries";
import ComboboxCustomItems from "./combobox/custom-items";
import ComboboxDefault from "./combobox/default";
import ComboboxDisabled from "./combobox/disabled";
import ComboboxFormExample from "./combobox/form-example";
import ComboboxGroups from "./combobox/groups";
import ComboboxMultiple from "./combobox/multiple";
import ComboboxPopup from "./combobox/popup";
import ComboboxScrollable from "./combobox/scrollable";
import ComboboxWithClear from "./combobox/with-clear";
// command
import CommandDefault from "./command/default";
import CommandDisabledItems from "./command/disabled-items";
import CommandGroups from "./command/groups";
import CommandKeyboardTrigger from "./command/keyboard-trigger";
import CommandScrollable from "./command/scrollable";
import CommandWithShortcuts from "./command/with-shortcuts";
// date-input
import DateInputControlled from "./date-input/controlled";
import DateInputDateOfBirth from "./date-input/date-of-birth";
import DateInputDefault from "./date-input/default";
import DateInputNaturalLanguage from "./date-input/natural-language";
import DateInputPresets from "./date-input/presets";
import DateInputRange from "./date-input/range";
import DateInputWithInput from "./date-input/with-input";
import DateInputWithTime from "./date-input/with-time";
// description-list
import DescriptionListCardVariant from "./description-list/card-variant";
import DescriptionListCompact from "./description-list/compact";
import DescriptionListCustomValues from "./description-list/custom-values";
import DescriptionListDefault from "./description-list/default";
import DescriptionListInCard from "./description-list/in-card";
import DescriptionListOrderSummary from "./description-list/order-summary";
// drawer
import DrawerComplexFilter from "./drawer/complex-filter";
import DrawerDefault from "./drawer/default";
import DrawerFilter from "./drawer/filter";
import DrawerNested from "./drawer/nested";
import DrawerResponsive from "./drawer/responsive";
import DrawerScrollable from "./drawer/scrollable";
import DrawerSides from "./drawer/sides";
import DrawerSortBy from "./drawer/sort-by";
// dropdown-menu
import DropdownMenuAccount from "./dropdown-menu/account";
import DropdownMenuCheckboxes from "./dropdown-menu/checkboxes";
import DropdownMenuComplex from "./dropdown-menu/complex";
import DropdownMenuDefault from "./dropdown-menu/default";
import DropdownMenuDestructive from "./dropdown-menu/destructive";
import DropdownMenuRadioGroup from "./dropdown-menu/radio-group";
import DropdownMenuShortcuts from "./dropdown-menu/shortcuts";
import DropdownMenuSubmenu from "./dropdown-menu/submenu";
import DropdownMenuWithIcons from "./dropdown-menu/with-icons";
// empty
import EmptyBackground from "./empty/background";
import EmptyDefault from "./empty/default";
import EmptyOutline from "./empty/outline";
import EmptyWithAction from "./empty/with-action";
import EmptyWithAvatar from "./empty/with-avatar";
import EmptyWithDescription from "./empty/with-description";
import EmptyWithForm from "./empty/with-form";
import EmptyWithImage from "./empty/with-image";
import EmptyWithInput from "./empty/with-input";
import EmptyWithList from "./empty/with-list";
import EmptyWithSearch from "./empty/with-search";
import EmptyWithSpinner from "./empty/with-spinner";
// field
import FieldCheckoutForm from "./field/checkout-form";
import FieldDefault from "./field/default";
import FieldFieldset from "./field/fieldset";
import FieldGrid from "./field/grid";
import FieldHorizontal from "./field/horizontal";
import FieldMultipleErrors from "./field/multiple-errors";
import FieldPaymentMethod from "./field/payment-method";
import FieldRequired from "./field/required";
import FieldSettingsForm from "./field/settings-form";
import FieldTextareaExample from "./field/textarea-example";
import FieldValidationError from "./field/validation-error";
import FieldWithCheckbox from "./field/with-checkbox";
import FieldWithSwitch from "./field/with-switch";
// form
import FormDefault from "./form/default";
import FormWithValidation from "./form/with-validation";
// input
import InputDefault from "./input/default";
import InputDisabled from "./input/disabled";
import InputFile from "./input/file";
import InputFormExample from "./input/form-example";
import InputSizes from "./input/sizes";
import InputTypes from "./input/types";
import InputWithButton from "./input/with-button";
import InputWithError from "./input/with-error";
import InputWithField from "./input/with-field";
import InputWithHelperText from "./input/with-helper-text";
import InputWithIcon from "./input/with-icon";
import InputWithLabel from "./input/with-label";
import InputWithPasswordToggle from "./input/with-password-toggle";
import InputWithPrefix from "./input/with-prefix";
// input-group
import InputGroupClearButton from "./input-group/clear-button";
import InputGroupCopyToClipboard from "./input-group/copy-to-clipboard";
import InputGroupCurrency from "./input-group/currency";
import InputGroupDefault from "./input-group/default";
import InputGroupEmailInput from "./input-group/email-input";
import InputGroupLoadingSpinner from "./input-group/loading-spinner";
import InputGroupPasswordToggle from "./input-group/password-toggle";
import InputGroupPhoneInput from "./input-group/phone-input";
import InputGroupPromptForm from "./input-group/prompt-form";
import InputGroupSearch from "./input-group/search";
import InputGroupTextPrefix from "./input-group/text-prefix";
import InputGroupTextSuffix from "./input-group/text-suffix";
import InputGroupWithButton from "./input-group/with-button";
import InputGroupWithTextarea from "./input-group/with-textarea";
// input-otp
import InputOtpAlphanumeric from "./input-otp/alphanumeric";
import InputOtpDefault from "./input-otp/default";
import InputOtpDisabled from "./input-otp/disabled";
import InputOtpForm from "./input-otp/form";
import InputOtpFourDigits from "./input-otp/four-digits";
import InputOtpLoading from "./input-otp/loading";
import InputOtpWithSeparator from "./input-otp/with-separator";
// item
import ItemActivityFeed from "./item/activity-feed";
import ItemDefault from "./item/default";
import ItemGroup from "./item/group";
import ItemLink from "./item/link";
import ItemNotificationList from "./item/notification-list";
import ItemSettingsList from "./item/settings-list";
import ItemSizes from "./item/sizes";
import ItemWithActions from "./item/with-actions";
import ItemWithAvatar from "./item/with-avatar";
import ItemWithDescription from "./item/with-description";
import ItemWithFooter from "./item/with-footer";
import ItemWithIcon from "./item/with-icon";
import ItemWithImage from "./item/with-image";
import ItemWithSeparator from "./item/with-separator";
// kbd
import KbdCommonShortcuts from "./kbd/common-shortcuts";
import KbdDefault from "./kbd/default";
import KbdFunctionKeys from "./kbd/function-keys";
import KbdGroup from "./kbd/group";
import KbdModifierKeys from "./kbd/modifier-keys";
import KbdSpecialKeys from "./kbd/special-keys";
// label
import LabelDefault from "./label/default";
import LabelRequired from "./label/required";
import LabelWithDescription from "./label/with-description";
// modal
import ModalConfirmation from "./modal/confirmation";
import ModalControlled from "./modal/controlled";
import ModalDefault from "./modal/default";
import ModalLongContent from "./modal/long-content";
import ModalMultiStep from "./modal/multi-step";
import ModalNested from "./modal/nested";
import ModalScrollable from "./modal/scrollable";
import ModalSignUpForm from "./modal/sign-up-form";
import ModalSizes from "./modal/sizes";
import ModalStickyFooter from "./modal/sticky-footer";
// native-select
import NativeSelectDefault from "./native-select/default";
import NativeSelectDisabled from "./native-select/disabled";
import NativeSelectFormExample from "./native-select/form-example";
import NativeSelectGroups from "./native-select/groups";
import NativeSelectInvalid from "./native-select/invalid";
import NativeSelectSizes from "./native-select/sizes";
// pagination
import PaginationDataTable from "./pagination/data-table";
import PaginationDefault from "./pagination/default";
import PaginationSimple from "./pagination/simple";
// popover
import PopoverAlignments from "./popover/alignments";
import PopoverDefault from "./popover/default";
import PopoverOpenOnHover from "./popover/open-on-hover";
import PopoverWithArrow from "./popover/with-arrow";
import PopoverWithForm from "./popover/with-form";
// progress
import ProgressAnimated from "./progress/animated";
import ProgressColors from "./progress/colors";
import ProgressComplete from "./progress/complete";
import ProgressControlled from "./progress/controlled";
import ProgressDefault from "./progress/default";
import ProgressIndeterminate from "./progress/indeterminate";
import ProgressWithLabel from "./progress/with-label";
// radio-group
import RadioGroupChoiceCard from "./radio-group/choice-card";
import RadioGroupDefault from "./radio-group/default";
import RadioGroupDisabled from "./radio-group/disabled";
import RadioGroupFieldset from "./radio-group/fieldset";
import RadioGroupHorizontal from "./radio-group/horizontal";
import RadioGroupWithDescription from "./radio-group/with-description";
// resizable
import ResizableCollapsible from "./resizable/collapsible";
import ResizableComplexLayout from "./resizable/complex-layout";
import ResizableDefault from "./resizable/default";
import ResizableNested from "./resizable/nested";
import ResizableVertical from "./resizable/vertical";
import ResizableWithHandle from "./resizable/with-handle";
// select
import SelectControlled from "./select/controlled";
import SelectDefault from "./select/default";
import SelectDisabled from "./select/disabled";
import SelectFormExample from "./select/form-example";
import SelectGroups from "./select/groups";
import SelectMultiple from "./select/multiple";
import SelectScrollable from "./select/scrollable";
import SelectSizes from "./select/sizes";
import SelectWithIcons from "./select/with-icons";
// separator
import SeparatorDefault from "./separator/default";
import SeparatorVertical from "./separator/vertical";
import SeparatorWithContent from "./separator/with-content";
// skeleton
import SkeletonCard from "./skeleton/card";
import SkeletonDefault from "./skeleton/default";
import SkeletonForm from "./skeleton/form";
import SkeletonNoAnimation from "./skeleton/no-animation";
import SkeletonShimmer from "./skeleton/shimmer";
import SkeletonTable from "./skeleton/table";
import SkeletonText from "./skeleton/text";
// slider
import SliderControlled from "./slider/controlled";
import SliderCustomStep from "./slider/custom-step";
import SliderDefault from "./slider/default";
import SliderDisabled from "./slider/disabled";
import SliderRange from "./slider/range";
import SliderWithLabel from "./slider/with-label";
// spinner
import SpinnerDefault from "./spinner/default";
import SpinnerSizes from "./spinner/sizes";
import SpinnerWithBadge from "./spinner/with-badge";
import SpinnerWithButton from "./spinner/with-button";
import SpinnerWithEmpty from "./spinner/with-empty";
// stepper
import StepperControlled from "./stepper/controlled";
import StepperDefault from "./stepper/default";
import StepperWithIndicator from "./stepper/with-indicator";
// switch
import SwitchChoiceCard from "./switch/choice-card";
import SwitchDefault from "./switch/default";
import SwitchDisabled from "./switch/disabled";
import SwitchSizes from "./switch/sizes";
import SwitchWithDescription from "./switch/with-description";
// table
import TableActions from "./table/actions";
import TableCard from "./table/card";
import TableCompact from "./table/compact";
import TableDefault from "./table/default";
import TableEmptyState from "./table/empty-state";
import TableFooter from "./table/footer";
import TableHoverable from "./table/hoverable";
import TableSelectedRows from "./table/selected-rows";
import TableStriped from "./table/striped";
import TableWithBadges from "./table/with-badges";
import TableWithPagination from "./table/with-pagination";
// tabs
import TabsAnimatedIndicator from "./tabs/animated-indicator";
import TabsDefault from "./tabs/default";
import TabsDisabled from "./tabs/disabled";
import TabsLine from "./tabs/line";
import TabsLineVertical from "./tabs/line-vertical";
import TabsPill from "./tabs/pill";
import TabsScrollable from "./tabs/scrollable";
import TabsVertical from "./tabs/vertical";
import TabsWithIcons from "./tabs/with-icons";
// tag
import TagDefault from "./tag/default";
import TagDisabled from "./tag/disabled";
import TagStates from "./tag/states";
import TagWithIcon from "./tag/with-icon";
import TagWithRemove from "./tag/with-remove";
// tag-group
import TagGroupControlled from "./tag-group/controlled";
import TagGroupDefault from "./tag-group/default";
import TagGroupDisabled from "./tag-group/disabled";
import TagGroupRemovable from "./tag-group/removable";
import TagGroupSingleSelection from "./tag-group/single-selection";
import TagGroupWithAvatars from "./tag-group/with-avatars";
import TagGroupWithIcons from "./tag-group/with-icons";
// textarea
import TextareaCharacterCount from "./textarea/character-count";
import TextareaDefault from "./textarea/default";
import TextareaDisabled from "./textarea/disabled";
import TextareaWithError from "./textarea/with-error";
import TextareaWithField from "./textarea/with-field";
// toast
import ToastCustom from "./toast/custom";
import ToastDefault from "./toast/default";
import ToastDuration from "./toast/duration";
import ToastPosition from "./toast/position";
import ToastPromise from "./toast/promise";
import ToastTypes from "./toast/types";
import ToastWithAction from "./toast/with-action";
import ToastWithDescription from "./toast/with-description";
// toggle
import ToggleDefault from "./toggle/default";
import ToggleDisabled from "./toggle/disabled";
import ToggleOutline from "./toggle/outline";
import TogglePressed from "./toggle/pressed";
import ToggleSizes from "./toggle/sizes";
import ToggleWithText from "./toggle/with-text";
// toggle-group
import ToggleGroupCustom from "./toggle-group/custom";
import ToggleGroupDefault from "./toggle-group/default";
import ToggleGroupDisabled from "./toggle-group/disabled";
import ToggleGroupOutline from "./toggle-group/outline";
import ToggleGroupSingle from "./toggle-group/single";
import ToggleGroupSizes from "./toggle-group/sizes";
import ToggleGroupSpacing from "./toggle-group/spacing";
import ToggleGroupTextLabels from "./toggle-group/text-labels";
import ToggleGroupVertical from "./toggle-group/vertical";
// tooltip
import TooltipDefault from "./tooltip/default";
import TooltipDisabledButton from "./tooltip/disabled-button";
import TooltipGroupDelay from "./tooltip/group-delay";
import TooltipSides from "./tooltip/sides";
import TooltipWithKbd from "./tooltip/with-kbd";

// typography
import TypographyBlockquote from "./typography/blockquote";
import TypographyDefault from "./typography/default";
import TypographyH1 from "./typography/h1";
import TypographyH2 from "./typography/h2";
import TypographyH3 from "./typography/h3";
import TypographyH4 from "./typography/h4";
import TypographyInlineCode from "./typography/inline-code";
import TypographyLarge from "./typography/large";
import TypographyLead from "./typography/lead";
import TypographyList from "./typography/list";
import TypographyMuted from "./typography/muted";
import TypographyParagraph from "./typography/paragraph";
import TypographySmall from "./typography/small";

export interface DemoItem {
  component: ComponentType;
  file: string;
}

export const demos: Record<string, DemoItem> = {
  // accordion
  "accordion-custom-chevron": {
    component: AccordionCustomChevron,
    file: "accordion/custom-chevron.tsx",
  },
  "accordion-default": {
    component: AccordionDefault,
    file: "accordion/default.tsx",
  },
  "accordion-disabled": {
    component: AccordionDisabled,
    file: "accordion/disabled.tsx",
  },
  "accordion-multiple": {
    component: AccordionMultiple,
    file: "accordion/multiple.tsx",
  },
  "accordion-variants": {
    component: AccordionVariants,
    file: "accordion/variants.tsx",
  },

  // alert
  "alert-custom-colors": {
    component: AlertCustomColors,
    file: "alert/custom-colors.tsx",
  },
  "alert-default": {
    component: AlertDefault,
    file: "alert/default.tsx",
  },
  "alert-variants": {
    component: AlertVariants,
    file: "alert/variants.tsx",
  },
  "alert-with-action": {
    component: AlertWithAction,
    file: "alert/with-action.tsx",
  },
  "alert-without-icon": {
    component: AlertWithoutIcon,
    file: "alert/without-icon.tsx",
  },

  // alert-dialog
  "alert-dialog-default": {
    component: AlertDialogDefault,
    file: "alert-dialog/default.tsx",
  },
  "alert-dialog-destructive": {
    component: AlertDialogDestructive,
    file: "alert-dialog/destructive.tsx",
  },
  "alert-dialog-small": {
    component: AlertDialogSmall,
    file: "alert-dialog/small.tsx",
  },
  "alert-dialog-small-with-media": {
    component: AlertDialogSmallWithMedia,
    file: "alert-dialog/small-with-media.tsx",
  },
  "alert-dialog-with-media": {
    component: AlertDialogWithMedia,
    file: "alert-dialog/with-media.tsx",
  },

  // aspect-ratio
  "aspect-ratio-default": {
    component: AspectRatioDefault,
    file: "aspect-ratio/default.tsx",
  },
  "aspect-ratio-portrait": {
    component: AspectRatioPortrait,
    file: "aspect-ratio/portrait.tsx",
  },
  "aspect-ratio-square": {
    component: AspectRatioSquare,
    file: "aspect-ratio/square.tsx",
  },
  "aspect-ratio-wide": {
    component: AspectRatioWide,
    file: "aspect-ratio/wide.tsx",
  },

  // avatar
  "avatar-badge-with-icon": {
    component: AvatarBadgeWithIcon,
    file: "avatar/badge-with-icon.tsx",
  },
  "avatar-default": {
    component: AvatarDefault,
    file: "avatar/default.tsx",
  },
  "avatar-fallback": {
    component: AvatarFallback,
    file: "avatar/fallback.tsx",
  },
  "avatar-group": {
    component: AvatarGroup,
    file: "avatar/group.tsx",
  },
  "avatar-group-with-count": {
    component: AvatarGroupWithCount,
    file: "avatar/group-with-count.tsx",
  },
  "avatar-sizes": {
    component: AvatarSizes,
    file: "avatar/sizes.tsx",
  },
  "avatar-with-badge": {
    component: AvatarWithBadge,
    file: "avatar/with-badge.tsx",
  },

  // badge
  "badge-as-link": {
    component: BadgeAsLink,
    file: "badge/as-link.tsx",
  },
  "badge-custom-colors": {
    component: BadgeCustomColors,
    file: "badge/custom-colors.tsx",
  },
  "badge-default": {
    component: BadgeDefault,
    file: "badge/default.tsx",
  },
  "badge-removable": {
    component: BadgeRemovable,
    file: "badge/removable.tsx",
  },
  "badge-sizes": {
    component: BadgeSizes,
    file: "badge/sizes.tsx",
  },
  "badge-stats": {
    component: BadgeStats,
    file: "badge/stats.tsx",
  },
  "badge-variants": {
    component: BadgeVariants,
    file: "badge/variants.tsx",
  },
  "badge-with-icon": {
    component: BadgeWithIcon,
    file: "badge/with-icon.tsx",
  },
  "badge-with-spinner": {
    component: BadgeWithSpinner,
    file: "badge/with-spinner.tsx",
  },

  // breadcrumb
  "breadcrumb-collapsed": {
    component: BreadcrumbCollapsed,
    file: "breadcrumb/collapsed.tsx",
  },
  "breadcrumb-custom-separator": {
    component: BreadcrumbCustomSeparator,
    file: "breadcrumb/custom-separator.tsx",
  },
  "breadcrumb-default": {
    component: BreadcrumbDefault,
    file: "breadcrumb/default.tsx",
  },
  "breadcrumb-link-component": {
    component: BreadcrumbLinkComponent,
    file: "breadcrumb/link-component.tsx",
  },
  "breadcrumb-with-dropdown": {
    component: BreadcrumbWithDropdown,
    file: "breadcrumb/with-dropdown.tsx",
  },

  // button
  "button-as-link": {
    component: ButtonAsLink,
    file: "button/as-link.tsx",
  },
  "button-custom-loading": {
    component: ButtonCustomLoading,
    file: "button/custom-loading.tsx",
  },
  "button-default": {
    component: ButtonDefault,
    file: "button/default.tsx",
  },
  "button-disabled": {
    component: ButtonDisabled,
    file: "button/disabled.tsx",
  },
  "button-full-width": {
    component: ButtonFullWidth,
    file: "button/full-width.tsx",
  },
  "button-icon-buttons": {
    component: ButtonIconButtons,
    file: "button/icon-buttons.tsx",
  },
  "button-link": {
    component: ButtonLink,
    file: "button/link.tsx",
  },
  "button-loading": {
    component: ButtonLoading,
    file: "button/loading.tsx",
  },
  "button-rounded": {
    component: ButtonRounded,
    file: "button/rounded.tsx",
  },
  "button-sizes": {
    component: ButtonSizes,
    file: "button/sizes.tsx",
  },
  "button-social-buttons": {
    component: ButtonSocialButtons,
    file: "button/social-buttons.tsx",
  },
  "button-variants": {
    component: ButtonVariants,
    file: "button/variants.tsx",
  },
  "button-with-icons": {
    component: ButtonWithIcons,
    file: "button/with-icons.tsx",
  },

  // button-group
  "button-group-default": {
    component: ButtonGroupDefault,
    file: "button-group/default.tsx",
  },
  "button-group-email-toolbar": {
    component: ButtonGroupEmailToolbar,
    file: "button-group/email-toolbar.tsx",
  },
  "button-group-nested": {
    component: ButtonGroupNested,
    file: "button-group/nested.tsx",
  },
  "button-group-sizes": {
    component: ButtonGroupSizes,
    file: "button-group/sizes.tsx",
  },
  "button-group-split-button": {
    component: ButtonGroupSplitButton,
    file: "button-group/split-button.tsx",
  },
  "button-group-toolbar": {
    component: ButtonGroupToolbar,
    file: "button-group/toolbar.tsx",
  },
  "button-group-vertical": {
    component: ButtonGroupVertical,
    file: "button-group/vertical.tsx",
  },
  "button-group-with-dropdown-menu": {
    component: ButtonGroupWithDropdownMenu,
    file: "button-group/with-dropdown-menu.tsx",
  },
  "button-group-with-input": {
    component: ButtonGroupWithInput,
    file: "button-group/with-input.tsx",
  },
  "button-group-with-popover": {
    component: ButtonGroupWithPopover,
    file: "button-group/with-popover.tsx",
  },
  "button-group-with-select": {
    component: ButtonGroupWithSelect,
    file: "button-group/with-select.tsx",
  },

  // calendar
  "calendar-booked-dates": {
    component: CalendarBookedDates,
    file: "calendar/booked-dates.tsx",
  },
  "calendar-date-time": {
    component: CalendarDateTime,
    file: "calendar/date-time.tsx",
  },
  "calendar-default": {
    component: CalendarDefault,
    file: "calendar/default.tsx",
  },
  "calendar-month-year": {
    component: CalendarMonthYear,
    file: "calendar/month-year.tsx",
  },
  "calendar-presets": {
    component: CalendarPresets,
    file: "calendar/presets.tsx",
  },
  "calendar-range": {
    component: CalendarRange,
    file: "calendar/range.tsx",
  },
  "calendar-week-numbers": {
    component: CalendarWeekNumbers,
    file: "calendar/week-numbers.tsx",
  },

  // card
  "card-default": {
    component: CardDefault,
    file: "card/default.tsx",
  },
  "card-login-form": {
    component: CardLoginForm,
    file: "card/login-form.tsx",
  },
  "card-small": {
    component: CardSmall,
    file: "card/small.tsx",
  },
  "card-social-card": {
    component: CardSocialCard,
    file: "card/social-card.tsx",
  },
  "card-with-action": {
    component: CardWithAction,
    file: "card/with-action.tsx",
  },
  "card-with-image": {
    component: CardWithImage,
    file: "card/with-image.tsx",
  },

  // carousel
  "carousel-autoplay": {
    component: CarouselAutoplay,
    file: "carousel/autoplay.tsx",
  },
  "carousel-cards": {
    component: CarouselCards,
    file: "carousel/cards.tsx",
  },
  "carousel-controlled": {
    component: CarouselControlled,
    file: "carousel/controlled.tsx",
  },
  "carousel-default": {
    component: CarouselDefault,
    file: "carousel/default.tsx",
  },
  "carousel-multiple-slides": {
    component: CarouselMultipleSlides,
    file: "carousel/multiple-slides.tsx",
  },
  "carousel-sizes": {
    component: CarouselSizes,
    file: "carousel/sizes.tsx",
  },
  "carousel-spacing": {
    component: CarouselSpacing,
    file: "carousel/spacing.tsx",
  },
  "carousel-thumbnails": {
    component: CarouselThumbnails,
    file: "carousel/thumbnails.tsx",
  },
  "carousel-vertical": {
    component: CarouselVertical,
    file: "carousel/vertical.tsx",
  },
  "carousel-with-counter": {
    component: CarouselWithCounter,
    file: "carousel/with-counter.tsx",
  },
  "carousel-with-dots": {
    component: CarouselWithDots,
    file: "carousel/with-dots.tsx",
  },
  "carousel-with-mask": {
    component: CarouselWithMask,
    file: "carousel/with-mask.tsx",
  },

  // checkbox
  "checkbox-controlled": {
    component: CheckboxControlled,
    file: "checkbox/controlled.tsx",
  },
  "checkbox-default": {
    component: CheckboxDefault,
    file: "checkbox/default.tsx",
  },
  "checkbox-disabled": {
    component: CheckboxDisabled,
    file: "checkbox/disabled.tsx",
  },
  "checkbox-group": {
    component: CheckboxGroup,
    file: "checkbox/group.tsx",
  },
  "checkbox-pill-group": {
    component: CheckboxPillGroup,
    file: "checkbox/pill-group.tsx",
  },
  "checkbox-with-description": {
    component: CheckboxWithDescription,
    file: "checkbox/with-description.tsx",
  },

  // circular-progress
  "circular-progress-animated": {
    component: CircularProgressAnimated,
    file: "circular-progress/animated.tsx",
  },
  "circular-progress-colors": {
    component: CircularProgressColors,
    file: "circular-progress/colors.tsx",
  },
  "circular-progress-complete": {
    component: CircularProgressComplete,
    file: "circular-progress/complete.tsx",
  },
  "circular-progress-controlled": {
    component: CircularProgressControlled,
    file: "circular-progress/controlled.tsx",
  },
  "circular-progress-custom-center-content": {
    component: CircularProgressCustomCenterContent,
    file: "circular-progress/custom-center-content.tsx",
  },
  "circular-progress-default": {
    component: CircularProgressDefault,
    file: "circular-progress/default.tsx",
  },
  "circular-progress-indeterminate": {
    component: CircularProgressIndeterminate,
    file: "circular-progress/indeterminate.tsx",
  },
  "circular-progress-sizes": {
    component: CircularProgressSizes,
    file: "circular-progress/sizes.tsx",
  },
  "circular-progress-with-avatar": {
    component: CircularProgressWithAvatar,
    file: "circular-progress/with-avatar.tsx",
  },
  "circular-progress-with-label": {
    component: CircularProgressWithLabel,
    file: "circular-progress/with-label.tsx",
  },

  // collapsible
  "collapsible-default": {
    component: CollapsibleDefault,
    file: "collapsible/default.tsx",
  },
  "collapsible-file-tree": {
    component: CollapsibleFileTree,
    file: "collapsible/file-tree.tsx",
  },
  "collapsible-settings": {
    component: CollapsibleSettings,
    file: "collapsible/settings.tsx",
  },

  // combobox
  "combobox-compact-items": {
    component: ComboboxCompactItems,
    file: "combobox/compact-items.tsx",
  },
  "combobox-controlled": {
    component: ComboboxControlled,
    file: "combobox/controlled.tsx",
  },
  "combobox-countries": {
    component: ComboboxCountries,
    file: "combobox/countries.tsx",
  },
  "combobox-custom-items": {
    component: ComboboxCustomItems,
    file: "combobox/custom-items.tsx",
  },
  "combobox-default": {
    component: ComboboxDefault,
    file: "combobox/default.tsx",
  },
  "combobox-disabled": {
    component: ComboboxDisabled,
    file: "combobox/disabled.tsx",
  },
  "combobox-form-example": {
    component: ComboboxFormExample,
    file: "combobox/form-example.tsx",
  },
  "combobox-groups": {
    component: ComboboxGroups,
    file: "combobox/groups.tsx",
  },
  "combobox-multiple": {
    component: ComboboxMultiple,
    file: "combobox/multiple.tsx",
  },
  "combobox-popup": {
    component: ComboboxPopup,
    file: "combobox/popup.tsx",
  },
  "combobox-scrollable": {
    component: ComboboxScrollable,
    file: "combobox/scrollable.tsx",
  },
  "combobox-with-clear": {
    component: ComboboxWithClear,
    file: "combobox/with-clear.tsx",
  },

  // command
  "command-default": {
    component: CommandDefault,
    file: "command/default.tsx",
  },
  "command-disabled-items": {
    component: CommandDisabledItems,
    file: "command/disabled-items.tsx",
  },
  "command-groups": {
    component: CommandGroups,
    file: "command/groups.tsx",
  },
  "command-keyboard-trigger": {
    component: CommandKeyboardTrigger,
    file: "command/keyboard-trigger.tsx",
  },
  "command-scrollable": {
    component: CommandScrollable,
    file: "command/scrollable.tsx",
  },
  "command-with-shortcuts": {
    component: CommandWithShortcuts,
    file: "command/with-shortcuts.tsx",
  },

  // date-input
  "date-input-controlled": {
    component: DateInputControlled,
    file: "date-input/controlled.tsx",
  },
  "date-input-date-of-birth": {
    component: DateInputDateOfBirth,
    file: "date-input/date-of-birth.tsx",
  },
  "date-input-default": {
    component: DateInputDefault,
    file: "date-input/default.tsx",
  },
  "date-input-natural-language": {
    component: DateInputNaturalLanguage,
    file: "date-input/natural-language.tsx",
  },
  "date-input-presets": {
    component: DateInputPresets,
    file: "date-input/presets.tsx",
  },
  "date-input-range": {
    component: DateInputRange,
    file: "date-input/range.tsx",
  },
  "date-input-with-input": {
    component: DateInputWithInput,
    file: "date-input/with-input.tsx",
  },
  "date-input-with-time": {
    component: DateInputWithTime,
    file: "date-input/with-time.tsx",
  },

  // description-list
  "description-list-card-variant": {
    component: DescriptionListCardVariant,
    file: "description-list/card-variant.tsx",
  },
  "description-list-compact": {
    component: DescriptionListCompact,
    file: "description-list/compact.tsx",
  },
  "description-list-custom-values": {
    component: DescriptionListCustomValues,
    file: "description-list/custom-values.tsx",
  },
  "description-list-default": {
    component: DescriptionListDefault,
    file: "description-list/default.tsx",
  },
  "description-list-in-card": {
    component: DescriptionListInCard,
    file: "description-list/in-card.tsx",
  },
  "description-list-order-summary": {
    component: DescriptionListOrderSummary,
    file: "description-list/order-summary.tsx",
  },

  // drawer
  "drawer-complex-filter": {
    component: DrawerComplexFilter,
    file: "drawer/complex-filter.tsx",
  },
  "drawer-default": {
    component: DrawerDefault,
    file: "drawer/default.tsx",
  },
  "drawer-filter": {
    component: DrawerFilter,
    file: "drawer/filter.tsx",
  },
  "drawer-nested": {
    component: DrawerNested,
    file: "drawer/nested.tsx",
  },
  "drawer-responsive": {
    component: DrawerResponsive,
    file: "drawer/responsive.tsx",
  },
  "drawer-scrollable": {
    component: DrawerScrollable,
    file: "drawer/scrollable.tsx",
  },
  "drawer-sides": {
    component: DrawerSides,
    file: "drawer/sides.tsx",
  },
  "drawer-sort-by": {
    component: DrawerSortBy,
    file: "drawer/sort-by.tsx",
  },

  // dropdown-menu
  "dropdown-menu-account": {
    component: DropdownMenuAccount,
    file: "dropdown-menu/account.tsx",
  },
  "dropdown-menu-checkboxes": {
    component: DropdownMenuCheckboxes,
    file: "dropdown-menu/checkboxes.tsx",
  },
  "dropdown-menu-complex": {
    component: DropdownMenuComplex,
    file: "dropdown-menu/complex.tsx",
  },
  "dropdown-menu-default": {
    component: DropdownMenuDefault,
    file: "dropdown-menu/default.tsx",
  },
  "dropdown-menu-destructive": {
    component: DropdownMenuDestructive,
    file: "dropdown-menu/destructive.tsx",
  },
  "dropdown-menu-radio-group": {
    component: DropdownMenuRadioGroup,
    file: "dropdown-menu/radio-group.tsx",
  },
  "dropdown-menu-shortcuts": {
    component: DropdownMenuShortcuts,
    file: "dropdown-menu/shortcuts.tsx",
  },
  "dropdown-menu-submenu": {
    component: DropdownMenuSubmenu,
    file: "dropdown-menu/submenu.tsx",
  },
  "dropdown-menu-with-icons": {
    component: DropdownMenuWithIcons,
    file: "dropdown-menu/with-icons.tsx",
  },

  // empty
  "empty-background": {
    component: EmptyBackground,
    file: "empty/background.tsx",
  },
  "empty-default": {
    component: EmptyDefault,
    file: "empty/default.tsx",
  },
  "empty-outline": {
    component: EmptyOutline,
    file: "empty/outline.tsx",
  },
  "empty-with-action": {
    component: EmptyWithAction,
    file: "empty/with-action.tsx",
  },
  "empty-with-avatar": {
    component: EmptyWithAvatar,
    file: "empty/with-avatar.tsx",
  },
  "empty-with-description": {
    component: EmptyWithDescription,
    file: "empty/with-description.tsx",
  },
  "empty-with-form": {
    component: EmptyWithForm,
    file: "empty/with-form.tsx",
  },
  "empty-with-image": {
    component: EmptyWithImage,
    file: "empty/with-image.tsx",
  },
  "empty-with-input": {
    component: EmptyWithInput,
    file: "empty/with-input.tsx",
  },
  "empty-with-list": {
    component: EmptyWithList,
    file: "empty/with-list.tsx",
  },
  "empty-with-search": {
    component: EmptyWithSearch,
    file: "empty/with-search.tsx",
  },
  "empty-with-spinner": {
    component: EmptyWithSpinner,
    file: "empty/with-spinner.tsx",
  },

  // field
  "field-checkout-form": {
    component: FieldCheckoutForm,
    file: "field/checkout-form.tsx",
  },
  "field-default": {
    component: FieldDefault,
    file: "field/default.tsx",
  },
  "field-fieldset": {
    component: FieldFieldset,
    file: "field/fieldset.tsx",
  },
  "field-grid": {
    component: FieldGrid,
    file: "field/grid.tsx",
  },
  "field-horizontal": {
    component: FieldHorizontal,
    file: "field/horizontal.tsx",
  },
  "field-multiple-errors": {
    component: FieldMultipleErrors,
    file: "field/multiple-errors.tsx",
  },
  "field-payment-method": {
    component: FieldPaymentMethod,
    file: "field/payment-method.tsx",
  },
  "field-required": {
    component: FieldRequired,
    file: "field/required.tsx",
  },
  "field-settings-form": {
    component: FieldSettingsForm,
    file: "field/settings-form.tsx",
  },
  "field-textarea-example": {
    component: FieldTextareaExample,
    file: "field/textarea-example.tsx",
  },
  "field-validation-error": {
    component: FieldValidationError,
    file: "field/validation-error.tsx",
  },
  "field-with-checkbox": {
    component: FieldWithCheckbox,
    file: "field/with-checkbox.tsx",
  },
  "field-with-switch": {
    component: FieldWithSwitch,
    file: "field/with-switch.tsx",
  },

  // form
  "form-default": {
    component: FormDefault,
    file: "form/default.tsx",
  },
  "form-with-validation": {
    component: FormWithValidation,
    file: "form/with-validation.tsx",
  },

  // input
  "input-default": {
    component: InputDefault,
    file: "input/default.tsx",
  },
  "input-disabled": {
    component: InputDisabled,
    file: "input/disabled.tsx",
  },
  "input-file": {
    component: InputFile,
    file: "input/file.tsx",
  },
  "input-form-example": {
    component: InputFormExample,
    file: "input/form-example.tsx",
  },
  "input-sizes": {
    component: InputSizes,
    file: "input/sizes.tsx",
  },
  "input-types": {
    component: InputTypes,
    file: "input/types.tsx",
  },
  "input-with-button": {
    component: InputWithButton,
    file: "input/with-button.tsx",
  },
  "input-with-error": {
    component: InputWithError,
    file: "input/with-error.tsx",
  },
  "input-with-field": {
    component: InputWithField,
    file: "input/with-field.tsx",
  },
  "input-with-helper-text": {
    component: InputWithHelperText,
    file: "input/with-helper-text.tsx",
  },
  "input-with-icon": {
    component: InputWithIcon,
    file: "input/with-icon.tsx",
  },
  "input-with-label": {
    component: InputWithLabel,
    file: "input/with-label.tsx",
  },
  "input-with-password-toggle": {
    component: InputWithPasswordToggle,
    file: "input/with-password-toggle.tsx",
  },
  "input-with-prefix": {
    component: InputWithPrefix,
    file: "input/with-prefix.tsx",
  },

  // input-group
  "input-group-clear-button": {
    component: InputGroupClearButton,
    file: "input-group/clear-button.tsx",
  },
  "input-group-copy-to-clipboard": {
    component: InputGroupCopyToClipboard,
    file: "input-group/copy-to-clipboard.tsx",
  },
  "input-group-currency": {
    component: InputGroupCurrency,
    file: "input-group/currency.tsx",
  },
  "input-group-default": {
    component: InputGroupDefault,
    file: "input-group/default.tsx",
  },
  "input-group-email-input": {
    component: InputGroupEmailInput,
    file: "input-group/email-input.tsx",
  },
  "input-group-loading-spinner": {
    component: InputGroupLoadingSpinner,
    file: "input-group/loading-spinner.tsx",
  },
  "input-group-password-toggle": {
    component: InputGroupPasswordToggle,
    file: "input-group/password-toggle.tsx",
  },
  "input-group-phone-input": {
    component: InputGroupPhoneInput,
    file: "input-group/phone-input.tsx",
  },
  "input-group-prompt-form": {
    component: InputGroupPromptForm,
    file: "input-group/prompt-form.tsx",
  },
  "input-group-search": {
    component: InputGroupSearch,
    file: "input-group/search.tsx",
  },
  "input-group-text-prefix": {
    component: InputGroupTextPrefix,
    file: "input-group/text-prefix.tsx",
  },
  "input-group-text-suffix": {
    component: InputGroupTextSuffix,
    file: "input-group/text-suffix.tsx",
  },
  "input-group-with-button": {
    component: InputGroupWithButton,
    file: "input-group/with-button.tsx",
  },
  "input-group-with-textarea": {
    component: InputGroupWithTextarea,
    file: "input-group/with-textarea.tsx",
  },

  // input-otp
  "input-otp-alphanumeric": {
    component: InputOtpAlphanumeric,
    file: "input-otp/alphanumeric.tsx",
  },
  "input-otp-default": {
    component: InputOtpDefault,
    file: "input-otp/default.tsx",
  },
  "input-otp-disabled": {
    component: InputOtpDisabled,
    file: "input-otp/disabled.tsx",
  },
  "input-otp-form": {
    component: InputOtpForm,
    file: "input-otp/form.tsx",
  },
  "input-otp-four-digits": {
    component: InputOtpFourDigits,
    file: "input-otp/four-digits.tsx",
  },
  "input-otp-loading": {
    component: InputOtpLoading,
    file: "input-otp/loading.tsx",
  },
  "input-otp-with-separator": {
    component: InputOtpWithSeparator,
    file: "input-otp/with-separator.tsx",
  },

  // item
  "item-activity-feed": {
    component: ItemActivityFeed,
    file: "item/activity-feed.tsx",
  },
  "item-default": {
    component: ItemDefault,
    file: "item/default.tsx",
  },
  "item-group": {
    component: ItemGroup,
    file: "item/group.tsx",
  },
  "item-link": {
    component: ItemLink,
    file: "item/link.tsx",
  },
  "item-notification-list": {
    component: ItemNotificationList,
    file: "item/notification-list.tsx",
  },
  "item-settings-list": {
    component: ItemSettingsList,
    file: "item/settings-list.tsx",
  },
  "item-sizes": {
    component: ItemSizes,
    file: "item/sizes.tsx",
  },
  "item-with-actions": {
    component: ItemWithActions,
    file: "item/with-actions.tsx",
  },
  "item-with-avatar": {
    component: ItemWithAvatar,
    file: "item/with-avatar.tsx",
  },
  "item-with-description": {
    component: ItemWithDescription,
    file: "item/with-description.tsx",
  },
  "item-with-footer": {
    component: ItemWithFooter,
    file: "item/with-footer.tsx",
  },
  "item-with-icon": {
    component: ItemWithIcon,
    file: "item/with-icon.tsx",
  },
  "item-with-image": {
    component: ItemWithImage,
    file: "item/with-image.tsx",
  },
  "item-with-separator": {
    component: ItemWithSeparator,
    file: "item/with-separator.tsx",
  },

  // kbd
  "kbd-common-shortcuts": {
    component: KbdCommonShortcuts,
    file: "kbd/common-shortcuts.tsx",
  },
  "kbd-default": {
    component: KbdDefault,
    file: "kbd/default.tsx",
  },
  "kbd-function-keys": {
    component: KbdFunctionKeys,
    file: "kbd/function-keys.tsx",
  },
  "kbd-group": {
    component: KbdGroup,
    file: "kbd/group.tsx",
  },
  "kbd-modifier-keys": {
    component: KbdModifierKeys,
    file: "kbd/modifier-keys.tsx",
  },
  "kbd-special-keys": {
    component: KbdSpecialKeys,
    file: "kbd/special-keys.tsx",
  },

  // label
  "label-default": {
    component: LabelDefault,
    file: "label/default.tsx",
  },
  "label-required": {
    component: LabelRequired,
    file: "label/required.tsx",
  },
  "label-with-description": {
    component: LabelWithDescription,
    file: "label/with-description.tsx",
  },

  // modal
  "modal-confirmation": {
    component: ModalConfirmation,
    file: "modal/confirmation.tsx",
  },
  "modal-controlled": {
    component: ModalControlled,
    file: "modal/controlled.tsx",
  },
  "modal-default": {
    component: ModalDefault,
    file: "modal/default.tsx",
  },
  "modal-long-content": {
    component: ModalLongContent,
    file: "modal/long-content.tsx",
  },
  "modal-multi-step": {
    component: ModalMultiStep,
    file: "modal/multi-step.tsx",
  },
  "modal-nested": {
    component: ModalNested,
    file: "modal/nested.tsx",
  },
  "modal-scrollable": {
    component: ModalScrollable,
    file: "modal/scrollable.tsx",
  },
  "modal-sign-up-form": {
    component: ModalSignUpForm,
    file: "modal/sign-up-form.tsx",
  },
  "modal-sizes": {
    component: ModalSizes,
    file: "modal/sizes.tsx",
  },
  "modal-sticky-footer": {
    component: ModalStickyFooter,
    file: "modal/sticky-footer.tsx",
  },

  // native-select
  "native-select-default": {
    component: NativeSelectDefault,
    file: "native-select/default.tsx",
  },
  "native-select-disabled": {
    component: NativeSelectDisabled,
    file: "native-select/disabled.tsx",
  },
  "native-select-form-example": {
    component: NativeSelectFormExample,
    file: "native-select/form-example.tsx",
  },
  "native-select-groups": {
    component: NativeSelectGroups,
    file: "native-select/groups.tsx",
  },
  "native-select-invalid": {
    component: NativeSelectInvalid,
    file: "native-select/invalid.tsx",
  },
  "native-select-sizes": {
    component: NativeSelectSizes,
    file: "native-select/sizes.tsx",
  },

  // pagination
  "pagination-data-table": {
    component: PaginationDataTable,
    file: "pagination/data-table.tsx",
  },
  "pagination-default": {
    component: PaginationDefault,
    file: "pagination/default.tsx",
  },
  "pagination-simple": {
    component: PaginationSimple,
    file: "pagination/simple.tsx",
  },

  // popover
  "popover-alignments": {
    component: PopoverAlignments,
    file: "popover/alignments.tsx",
  },
  "popover-default": {
    component: PopoverDefault,
    file: "popover/default.tsx",
  },
  "popover-open-on-hover": {
    component: PopoverOpenOnHover,
    file: "popover/open-on-hover.tsx",
  },
  "popover-with-arrow": {
    component: PopoverWithArrow,
    file: "popover/with-arrow.tsx",
  },
  "popover-with-form": {
    component: PopoverWithForm,
    file: "popover/with-form.tsx",
  },

  // progress
  "progress-animated": {
    component: ProgressAnimated,
    file: "progress/animated.tsx",
  },
  "progress-colors": {
    component: ProgressColors,
    file: "progress/colors.tsx",
  },
  "progress-complete": {
    component: ProgressComplete,
    file: "progress/complete.tsx",
  },
  "progress-controlled": {
    component: ProgressControlled,
    file: "progress/controlled.tsx",
  },
  "progress-default": {
    component: ProgressDefault,
    file: "progress/default.tsx",
  },
  "progress-indeterminate": {
    component: ProgressIndeterminate,
    file: "progress/indeterminate.tsx",
  },
  "progress-with-label": {
    component: ProgressWithLabel,
    file: "progress/with-label.tsx",
  },

  // radio-group
  "radio-group-choice-card": {
    component: RadioGroupChoiceCard,
    file: "radio-group/choice-card.tsx",
  },
  "radio-group-default": {
    component: RadioGroupDefault,
    file: "radio-group/default.tsx",
  },
  "radio-group-disabled": {
    component: RadioGroupDisabled,
    file: "radio-group/disabled.tsx",
  },
  "radio-group-fieldset": {
    component: RadioGroupFieldset,
    file: "radio-group/fieldset.tsx",
  },
  "radio-group-horizontal": {
    component: RadioGroupHorizontal,
    file: "radio-group/horizontal.tsx",
  },
  "radio-group-with-description": {
    component: RadioGroupWithDescription,
    file: "radio-group/with-description.tsx",
  },

  // resizable
  "resizable-collapsible": {
    component: ResizableCollapsible,
    file: "resizable/collapsible.tsx",
  },
  "resizable-complex-layout": {
    component: ResizableComplexLayout,
    file: "resizable/complex-layout.tsx",
  },
  "resizable-default": {
    component: ResizableDefault,
    file: "resizable/default.tsx",
  },
  "resizable-nested": {
    component: ResizableNested,
    file: "resizable/nested.tsx",
  },
  "resizable-vertical": {
    component: ResizableVertical,
    file: "resizable/vertical.tsx",
  },
  "resizable-with-handle": {
    component: ResizableWithHandle,
    file: "resizable/with-handle.tsx",
  },

  // select
  "select-controlled": {
    component: SelectControlled,
    file: "select/controlled.tsx",
  },
  "select-default": {
    component: SelectDefault,
    file: "select/default.tsx",
  },
  "select-disabled": {
    component: SelectDisabled,
    file: "select/disabled.tsx",
  },
  "select-form-example": {
    component: SelectFormExample,
    file: "select/form-example.tsx",
  },
  "select-groups": {
    component: SelectGroups,
    file: "select/groups.tsx",
  },
  "select-multiple": {
    component: SelectMultiple,
    file: "select/multiple.tsx",
  },
  "select-scrollable": {
    component: SelectScrollable,
    file: "select/scrollable.tsx",
  },
  "select-sizes": {
    component: SelectSizes,
    file: "select/sizes.tsx",
  },
  "select-with-icons": {
    component: SelectWithIcons,
    file: "select/with-icons.tsx",
  },

  // separator
  "separator-default": {
    component: SeparatorDefault,
    file: "separator/default.tsx",
  },
  "separator-vertical": {
    component: SeparatorVertical,
    file: "separator/vertical.tsx",
  },
  "separator-with-content": {
    component: SeparatorWithContent,
    file: "separator/with-content.tsx",
  },

  // skeleton
  "skeleton-card": {
    component: SkeletonCard,
    file: "skeleton/card.tsx",
  },
  "skeleton-default": {
    component: SkeletonDefault,
    file: "skeleton/default.tsx",
  },
  "skeleton-form": {
    component: SkeletonForm,
    file: "skeleton/form.tsx",
  },
  "skeleton-no-animation": {
    component: SkeletonNoAnimation,
    file: "skeleton/no-animation.tsx",
  },
  "skeleton-shimmer": {
    component: SkeletonShimmer,
    file: "skeleton/shimmer.tsx",
  },
  "skeleton-table": {
    component: SkeletonTable,
    file: "skeleton/table.tsx",
  },
  "skeleton-text": {
    component: SkeletonText,
    file: "skeleton/text.tsx",
  },

  // slider
  "slider-controlled": {
    component: SliderControlled,
    file: "slider/controlled.tsx",
  },
  "slider-custom-step": {
    component: SliderCustomStep,
    file: "slider/custom-step.tsx",
  },
  "slider-default": {
    component: SliderDefault,
    file: "slider/default.tsx",
  },
  "slider-disabled": {
    component: SliderDisabled,
    file: "slider/disabled.tsx",
  },
  "slider-range": {
    component: SliderRange,
    file: "slider/range.tsx",
  },
  "slider-with-label": {
    component: SliderWithLabel,
    file: "slider/with-label.tsx",
  },

  // spinner
  "spinner-default": {
    component: SpinnerDefault,
    file: "spinner/default.tsx",
  },
  "spinner-sizes": {
    component: SpinnerSizes,
    file: "spinner/sizes.tsx",
  },
  "spinner-with-badge": {
    component: SpinnerWithBadge,
    file: "spinner/with-badge.tsx",
  },
  "spinner-with-button": {
    component: SpinnerWithButton,
    file: "spinner/with-button.tsx",
  },
  "spinner-with-empty": {
    component: SpinnerWithEmpty,
    file: "spinner/with-empty.tsx",
  },

  // stepper
  "stepper-controlled": {
    component: StepperControlled,
    file: "stepper/controlled.tsx",
  },
  "stepper-default": {
    component: StepperDefault,
    file: "stepper/default.tsx",
  },
  "stepper-with-indicator": {
    component: StepperWithIndicator,
    file: "stepper/with-indicator.tsx",
  },

  // switch
  "switch-choice-card": {
    component: SwitchChoiceCard,
    file: "switch/choice-card.tsx",
  },
  "switch-default": {
    component: SwitchDefault,
    file: "switch/default.tsx",
  },
  "switch-disabled": {
    component: SwitchDisabled,
    file: "switch/disabled.tsx",
  },
  "switch-sizes": {
    component: SwitchSizes,
    file: "switch/sizes.tsx",
  },
  "switch-with-description": {
    component: SwitchWithDescription,
    file: "switch/with-description.tsx",
  },

  // table
  "table-actions": {
    component: TableActions,
    file: "table/actions.tsx",
  },
  "table-card": {
    component: TableCard,
    file: "table/card.tsx",
  },
  "table-compact": {
    component: TableCompact,
    file: "table/compact.tsx",
  },
  "table-default": {
    component: TableDefault,
    file: "table/default.tsx",
  },
  "table-empty-state": {
    component: TableEmptyState,
    file: "table/empty-state.tsx",
  },
  "table-footer": {
    component: TableFooter,
    file: "table/footer.tsx",
  },
  "table-hoverable": {
    component: TableHoverable,
    file: "table/hoverable.tsx",
  },
  "table-selected-rows": {
    component: TableSelectedRows,
    file: "table/selected-rows.tsx",
  },
  "table-striped": {
    component: TableStriped,
    file: "table/striped.tsx",
  },
  "table-with-badges": {
    component: TableWithBadges,
    file: "table/with-badges.tsx",
  },
  "table-with-pagination": {
    component: TableWithPagination,
    file: "table/with-pagination.tsx",
  },

  // tabs
  "tabs-animated-indicator": {
    component: TabsAnimatedIndicator,
    file: "tabs/animated-indicator.tsx",
  },
  "tabs-default": {
    component: TabsDefault,
    file: "tabs/default.tsx",
  },
  "tabs-disabled": {
    component: TabsDisabled,
    file: "tabs/disabled.tsx",
  },
  "tabs-line": {
    component: TabsLine,
    file: "tabs/line.tsx",
  },
  "tabs-line-vertical": {
    component: TabsLineVertical,
    file: "tabs/line-vertical.tsx",
  },
  "tabs-pill": {
    component: TabsPill,
    file: "tabs/pill.tsx",
  },
  "tabs-scrollable": {
    component: TabsScrollable,
    file: "tabs/scrollable.tsx",
  },
  "tabs-vertical": {
    component: TabsVertical,
    file: "tabs/vertical.tsx",
  },
  "tabs-with-icons": {
    component: TabsWithIcons,
    file: "tabs/with-icons.tsx",
  },

  // tag
  "tag-default": {
    component: TagDefault,
    file: "tag/default.tsx",
  },
  "tag-disabled": {
    component: TagDisabled,
    file: "tag/disabled.tsx",
  },
  "tag-states": {
    component: TagStates,
    file: "tag/states.tsx",
  },
  "tag-with-icon": {
    component: TagWithIcon,
    file: "tag/with-icon.tsx",
  },
  "tag-with-remove": {
    component: TagWithRemove,
    file: "tag/with-remove.tsx",
  },

  // tag-group
  "tag-group-controlled": {
    component: TagGroupControlled,
    file: "tag-group/controlled.tsx",
  },
  "tag-group-default": {
    component: TagGroupDefault,
    file: "tag-group/default.tsx",
  },
  "tag-group-disabled": {
    component: TagGroupDisabled,
    file: "tag-group/disabled.tsx",
  },
  "tag-group-removable": {
    component: TagGroupRemovable,
    file: "tag-group/removable.tsx",
  },
  "tag-group-single-selection": {
    component: TagGroupSingleSelection,
    file: "tag-group/single-selection.tsx",
  },
  "tag-group-with-avatars": {
    component: TagGroupWithAvatars,
    file: "tag-group/with-avatars.tsx",
  },
  "tag-group-with-icons": {
    component: TagGroupWithIcons,
    file: "tag-group/with-icons.tsx",
  },

  // textarea
  "textarea-character-count": {
    component: TextareaCharacterCount,
    file: "textarea/character-count.tsx",
  },
  "textarea-default": {
    component: TextareaDefault,
    file: "textarea/default.tsx",
  },
  "textarea-disabled": {
    component: TextareaDisabled,
    file: "textarea/disabled.tsx",
  },
  "textarea-with-error": {
    component: TextareaWithError,
    file: "textarea/with-error.tsx",
  },
  "textarea-with-field": {
    component: TextareaWithField,
    file: "textarea/with-field.tsx",
  },

  // toast
  "toast-custom": {
    component: ToastCustom,
    file: "toast/custom.tsx",
  },
  "toast-default": {
    component: ToastDefault,
    file: "toast/default.tsx",
  },
  "toast-duration": {
    component: ToastDuration,
    file: "toast/duration.tsx",
  },
  "toast-position": {
    component: ToastPosition,
    file: "toast/position.tsx",
  },
  "toast-promise": {
    component: ToastPromise,
    file: "toast/promise.tsx",
  },
  "toast-types": {
    component: ToastTypes,
    file: "toast/types.tsx",
  },
  "toast-with-action": {
    component: ToastWithAction,
    file: "toast/with-action.tsx",
  },
  "toast-with-description": {
    component: ToastWithDescription,
    file: "toast/with-description.tsx",
  },

  // toggle
  "toggle-default": {
    component: ToggleDefault,
    file: "toggle/default.tsx",
  },
  "toggle-disabled": {
    component: ToggleDisabled,
    file: "toggle/disabled.tsx",
  },
  "toggle-outline": {
    component: ToggleOutline,
    file: "toggle/outline.tsx",
  },
  "toggle-pressed": {
    component: TogglePressed,
    file: "toggle/pressed.tsx",
  },
  "toggle-sizes": {
    component: ToggleSizes,
    file: "toggle/sizes.tsx",
  },
  "toggle-with-text": {
    component: ToggleWithText,
    file: "toggle/with-text.tsx",
  },

  // toggle-group
  "toggle-group-custom": {
    component: ToggleGroupCustom,
    file: "toggle-group/custom.tsx",
  },
  "toggle-group-default": {
    component: ToggleGroupDefault,
    file: "toggle-group/default.tsx",
  },
  "toggle-group-disabled": {
    component: ToggleGroupDisabled,
    file: "toggle-group/disabled.tsx",
  },
  "toggle-group-outline": {
    component: ToggleGroupOutline,
    file: "toggle-group/outline.tsx",
  },
  "toggle-group-single": {
    component: ToggleGroupSingle,
    file: "toggle-group/single.tsx",
  },
  "toggle-group-sizes": {
    component: ToggleGroupSizes,
    file: "toggle-group/sizes.tsx",
  },
  "toggle-group-spacing": {
    component: ToggleGroupSpacing,
    file: "toggle-group/spacing.tsx",
  },
  "toggle-group-text-labels": {
    component: ToggleGroupTextLabels,
    file: "toggle-group/text-labels.tsx",
  },
  "toggle-group-vertical": {
    component: ToggleGroupVertical,
    file: "toggle-group/vertical.tsx",
  },

  // tooltip
  "tooltip-default": {
    component: TooltipDefault,
    file: "tooltip/default.tsx",
  },
  "tooltip-disabled-button": {
    component: TooltipDisabledButton,
    file: "tooltip/disabled-button.tsx",
  },
  "tooltip-group-delay": {
    component: TooltipGroupDelay,
    file: "tooltip/group-delay.tsx",
  },
  "tooltip-sides": {
    component: TooltipSides,
    file: "tooltip/sides.tsx",
  },
  "tooltip-with-kbd": {
    component: TooltipWithKbd,
    file: "tooltip/with-kbd.tsx",
  },

  // typography
  "typography-blockquote": {
    component: TypographyBlockquote,
    file: "typography/blockquote.tsx",
  },
  "typography-default": {
    component: TypographyDefault,
    file: "typography/default.tsx",
  },
  "typography-h1": {
    component: TypographyH1,
    file: "typography/h1.tsx",
  },
  "typography-h2": {
    component: TypographyH2,
    file: "typography/h2.tsx",
  },
  "typography-h3": {
    component: TypographyH3,
    file: "typography/h3.tsx",
  },
  "typography-h4": {
    component: TypographyH4,
    file: "typography/h4.tsx",
  },
  "typography-inline-code": {
    component: TypographyInlineCode,
    file: "typography/inline-code.tsx",
  },
  "typography-large": {
    component: TypographyLarge,
    file: "typography/large.tsx",
  },
  "typography-lead": {
    component: TypographyLead,
    file: "typography/lead.tsx",
  },
  "typography-list": {
    component: TypographyList,
    file: "typography/list.tsx",
  },
  "typography-muted": {
    component: TypographyMuted,
    file: "typography/muted.tsx",
  },
  "typography-paragraph": {
    component: TypographyParagraph,
    file: "typography/paragraph.tsx",
  },
  "typography-small": {
    component: TypographySmall,
    file: "typography/small.tsx",
  },

  // blocks
  "block-login-01": {
    component: Login01,
    file: "blocks/login-01.tsx",
  },
  "block-login-02": {
    component: Login02,
    file: "blocks/login-02.tsx",
  },
  "block-login-03": {
    component: Login03,
    file: "blocks/login-03.tsx",
  },
  "block-login-04": {
    component: Login04,
    file: "blocks/login-04.tsx",
  },
  "block-profile-dropdown-01": {
    component: ProfileDropdown01,
    file: "blocks/profile-dropdown-01.tsx",
  },
};

export function getDemo(name: string): DemoItem | undefined {
  return demos[name];
}
