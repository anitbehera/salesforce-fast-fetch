import { useState, useEffect, useRef } from "react";
import { type MetaDataType } from "../data/fakeData";

export const useExpandedSections = (
  metaDataTypes: MetaDataType[],
  filteredMetaDataTypes: MetaDataType[],
  searchTerm: string
) => {
  // Track the user's manual state (what they expanded/collapsed themselves)
  const userState = useRef<Record<string, boolean>>({});
  
  // Initialize default collapsed state
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState: Record<string, boolean> = {};
    metaDataTypes.forEach((metaDataType) => {
      initialState[metaDataType.id] = false;
      // Initialize user state as well
      userState.current[metaDataType.id] = false;
    });
    return initialState;
  });

  useEffect(() => {
    if (searchTerm.trim()) {
      // On search: expand only sections with results
      const newState: Record<string, boolean> = {};
      metaDataTypes.forEach((metaDataType) => {
        newState[metaDataType.id] = filteredMetaDataTypes.some(
          (f) => f.id === metaDataType.id
        );
      });
      setExpandedSections(newState);
    } else {
      // When search is cleared, restore user's previous state
      setExpandedSections({ ...userState.current });
    }
  }, [searchTerm, metaDataTypes, filteredMetaDataTypes]);

  const toggleSection = (metaDataTypeId: string) => {
    // Only update user state if there's no active search
    // This preserves user's manual actions
    if (!searchTerm.trim()) {
      const newState = !expandedSections[metaDataTypeId];
      userState.current[metaDataTypeId] = newState;
      
      setExpandedSections((prev) => ({
        ...prev,
        [metaDataTypeId]: newState,
      }));
    } else {
      // During search, just toggle the current state without affecting user state
      setExpandedSections((prev) => ({
        ...prev,
        [metaDataTypeId]: !prev[metaDataTypeId],
      }));
    }
  };

  return {
    expandedSections,
    toggleSection,
  };
};
