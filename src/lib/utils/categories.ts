export interface CategoryFilterOption {
  id: string;
  name: string;
  slug: string;
}

/** API category tree node (GET /categories). */
export interface CategoryTreeNode {
  id: string;
  name: string;
  slug?: string;
  children?: CategoryTreeNode[];
}

/**
 * Flatten nested categories for filter dropdowns. Each option's `slug` is sent as
 * `?category=<slug>` to GET /products.
 */
export function flattenCategoryFilterOptions(
  nodes: CategoryTreeNode[] | undefined,
  ancestorLabel = ""
): CategoryFilterOption[] {
  if (!nodes?.length) return [];
  return nodes.flatMap((node) => {
    const label = ancestorLabel ? `${ancestorLabel} › ${node.name}` : node.name;
    const slug = (node.slug ?? "").trim();
    const self: CategoryFilterOption | null = slug
      ? { id: node.id, name: label, slug }
      : null;
    const children = flattenCategoryFilterOptions(node.children, label);
    return self ? [self, ...children] : children;
  });
}
