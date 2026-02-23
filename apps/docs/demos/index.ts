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
import AlertDialogWithMedia from "./alert-dialog/with-media";

// aspect-ratio
import AspectRatioDefault from "./aspect-ratio/default";
import AspectRatioSquare from "./aspect-ratio/square";

// avatar
import AvatarDefault from "./avatar/default";
import AvatarFallback from "./avatar/fallback";
import AvatarGroup from "./avatar/group";
import AvatarSizes from "./avatar/sizes";
import AvatarWithBadge from "./avatar/with-badge";

// badge
import BadgeAsLink from "./badge/as-link";
import BadgeDefault from "./badge/default";
import BadgeSizes from "./badge/sizes";
import BadgeVariants from "./badge/variants";
import BadgeWithIcon from "./badge/with-icon";

// breadcrumb
import BreadcrumbCollapsed from "./breadcrumb/collapsed";
import BreadcrumbCustomSeparator from "./breadcrumb/custom-separator";
import BreadcrumbDefault from "./breadcrumb/default";
import BreadcrumbWithDropdown from "./breadcrumb/with-dropdown";

// button
import ButtonAsLink from "./button/as-link";
import ButtonDefault from "./button/default";
import ButtonDisabled from "./button/disabled";
import ButtonFullWidth from "./button/full-width";
import ButtonIconButtons from "./button/icon-buttons";
import ButtonLink from "./button/link";
import ButtonLoading from "./button/loading";
import ButtonRounded from "./button/rounded";
import ButtonSizes from "./button/sizes";
import ButtonVariants from "./button/variants";
import ButtonWithIcons from "./button/with-icons";

// button-group
import ButtonGroupDefault from "./button-group/default";
import ButtonGroupEmailToolbar from "./button-group/email-toolbar";
import ButtonGroupSizes from "./button-group/sizes";
import ButtonGroupSplitButton from "./button-group/split-button";
import ButtonGroupToolbar from "./button-group/toolbar";
import ButtonGroupVertical from "./button-group/vertical";
import ButtonGroupWithDropdownMenu from "./button-group/with-dropdown-menu";
import ButtonGroupWithInput from "./button-group/with-input";
import ButtonGroupWithSelect from "./button-group/with-select";

// calendar
import CalendarBookedDates from "./calendar/booked-dates";
import CalendarDefault from "./calendar/default";
import CalendarMonthYear from "./calendar/month-year";
import CalendarPresets from "./calendar/presets";
import CalendarRange from "./calendar/range";

// card
import CardDefault from "./card/default";
import CardLoginForm from "./card/login-form";
import CardSocialCard from "./card/social-card";
import CardWithAction from "./card/with-action";
import CardWithImage from "./card/with-image";

// carousel
import CarouselAutoplay from "./carousel/autoplay";
import CarouselCards from "./carousel/cards";
import CarouselDefault from "./carousel/default";
import CarouselMultipleSlides from "./carousel/multiple-slides";
import CarouselVertical from "./carousel/vertical";
import CarouselWithDots from "./carousel/with-dots";

// checkbox
import CheckboxDefault from "./checkbox/default";
import CheckboxDisabled from "./checkbox/disabled";
import CheckboxGroup from "./checkbox/group";
import CheckboxPillGroup from "./checkbox/pill-group";
import CheckboxWithDescription from "./checkbox/with-description";

// circular-progress
import CircularProgressAnimated from "./circular-progress/animated";
import CircularProgressDefault from "./circular-progress/default";
import CircularProgressIndeterminate from "./circular-progress/indeterminate";
import CircularProgressSizes from "./circular-progress/sizes";
import CircularProgressWithLabel from "./circular-progress/with-label";

// collapsible
import CollapsibleDefault from "./collapsible/default";
import CollapsibleFileTree from "./collapsible/file-tree";
import CollapsibleSettings from "./collapsible/settings";

// combobox
import ComboboxCustomItems from "./combobox/custom-items";
import ComboboxDefault from "./combobox/default";
import ComboboxDisabled from "./combobox/disabled";
import ComboboxGroups from "./combobox/groups";
import ComboboxMultiple from "./combobox/multiple";
import ComboboxPopup from "./combobox/popup";
import ComboboxWithClear from "./combobox/with-clear";

// command
import CommandDefault from "./command/default";
import CommandGroups from "./command/groups";
import CommandScrollable from "./command/scrollable";
import CommandWithShortcuts from "./command/with-shortcuts";

