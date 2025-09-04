import ProgressRing from "../common/ProgressRing/ProgressRing";
import type { MetadataType } from "../../types/metadata";
import type { VscodeMultiSelect } from "@vscode-elements/elements/dist/vscode-multi-select";
import type { RefObject } from "react";
import { useShadowEventDelegation } from "../../hooks/useShadowEventDelegation";
import { vscode } from "../../utils/vscode";

interface Props {
  metadataTypes: MetadataType[];
  multiSelectRef: RefObject<VscodeMultiSelect | null>;
  fetching: boolean;
  setFetching: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedMetadataTypes: React.Dispatch<React.SetStateAction<Array<string>>>;
  selectedMetadataTypes: string[];
  onSelectionChange: (
    newSelection: string[],
    selectedType?: string,
    deselectedType?: string
  ) => void;
}

function MetadataTypeSelect({
  metadataTypes,
  multiSelectRef,
  fetching,
  setFetching,
  selectedMetadataTypes,
  setSelectedMetadataTypes,
  onSelectionChange,
}: Props) {
  const refreshSelectedType = () => {
    setFetching(true);
    if (multiSelectRef.current) {
      const selectedTypes = multiSelectRef.current.value;
      vscode.postMessage({
        command: "refreshSelectedMetadataList",
        value: selectedTypes,
      });
    }
  };

  const clearSelection = () => {
    if (multiSelectRef.current) {
      multiSelectRef.current.selectNone();
      setSelectedMetadataTypes([]);
      vscode.postMessage({
        command: "loadMetadataComponents",
        type: "deselectAll",
        value: undefined,
      });
    }
  };

  useShadowEventDelegation<VscodeMultiSelect>(
    multiSelectRef,
    "change",
    (_multiSelect, ev) => {
      const target = ev.target as HTMLSelectElement;
      const newSelection = [...target.value];
      const prevSelection = selectedMetadataTypes;
      if (prevSelection.length === newSelection.length) {
        return;
      }

      let selectedType: string | undefined;
      let deselectedType: string | undefined;

      if (newSelection.length > prevSelection.length) {
        selectedType = newSelection[newSelection.length - 1];
      } else {
        deselectedType = prevSelection.find(
          (item) => !newSelection.includes(item)
        );
      }

      onSelectionChange(newSelection, selectedType, deselectedType);
    }
  );

  return (
    <div className="w-full px-2 pt-1 flex items-center gap-2">
      <vscode-multi-select
        ref={multiSelectRef}
        key={metadataTypes.map((t) => t.xmlName + t.selected).join(",")}
        className="flex-1"
        id="metadata-type-select"
        combobox
      >
        {metadataTypes.map((type) => (
          <vscode-option key={type.xmlName} selected={type.selected}>
            {type.xmlName}
          </vscode-option>
        ))}
      </vscode-multi-select>

      <vscode-toolbar-button
        icon="close"
        label="Clear Selection"
        onClick={clearSelection}
      ></vscode-toolbar-button>

      {/* <vscode-button
          secondary
          icon="close"
          title="Clear Selection"
          onClick={clearSelection}
        ></vscode-button> */}

      {fetching ? (
        <ProgressRing />
      ) : (
        <vscode-button
          secondary
          icon="refresh"
          title="Refresh Components"
          onClick={refreshSelectedType}
        ></vscode-button>
      )}
      {/* <vscode-button
            icon-only
            secondary
          >
            <ProgressRing />
          </vscode-button> */}
    </div>
  );
}

export default MetadataTypeSelect;
