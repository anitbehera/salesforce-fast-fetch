import { MetadataComponent } from "../types/metadata";

export function sortMetadataComponents(components: MetadataComponent[]): MetadataComponent[] {
  const regex = /^(.*?)(?:_(\d+))?$/;

  return components.sort((a, b) => {
    const [, baseA, numA] = a.fullName.match(regex) || [];
    const [, baseB, numB] = b.fullName.match(regex) || [];

    // If both have no trailing number → compare fullName directly
    if (!numA && !numB) {
      return a.fullName.localeCompare(b.fullName);
    }

    // Compare base names first (alphabetical ascending)
    const baseCompare = baseA.localeCompare(baseB);
    if (baseCompare !== 0) return baseCompare;

    // Compare numbers (descending)
    const nA = numA ? parseInt(numA, 10) : 0;
    const nB = numB ? parseInt(numB, 10) : 0;
    return nB - nA || a.fullName.localeCompare(b.fullName); // fallback if same number
  });
}
