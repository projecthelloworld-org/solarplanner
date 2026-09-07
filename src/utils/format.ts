import type { Project, SystemOptionId } from "../types/project";

export const integerFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 0 });
export const decimalFormat = new Intl.NumberFormat("en", { maximumFractionDigits: 2 });

export function selectedSystemFor(project: Project): SystemOptionId {
  return project.selectedSystem === "dc" || project.selectedSystem === "hybrid" ? project.selectedSystem : "dc";
}

export function systemOptionName(systemId: SystemOptionId): string {
  return systemId === "dc" ? "Fully DC System" : "Hybrid DC + AC System";
}

export function money(value: number, project: Project): string {
  return `${project.currency} ${value.toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function moneyDetailed(value: number, project: Project): string {
  return `${project.currency} ${decimalFormat.format(value)}`;
}

export function moneyUsd(value: number): string {
  return `USD ${decimalFormat.format(value)}`;
}

export function formatEnergy(wh: number): string {
  return wh >= 1000 ? `${decimalFormat.format(wh / 1000)} kWh` : `${decimalFormat.format(wh)} Wh`;
}
