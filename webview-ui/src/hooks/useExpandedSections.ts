import { useState } from "react";
import { type MetaDataType } from "../data/fakeData";

export const useExpandedSections = (metaDataTypes: MetaDataType[]) => {
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState: Record<string, boolean> = {};
    metaDataTypes.forEach((metaDataType: MetaDataType) => {
      initialState[metaDataType.id] = true;
    });
    return initialState;
  });

  const toggleSection = (metaDataTypeId: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [metaDataTypeId]: !prev[metaDataTypeId],
    }));
  };

  return {
    expandedSections,
    toggleSection,
  };
};
