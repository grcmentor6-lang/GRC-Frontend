/**
 * Verb chip. The verb-action label (e.g. "PR Present") is no longer shown in the UI,
 * so this renders nothing. The underlying verb metadata/logic is untouched.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- the prop is kept so callers need not change; the chip renders nothing
export function DVerb(_props: { verbId: string }) {
  return null;
}
