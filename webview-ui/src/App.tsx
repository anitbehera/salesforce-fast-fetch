import { useEffect, useRef, useState } from "react";
import { vscode } from "./utils/vscode";
import type { MetadataType } from "./types/metadata";

import "@vscode-elements/elements/dist/vscode-multi-select";
import "@vscode-elements/elements/dist/vscode-option";
import "@vscode-elements/elements/dist/vscode-textfield";
import "@vscode-elements/elements/dist/vscode-icon";
import "@vscode-elements/elements/dist/vscode-tree";
import "@vscode-elements/elements/dist/vscode-tree-item";
import "@vscode-elements/elements/dist/vscode-button";
import "@vscode-elements/elements/dist/vscode-toolbar-button";
import "@vscode-elements/elements/dist/vscode-checkbox";
import "@vscode-elements/elements/dist/vscode-badge";

import type { VscodeMultiSelect } from "@vscode-elements/elements/dist/vscode-multi-select";
import type { VscodeTree } from "@vscode-elements/elements/dist/vscode-tree";

import MetadataTypeSelect from "./components/MetadataTypeSelect/MetadataTypeSelect";
import SearchBar from "./components/SearchBar/SearchBar";
import MetadataTree from "./components/MetadataTree/MetadataTree";

function App() {
  const [metadataTypes, setMetadataTypes] = useState<MetadataType[]>([]);
  const [selectedMetadataTypes, setSelectedMetadataTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState(false); // Start with loading false
  // const [loadingMessage, setLoadingMessage] = useState("Initializing...");
  // const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const multiSelectRef = useRef<VscodeMultiSelect>(null);
  const treeRef = useRef<VscodeTree | null>(null);

  useEffect(() => {
    // SEND 'ready' MESSAGE TO GET PRE-FETCHED METADATA
    vscode.postMessage({
      command: "ready",
    });
    // Listen for messages from extension
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);


  const handleMetadataTypeChange = (newSelection: string[], selectedType?: string, deselectedType?: string) => {
    setLoading(true);
    setSelectedMetadataTypes(newSelection);
    vscode.postMessage({
      command: "loadMetadataComponents",
      type: selectedType ? "selected" : "deselected",
      value: selectedType ?? deselectedType,
    });
  };

  const handleMessage = (event: MessageEvent) => {
    const message = event.data;

    switch (message.type) {
      case "showLoading":
        // setLoading(true);
        // setLoadingMessage(message.message);
        // setError('');
        break;

      case "showError":
        // setLoading(false);
        // setError(message.message);
        break;

      case "metadataTypes": { // RECEIVE PRE-FETCHED METADATA FROM EXTENSION
        setMetadataTypes(message.metadataTypes);
        const selectedXmlNames = message.metadataTypes
          .filter((mt: MetadataType) => mt.selected)
          .map((mt: MetadataType) => mt.xmlName);
        setSelectedMetadataTypes((prev) => {
          if (prev.length === 0 || message.orgSwitch) {
            return selectedXmlNames;
          }
          return prev;
        });
        setLoading(false);
        // setError('');
        // setLoadingMessage('');
        break;
      }

      case "metadataTypesLoaded":
        // RECEIVE PRE-FETCHED METADATA FROM EXTENSION
        setMetadataTypes(message.data);
        setLoading(false);
        // setError('');
        // setLoadingMessage('');
        break;

      case "componentsLoaded":
        console.log(
          `Loaded components for ${message.metadataType}:`,
          message.data.length
        );
        break;

      case "retrieveSuccess":
      case "retrieveError":
      case "bulkRetrieveSuccess":
        break;
    }
  };


  useEffect(() => {
    const tree = treeRef.current;
    if (!tree) return;

    const trimmed = searchTerm.trim();
    const raf = requestAnimationFrame(() => {
      if (trimmed === "") {
        tree.collapseAll();
      } else {
        tree.expandAll();
      }
    });

    return () => cancelAnimationFrame(raf);
  }, [searchTerm]);

  // if (error) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center bg-[var(--vscode-sideBar-background)] text-[var(--vscode-sideBar-foreground)]">
  //       <div className="text-center">
  //         <p className="text-red-500">Error: {error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <main className="min-h-screen text-sm bg-[var(--vscode-sideBar-background)]">
      <MetadataTypeSelect
        metadataTypes={metadataTypes}
        multiSelectRef={multiSelectRef}
        loading={loading}
        selectedMetadataTypes={selectedMetadataTypes}
        onSelectionChange={handleMetadataTypeChange}
      />

      <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

      <MetadataTree
        metadataTypes={metadataTypes}
        searchTerm={searchTerm}
        treeRef={treeRef}
      />
    </main>
  );
}

export default App;
