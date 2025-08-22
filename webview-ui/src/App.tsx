import { useEffect, useState, useMemo } from "react";
import { vscode } from "./utils/vscode";
import {
  VSCodeTextField,
  VSCodeBadge,
  VSCodeButton,
} from "@vscode/webview-ui-toolkit/react";
import {
  componentsData,
  type MetaDataItem,
  type MetaDataType,
} from "./data/fakeData";

function App() {
  useEffect(() => {
    vscode.postMessage({
      command: "ready",
    });
  }, []);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Initialize all metadata-type sections as expanded
  const [expandedSections, setExpandedSections] = useState(() => {
    const initialState: Record<string, boolean> = {};
    componentsData.metaDataTypes.forEach((metaDataType: MetaDataType) => {
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

  // Filter metadata-types and metadata based on search term
  const filteredMetaDataTypes = useMemo(() => {
    if (!searchTerm.trim()) {
      return componentsData.metaDataTypes;
    }

    const lowercaseSearch = searchTerm.toLowerCase();

    return componentsData.metaDataTypes
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
              : filteredMetaDataList, // Show all metadata if metadata-type name matches, otherwise show filtered metadata
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
  }, [searchTerm]);

  // Highlight matching text in search results
  const highlightMatch = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-400 text-black rounded px-0.5">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <>
      <main className="min-h-screen font-mono text-sm">
        {/* search metadata */}
        <div className="w-full px-2">
          <VSCodeTextField
            placeholder="Type to search metadata..."
            className="w-full"
            value={searchTerm}
            onInput={(e) => {
              setSearchTerm((e.target as HTMLInputElement).value);
            }}
          >
            <span slot="end" className="codicon codicon-search"></span>
          </VSCodeTextField>
        </div>

        {/* Metadata tree section */}
        <div className="flex-1">
          {filteredMetaDataTypes.length === 0 && searchTerm ? (
            <div className="p-4 text-gray-400 text-center">
              No metadata found matching "{searchTerm}"
            </div>
          ) : (
            filteredMetaDataTypes.map(
              (metaDataType: MetaDataType, metaDataTypeIndex: number) => (
                <div
                  key={metaDataType.id}
                  className={
                    metaDataTypeIndex < filteredMetaDataTypes.length - 1
                      ? "border-b border-[#2d2d30]"
                      : ""
                  }
                >
                  {/* Metadata type */}
                  <button
                    onClick={() => toggleSection(metaDataType.id)}
                    className="w-full text-left flex items-center justify-between relative group py-1 pr-2 cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>

                    <div className="flex items-center gap-1 relative z-10">
                      <span
                        className={`codicon transition-transform duration-200 ${
                          expandedSections[metaDataType.id]
                            ? "codicon-chevron-down"
                            : "codicon-chevron-right"
                        }`}
                      ></span>
                      <span>
                        {highlightMatch(metaDataType.name, searchTerm)}
                      </span>
                    </div>
                    <span className="text-xs rounded relative z-10">
                      <VSCodeBadge>{metaDataType.count}</VSCodeBadge>
                    </span>
                  </button>

                  {/* Metadata Items*/}
                  {expandedSections[metaDataType.id] && (
                    <div>
                      {metaDataType.listMetaData.map(
                        (metaDataItem: MetaDataItem) => (
                          <div
                            key={metaDataItem.id}
                            className="flex items-center gap-2 pl-4 pr-6 py-1 relative group cursor-pointer"
                          >
                            <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
                            {/* <span className="codicon codicon-cloud-download relative z-10"></span> */}
                            <div className="relative z-10 rounded hover:scale-110 transition-transform duration-150">
                              <VSCodeButton appearance="icon">
                                <span className="codicon codicon-cloud-download"></span>
                              </VSCodeButton>
                            </div>

                            <span className="relative z-10">
                              {highlightMatch(
                                metaDataItem.fullName,
                                searchTerm
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )
            )
          )}
        </div>
      </main>
    </>
  );
}

export default App;
