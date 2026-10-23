/**
 * Demos that must render on the client, not in the prerendered shell.
 *
 * `Calendar` (react-day-picker) reads the current date during render to mark
 * "today". Under Cache Components, Next fails the build when a Client
 * Component read `new Date()` while being server-rendered into a static
 * shell, because the SSR value could never match the browser's. Rendering
 * these demos behind a Suspense boundary keeps the shell static and lets the
 * calendar show the real today once hydrated.
 *
 * Checked against the demo sources by tests/client-only-demos.test.ts.
 */
export function isClientOnlyDemo(name: string): boolean {
  return name.startsWith("calendar-") || name.startsWith("date-input-");
}
