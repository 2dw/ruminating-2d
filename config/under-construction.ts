/**
 * Under-construction section registry.
 *
 * To hide a page behind the "Under Construction" placeholder, add its
 * path (as matched by the router) to the `sections` set below.
 *
 * To restore the original content, remove the path from this set.
 * The real content is preserved in the source files and will
 * reappear as soon as the entry is removed.
 */

/** Pages/sections currently behind the under-construction stub */
export const UNDER_CONSTRUCTION_SECTIONS = new Set([
  "/personal/story",
  "/professional/musings",
])

/** Project IDs that should show under-construction instead of real content */
export const UNDER_CONSTRUCTION_PROJECTS = new Set([
  "earning-a-dollar",
  "mission-tweedy",
])
