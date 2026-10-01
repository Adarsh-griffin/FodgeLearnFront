/**
 * Minimal className joiner - avoids adding clsx/tailwind-merge as new
 * dependencies for something this small. Doesn't dedupe conflicting
 * Tailwind classes (tailwind-merge's job), but every primitive in
 * components/ui only ever appends caller classNames after its own
 * variant classes, so later-wins cascade order is enough here.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
