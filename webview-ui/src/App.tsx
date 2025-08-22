import { useEffect } from "react";
import { vscode } from "./utils/vscode";
import SearchInput from "./components/SearchInput/SearchInput";
import MetadataType from "./components/MetadataType/MetadataType";
import { componentsData } from "./data/fakeData";
import { useSearch } from "./hooks/useSearch";
import { useExpandedSections } from "./hooks/useExpandedSections";

function App() {
  const { searchTerm, setSearchTerm, filteredMetaDataTypes } = useSearch(componentsData.metaDataTypes);
  const { expandedSections, toggleSection } = useExpandedSections(componentsData.metaDataTypes);

  useEffect(() => {
    vscode.postMessage({
      command: "ready",
    });
  }, []);

  return (
    <main className="min-h-screen text-sm">
      <SearchInput searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      <MetadataType
        filteredMetaDataTypes={filteredMetaDataTypes}
        expandedSections={expandedSections}
        onToggleSection={toggleSection}
        searchTerm={searchTerm}
      />
    </main>
  );
}

export default App;
