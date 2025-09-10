import { MetadataComponent } from "../types/metadata";

export function sortMetadataComponents(components: MetadataComponent[]): MetadataComponent[] {
  const regex = /^(.*?)(?:_(\d+))?$/;

  return components.sort((a, b) => {
    const [, baseA, numA] = a.fullName.match(regex) || [];
    const [, baseB, numB] = b.fullName.match(regex) || [];

    // Normalize base (strip environment suffixes like _Salesforce, _MBFS, etc.)
    const normalizeBase = (base: string) =>
      base.replace(/_(Salesforce|MBFS|ITA|MBM|FSCredit)$/i, "");

    const normA = normalizeBase(baseA);
    const normB = normalizeBase(baseB);

    // If both have no trailing number → compare fullName directly
    if (!numA && !numB) {
      return a.fullName.localeCompare(b.fullName);
    }

    // Compare normalized base names
    const baseCompare = normA.localeCompare(normB);
    if (baseCompare !== 0) return baseCompare;

    // Compare numbers if present
    const nA = numA ? parseInt(numA, 10) : 0;
    const nB = numB ? parseInt(numB, 10) : 0;
    return nA - nB || a.fullName.localeCompare(b.fullName); // fallback if same number
  });
}
