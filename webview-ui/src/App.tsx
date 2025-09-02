import { useEffect, useRef, useState } from "react";
import { vscode } from "./utils/vscode";

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
import type { MetadataType } from "./types/metadata";

import MetadataTypeSelect from "./components/MetadataTypeSelect/MetadataTypeSelect";
import SearchBar from "./components/SearchBar/SearchBar";
import MetadataTree from "./components/MetadataTree/MetadataTree";
import Initializing from "./components/common/Initializing/Initializing";

function App() {
  const [metadataTypes, setMetadataTypes] = useState<MetadataType[]>([]);
  const [selectedMetadataTypes, setSelectedMetadataTypes] = useState<string[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);
  const [fetching, setFetching] = useState(false);
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
    setFetching(true);
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
        // setError('');
        break;

      case "showError":
        // setLoading(false);
        // setError(message.message);
        break;
      case "orgSwitch":
        setIsInitializing(true);
        // setError(message.message);
        break;

      case "metadataTypes": {
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
        setIsInitializing(false);
        setFetching(false);
        // setError('');
        break;
      }

      case "metadataTypesLoaded":
        setMetadataTypes(message.data);
        setFetching(false);
        // setError('');
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
      {isInitializing ? (
        <Initializing />
      ) : (
        <>
          <MetadataTypeSelect
            metadataTypes={metadataTypes}
            multiSelectRef={multiSelectRef}
            fetching={fetching}
            selectedMetadataTypes={selectedMetadataTypes}
            onSelectionChange={handleMetadataTypeChange}
          />

          <SearchBar searchTerm={searchTerm} onSearch={setSearchTerm} />

          <MetadataTree
            metadataTypes={metadataTypes}
            searchTerm={searchTerm}
            treeRef={treeRef}
          />
        </>
      )}
    </main>
  );
}

export default App;