// date-input
import DateInputDateOfBirth from "./date-input/date-of-birth";
import DateInputDefault from "./date-input/default";
import DateInputPresets from "./date-input/presets";
import DateInputRange from "./date-input/range";
import DateInputWithInput from "./date-input/with-input";

// description-list
import DescriptionListCardVariant from "./description-list/card-variant";
import DescriptionListCompact from "./description-list/compact";
import DescriptionListDefault from "./description-list/default";
import DescriptionListInCard from "./description-list/in-card";

// drawer
import DrawerDefault from "./drawer/default";
import DrawerFilter from "./drawer/filter";
import DrawerNested from "./drawer/nested";
import DrawerResponsive from "./drawer/responsive";
import DrawerScrollable from "./drawer/scrollable";
import DrawerSides from "./drawer/sides";

// dropdown-menu
import DropdownMenuCheckboxes from "./dropdown-menu/checkboxes";
import DropdownMenuDefault from "./dropdown-menu/default";
import DropdownMenuRadioGroup from "./dropdown-menu/radio-group";
import DropdownMenuShortcuts from "./dropdown-menu/shortcuts";
import DropdownMenuSubmenu from "./dropdown-menu/submenu";
import DropdownMenuWithIcons from "./dropdown-menu/with-icons";

// empty
import EmptyBackground from "./empty/background";
import EmptyDefault from "./empty/default";
import EmptyOutline from "./empty/outline";
import EmptyWithAvatar from "./empty/with-avatar";
import EmptyWithSpinner from "./empty/with-spinner";
import FieldCheckoutForm from "./field/checkout-form";
// field
import FieldDefault from "./field/default";
import FieldFieldset from "./field/fieldset";
import FieldGrid from "./field/grid";
import FieldHorizontal from "./field/horizontal";
import FieldSettingsForm from "./field/settings-form";
import FieldValidationError from "./field/validation-error";
import FieldWithSwitch from "./field/with-switch";

// form
import FormDefault from "./form/default";

// input
import InputDefault from "./input/default";
import InputDisabled from "./input/disabled";
import InputFile from "./input/file";
import InputFormExample from "./input/form-example";
import InputWithError from "./input/with-error";
import InputWithField from "./input/with-field";

// input-group
import InputGroupCurrency from "./input-group/currency";
import InputGroupDefault from "./input-group/default";
import InputGroupPasswordToggle from "./input-group/password-toggle";
import InputGroupPromptForm from "./input-group/prompt-form";
import InputGroupSearch from "./input-group/search";
import InputGroupTextPrefix from "./input-group/text-prefix";
import InputGroupWithButton from "./input-group/with-button";
import InputGroupWithTextarea from "./input-group/with-textarea";

// input-otp
import InputOtpDefault from "./input-otp/default";
import InputOtpDisabled from "./input-otp/disabled";
import InputOtpFourDigits from "./input-otp/four-digits";
import InputOtpWithSeparator from "./input-otp/with-separator";

// item
import ItemDefault from "./item/default";
import ItemGroup from "./item/group";
import ItemLink from "./item/link";
import ItemWithActions from "./item/with-actions";
import ItemWithAvatar from "./item/with-avatar";
import ItemWithDescription from "./item/with-description";

// kbd
import KbdCommonShortcuts from "./kbd/common-shortcuts";
import KbdDefault from "./kbd/default";
import KbdGroup from "./kbd/group";
import KbdModifierKeys from "./kbd/modifier-keys";

// label
import LabelDefault from "./label/default";
import LabelRequired from "./label/required";
import LabelWithDescription from "./label/with-description";

// modal
import ModalControlled from "./modal/controlled";
import ModalDefault from "./modal/default";
import ModalNested from "./modal/nested";
import ModalScrollable from "./modal/scrollable";
import ModalSignUpForm from "./modal/sign-up-form";
import ModalSizes from "./modal/sizes";

// native-select
import NativeSelectDefault from "./native-select/default";
import NativeSelectDisabled from "./native-select/disabled";
import NativeSelectGroups from "./native-select/groups";
import NativeSelectSizes from "./native-select/sizes";

// pagination
import PaginationDataTable from "./pagination/data-table";
import PaginationDefault from "./pagination/default";
import PaginationSimple from "./pagination/simple";

// popover
import PopoverAlignments from "./popover/alignments";
import PopoverDefault from "./popover/default";
import PopoverWithArrow from "./popover/with-arrow";
import PopoverWithForm from "./popover/with-form";

