import { useState, useMemo } from "react";
import { type MetaDataType, type MetaDataItem } from "../data/fakeData";

export const useSearch = (metaDataTypes: MetaDataType[]) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMetaDataTypes = useMemo(() => {
    if (!searchTerm.trim()) {
      return metaDataTypes;
    }

    const lowercaseSearch = searchTerm.toLowerCase();

    return metaDataTypes
      .map((metaDataType: MetaDataType) => {
        // Filter metadata that match the search term
        const filteredMetaDataList = metaDataType.listMetaData.filter(
          (metaDataItem: MetaDataItem) =>
            metaDataItem.fullName.toLowerCase().includes(lowercaseSearch) ||
            metaDataItem.lastModifiedByName
              .toLowerCase()
              .includes(lowercaseSearch) ||
            metaDataItem.type.toLowerCase().includes(lowercaseSearch)
        );

        // Include metadata-types if its name matches or if it has matching metadata
        const metaDataTypeMatches = metaDataType.name
          .toLowerCase()
          .includes(lowercaseSearch);

        if (metaDataTypeMatches || filteredMetaDataList.length > 0) {
          return {
            ...metaDataType,
            listMetaData: metaDataTypeMatches
              ? metaDataType.listMetaData
              : filteredMetaDataList,
            count: metaDataTypeMatches
              ? metaDataType.listMetaData.length
              : filteredMetaDataList.length,
          };
        }

        return null;
      })
      .filter(
        (metaDataType): metaDataType is MetaDataType => metaDataType !== null
      );
  }, [searchTerm, metaDataTypes]);

  return {
    searchTerm,
    setSearchTerm,
    filteredMetaDataTypes,
  };
};
