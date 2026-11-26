const MAX_DEPTH = 4;

const simplify = (value: unknown, depth: number): unknown => {
  if (value instanceof Error) {
    return { error: value.name, message: value.message };
  }

  if (typeof value === 'function') {
    return undefined;
  }

  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (depth >= MAX_DEPTH) {
    return '…';
  }

  if (Array.isArray(value)) {
    return value.map((item) => simplify(item, depth + 1));
  }

  if ('observer' in value && 'id' in value) {
    return { id: value.id };
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [key, simplify(item, depth + 1)]),
  );
};

export const simplifyPayload = (args: unknown[]): unknown => (
  args.length === 0 ? undefined : simplify(args.length === 1 ? args[0] : args, 0)
);
