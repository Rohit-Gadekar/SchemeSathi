import { getSeededSchemes } from "../../src/db/schemesSeed";
import { Scheme } from "../../src/types";

// In-memory static cache of schemes
const schemes: Scheme[] = getSeededSchemes();

/**
 * Accesses all cached government benefit schemes.
 */
export function getAllSchemes(): Scheme[] {
  return schemes;
}

/**
 * Resolves a scheme config based on unique id string.
 * @param id Unique identifier of requested scheme.
 */
export function findSchemeById(id: string): Scheme | undefined {
  return schemes.find(s => s.id === id);
}
