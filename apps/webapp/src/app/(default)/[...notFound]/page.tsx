import { notFound } from 'next/navigation.js';

// Unknown URLs render the not-found page of this route group, so it gets the
// tenant layout (navigation, header, user menu) instead of Next's default 404.
export default function CatchAllNotFound() {
  notFound();
}
