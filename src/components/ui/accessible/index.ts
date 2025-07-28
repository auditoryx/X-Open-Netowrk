/**
 * Accessible UI Components Index
 * 
 * Central exports for all accessible UI components
 */

// Core accessible components
export { AccessibleButton, PrimaryButton, SecondaryButton, DestructiveButton, IconButton } from './AccessibleButton';
export { 
  AccessibleLabel,
  AccessibleInput,
  AccessibleTextarea, 
  AccessibleSelect,
  AccessibleCheckbox,
  AccessibleRadioGroup
} from './AccessibleForm';
export { 
  FocusManager,
  ModalFocusManager,
  DropdownFocusManager,
  SkipLinks,
  FocusIndicator,
  RovingTabIndex
} from './FocusManager';

// Re-export types for consumers
export type { AccessibleButtonProps } from './AccessibleButton';
export type { 
  AccessibleLabelProps,
  AccessibleInputProps,
  AccessibleTextareaProps,
  AccessibleSelectProps,
  AccessibleCheckboxProps,
  AccessibleRadioGroupProps,
  RadioOption
} from './AccessibleForm';
export type { 
  FocusManagerProps,
  ModalFocusManagerProps,
  DropdownFocusManagerProps,
  SkipLinksProps,
  FocusIndicatorProps,
  RovingTabIndexProps
} from './FocusManager';