// Helpers for saved Slate documents that don't need the `slate` package, so
// the read-only renderer can use them without pulling Slate into the bundle.
import type { Descendant } from 'slate';
import type {
  SlatePre050Document,
  SlatePre050Node,
} from './interface/SlatePre050Document';

/** A saved document: current format, or the pre-0.50 format with `document`. */
export const getNormalizedSlateState = (state: any): Descendant[] => {
  if (state?.document) {
    return migrateFromPreSlate050(state.document);
  } else {
    return state;
  }
};

export const migrateFromPreSlate050 = (
  document: SlatePre050Document
): Descendant[] => {
  const convertNode = (oldNode: SlatePre050Node): Descendant =>
    ({
      ...(oldNode.text !== undefined ? { text: oldNode.text } : {}),
      ...(oldNode.type !== undefined ? { type: oldNode.type } : {}),
      ...(oldNode.nodes?.length
        ? { children: oldNode.nodes.map(convertNode) }
        : {}),
      ...oldNode.data,
      ...oldNode.marks?.reduce(
        (acc, mark) => ({
          ...acc,
          [mark.type]: true,
        }),
        {}
      ),
    }) as Descendant;
  return document.nodes.map(convertNode);
};

/** Whether a link points to the current host (open in the same tab). */
export const isSameHostLink = (href: string): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }
  try {
    return new URL(href).host === window.location.host;
  } catch {
    console.warn('Invalid URL:', href);
    return false;
  }
};
