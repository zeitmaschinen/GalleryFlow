// Utility to filter out props that are not supported by MUI components (e.g., autoFocus, tabIndex)
// Extend this list as you encounter more unsupported props
const UNSUPPORTED_MUI_PROPS = [
  'autoFocus',
  'tabIndex',
];

export function filterMuiUnsupportedProps<T extends object = Record<string, unknown>>(
  props: T
): Partial<T> {
  const filtered = { ...props };
  for (const prop of UNSUPPORTED_MUI_PROPS) {
    if (prop in filtered) {
      delete filtered[prop as keyof T];
    }
  }
  return filtered;
}
