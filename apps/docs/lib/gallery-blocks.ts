interface Item {
  name: string;
  type: string;
}

/**
 * The registry items the /blocks gallery shows a card for: every block with
 * its own docs page. A package-flavour item (`npm/users-01`) is the same
 * block for apps on the `@keystoneui/react` package, documented on its
 * vendored twin's page, so it gets no card of its own.
 */
export function galleryBlocks<T extends Item>(items: readonly T[]): T[] {
  return items.filter(
    (item) => item.type === "registry:block" && !item.name.startsWith("npm/")
  );
}