// progress
import ProgressAnimated from "./progress/animated";
import ProgressColors from "./progress/colors";
import ProgressDefault from "./progress/default";
import ProgressIndeterminate from "./progress/indeterminate";
import ProgressWithLabel from "./progress/with-label";

// radio-group
import RadioGroupChoiceCard from "./radio-group/choice-card";
import RadioGroupDefault from "./radio-group/default";
import RadioGroupHorizontal from "./radio-group/horizontal";
import RadioGroupWithDescription from "./radio-group/with-description";

// resizable
import ResizableDefault from "./resizable/default";
import ResizableVertical from "./resizable/vertical";
import ResizableWithHandle from "./resizable/with-handle";

// select
import SelectDefault from "./select/default";
import SelectDisabled from "./select/disabled";
import SelectGroups from "./select/groups";
import SelectMultiple from "./select/multiple";
import SelectScrollable from "./select/scrollable";
import SelectWithIcons from "./select/with-icons";

// separator
import SeparatorDefault from "./separator/default";

// skeleton
import SkeletonCard from "./skeleton/card";
import SkeletonDefault from "./skeleton/default";
import SkeletonForm from "./skeleton/form";
import SkeletonShimmer from "./skeleton/shimmer";

// slider
import SliderDefault from "./slider/default";
import SliderDisabled from "./slider/disabled";
import SliderRange from "./slider/range";
import SliderWithLabel from "./slider/with-label";

// spinner
import SpinnerDefault from "./spinner/default";
import SpinnerSizes from "./spinner/sizes";
import SpinnerWithButton from "./spinner/with-button";

// stepper
import StepperControlled from "./stepper/controlled";
import StepperDefault from "./stepper/default";
import StepperWithIndicator from "./stepper/with-indicator";

// switch
import SwitchDefault from "./switch/default";
import SwitchDisabled from "./switch/disabled";
import SwitchSizes from "./switch/sizes";
import SwitchWithDescription from "./switch/with-description";

// table
import TableActions from "./table/actions";
import TableCard from "./table/card";
import TableCompact from "./table/compact";
import TableDefault from "./table/default";
import TableStriped from "./table/striped";
import TableWithBadges from "./table/with-badges";

// tabs
import TabsDefault from "./tabs/default";
import TabsDisabled from "./tabs/disabled";
import TabsLine from "./tabs/line";
import TabsPill from "./tabs/pill";
import TabsVertical from "./tabs/vertical";
import TabsWithIcons from "./tabs/with-icons";

// tag
import TagDefault from "./tag/default";
import TagDisabled from "./tag/disabled";
import TagWithIcon from "./tag/with-icon";
import TagWithRemove from "./tag/with-remove";

// tag-group
import TagGroupControlled from "./tag-group/controlled";
import TagGroupDefault from "./tag-group/default";
import TagGroupRemovable from "./tag-group/removable";
import TagGroupSingleSelection from "./tag-group/single-selection";
import TagGroupWithIcons from "./tag-group/with-icons";

// textarea
import TextareaCharacterCount from "./textarea/character-count";
import TextareaDefault from "./textarea/default";
import TextareaDisabled from "./textarea/disabled";
import TextareaWithField from "./textarea/with-field";

// toast
import ToastDefault from "./toast/default";
import ToastPosition from "./toast/position";
import ToastPromise from "./toast/promise";
import ToastTypes from "./toast/types";
import ToastWithAction from "./toast/with-action";

// toggle
import ToggleDefault from "./toggle/default";
import ToggleOutline from "./toggle/outline";
import ToggleSizes from "./toggle/sizes";
import ToggleWithText from "./toggle/with-text";

// toggle-group
import ToggleGroupDefault from "./toggle-group/default";
import ToggleGroupOutline from "./toggle-group/outline";
import ToggleGroupSingle from "./toggle-group/single";
import ToggleGroupSizes from "./toggle-group/sizes";

