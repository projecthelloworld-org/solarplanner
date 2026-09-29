/** Relative excess uses requirements that already include the configured reserves. */
export const capacityExcess = (installed: number, required: number): number => required > 0 ? Math.max(0, installed / required - 1) : 0;
export interface FitCandidate { equipmentCost: number; excess: number; units: number; key: string }
export function balancedFit<T extends FitCandidate>(choices: T[]): T | undefined {
  if (!choices.length) return undefined;
  const cheapest = Math.min(...choices.map(c => c.equipmentCost));
  return choices.filter(c => c.equipmentCost <= cheapest * 1.1 + 1e-8)
    .sort((a, b) => a.excess - b.excess || a.equipmentCost - b.equipmentCost || a.units - b.units || a.key.localeCompare(b.key))[0];
}