// tooltip
import TooltipDefault from "./tooltip/default";
import TooltipDisabledButton from "./tooltip/disabled-button";
import TooltipSides from "./tooltip/sides";
import TooltipWithKbd from "./tooltip/with-kbd";

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
  "alert-dialog-with-media": {
    component: AlertDialogWithMedia,
    file: "alert-dialog/with-media.tsx",
  },

  // aspect-ratio
  "aspect-ratio-default": {
    component: AspectRatioDefault,
    file: "aspect-ratio/default.tsx",
  },
  "aspect-ratio-square": {
    component: AspectRatioSquare,
    file: "aspect-ratio/square.tsx",
  },

  // avatar
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
  "badge-default": {
    component: BadgeDefault,
    file: "badge/default.tsx",
  },
  "badge-sizes": {
    component: BadgeSizes,
    file: "badge/sizes.tsx",
  },
  "badge-variants": {
    component: BadgeVariants,
    file: "badge/variants.tsx",
  },
  "badge-with-icon": {
    component: BadgeWithIcon,
    file: "badge/with-icon.tsx",
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
  "breadcrumb-with-dropdown": {
    component: BreadcrumbWithDropdown,
    file: "breadcrumb/with-dropdown.tsx",
  },

  // button
  "button-as-link": {
    component: ButtonAsLink,
    file: "button/as-link.tsx",
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
  "button-group-email-toolbar": {
    component: ButtonGroupEmailToolbar,
    file: "button-group/email-toolbar.tsx",
  },
  "button-group-with-dropdown-menu": {
    component: ButtonGroupWithDropdownMenu,
    file: "button-group/with-dropdown-menu.tsx",
  },
  "button-group-with-input": {
    component: ButtonGroupWithInput,
    file: "button-group/with-input.tsx",
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

  // card
  "card-default": {
    component: CardDefault,
    file: "card/default.tsx",
  },
  "card-login-form": {
    component: CardLoginForm,
    file: "card/login-form.tsx",
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
  "carousel-default": {
    component: CarouselDefault,
    file: "carousel/default.tsx",
  },
  "carousel-multiple-slides": {
    component: CarouselMultipleSlides,
    file: "carousel/multiple-slides.tsx",
  },
  "carousel-vertical": {
    component: CarouselVertical,
    file: "carousel/vertical.tsx",
  },
  "carousel-with-dots": {
    component: CarouselWithDots,
    file: "carousel/with-dots.tsx",
  },

  // checkbox
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
  "combobox-with-clear": {
    component: ComboboxWithClear,
    file: "combobox/with-clear.tsx",
  },

  // command
  "command-default": {
    component: CommandDefault,
    file: "command/default.tsx",
  },
  "command-groups": {
    component: CommandGroups,
    file: "command/groups.tsx",
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
  "date-input-date-of-birth": {
    component: DateInputDateOfBirth,
    file: "date-input/date-of-birth.tsx",
  },
  "date-input-default": {
    component: DateInputDefault,
    file: "date-input/default.tsx",
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

  // description-list
  "description-list-card-variant": {
    component: DescriptionListCardVariant,
    file: "description-list/card-variant.tsx",
  },
  "description-list-compact": {
    component: DescriptionListCompact,
    file: "description-list/compact.tsx",
  },
  "description-list-default": {
    component: DescriptionListDefault,
    file: "description-list/default.tsx",
  },
  "description-list-in-card": {
    component: DescriptionListInCard,
    file: "description-list/in-card.tsx",
  },

  // drawer
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

  // dropdown-menu
  "dropdown-menu-checkboxes": {
    component: DropdownMenuCheckboxes,
    file: "dropdown-menu/checkboxes.tsx",
  },
  "dropdown-menu-default": {
    component: DropdownMenuDefault,
    file: "dropdown-menu/default.tsx",
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
  "empty-with-avatar": {
    component: EmptyWithAvatar,
    file: "empty/with-avatar.tsx",
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
  "field-validation-error": {
    component: FieldValidationError,
    file: "field/validation-error.tsx",
  },
  "field-settings-form": {
    component: FieldSettingsForm,
    file: "field/settings-form.tsx",
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
  "input-with-error": {
    component: InputWithError,
    file: "input/with-error.tsx",
  },
  "input-with-field": {
    component: InputWithField,
    file: "input/with-field.tsx",
  },

  // input-group
  "input-group-currency": {
    component: InputGroupCurrency,
    file: "input-group/currency.tsx",
  },
  "input-group-default": {
    component: InputGroupDefault,
    file: "input-group/default.tsx",
  },
  "input-group-password-toggle": {
    component: InputGroupPasswordToggle,
    file: "input-group/password-toggle.tsx",
  },
  "input-group-search": {
    component: InputGroupSearch,
    file: "input-group/search.tsx",
  },
  "input-group-text-prefix": {
    component: InputGroupTextPrefix,
    file: "input-group/text-prefix.tsx",
  },
  "input-group-prompt-form": {
    component: InputGroupPromptForm,
    file: "input-group/prompt-form.tsx",
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
  "input-otp-default": {
    component: InputOtpDefault,
    file: "input-otp/default.tsx",
  },
  "input-otp-disabled": {
    component: InputOtpDisabled,
    file: "input-otp/disabled.tsx",
  },
  "input-otp-four-digits": {
    component: InputOtpFourDigits,
    file: "input-otp/four-digits.tsx",
  },
  "input-otp-with-separator": {
    component: InputOtpWithSeparator,
    file: "input-otp/with-separator.tsx",
  },

  // item
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

  // kbd
  "kbd-common-shortcuts": {
    component: KbdCommonShortcuts,
    file: "kbd/common-shortcuts.tsx",
  },
  "kbd-default": {
    component: KbdDefault,
    file: "kbd/default.tsx",
  },
  "kbd-group": {
    component: KbdGroup,
    file: "kbd/group.tsx",
  },
  "kbd-modifier-keys": {
    component: KbdModifierKeys,
    file: "kbd/modifier-keys.tsx",
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
  "modal-controlled": {
    component: ModalControlled,
    file: "modal/controlled.tsx",
  },
  "modal-default": {
    component: ModalDefault,
    file: "modal/default.tsx",
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

  // native-select
  "native-select-default": {
    component: NativeSelectDefault,
    file: "native-select/default.tsx",
  },
  "native-select-disabled": {
    component: NativeSelectDisabled,
    file: "native-select/disabled.tsx",
  },
  "native-select-groups": {
    component: NativeSelectGroups,
    file: "native-select/groups.tsx",
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
  "radio-group-horizontal": {
    component: RadioGroupHorizontal,
    file: "radio-group/horizontal.tsx",
  },
  "radio-group-with-description": {
    component: RadioGroupWithDescription,
    file: "radio-group/with-description.tsx",
  },

  // resizable
  "resizable-default": {
    component: ResizableDefault,
    file: "resizable/default.tsx",
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
  "select-default": {
    component: SelectDefault,
    file: "select/default.tsx",
  },
  "select-disabled": {
    component: SelectDisabled,
    file: "select/disabled.tsx",
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
  "select-with-icons": {
    component: SelectWithIcons,
    file: "select/with-icons.tsx",
  },

  // separator
  "separator-default": {
    component: SeparatorDefault,
    file: "separator/default.tsx",
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
  "skeleton-shimmer": {
    component: SkeletonShimmer,
    file: "skeleton/shimmer.tsx",
  },

  // slider
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
  "spinner-with-button": {
    component: SpinnerWithButton,
    file: "spinner/with-button.tsx",
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
  "table-striped": {
    component: TableStriped,
    file: "table/striped.tsx",
  },
  "table-with-badges": {
    component: TableWithBadges,
    file: "table/with-badges.tsx",
  },

  // tabs
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
  "tabs-pill": {
    component: TabsPill,
    file: "tabs/pill.tsx",
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
  "tag-group-removable": {
    component: TagGroupRemovable,
    file: "tag-group/removable.tsx",
  },
  "tag-group-single-selection": {
    component: TagGroupSingleSelection,
    file: "tag-group/single-selection.tsx",
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
  "textarea-with-field": {
    component: TextareaWithField,
    file: "textarea/with-field.tsx",
  },

  // toast
  "toast-default": {
    component: ToastDefault,
    file: "toast/default.tsx",
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

  // toggle
  "toggle-default": {
    component: ToggleDefault,
    file: "toggle/default.tsx",
  },
  "toggle-outline": {
    component: ToggleOutline,
    file: "toggle/outline.tsx",
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
  "toggle-group-default": {
    component: ToggleGroupDefault,
    file: "toggle-group/default.tsx",
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

  // tooltip
  "tooltip-default": {
    component: TooltipDefault,
    file: "tooltip/default.tsx",
  },
  "tooltip-disabled-button": {
    component: TooltipDisabledButton,
    file: "tooltip/disabled-button.tsx",
  },
  "tooltip-sides": {
    component: TooltipSides,
    file: "tooltip/sides.tsx",
  },
  "tooltip-with-kbd": {
    component: TooltipWithKbd,
    file: "tooltip/with-kbd.tsx",
  },
};

export function getDemo(name: string): DemoItem | undefined {
  return demos[name];
}
