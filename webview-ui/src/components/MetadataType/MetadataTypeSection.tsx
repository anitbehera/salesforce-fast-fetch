import { VSCodeBadge } from "@vscode/webview-ui-toolkit/react";
import { type MetaDataType } from "../../data/fakeData";
import MetadataItem from "./MetadataItem";
import HighlightText from "../common/HighlightText";

interface MetadataTypeSectionProps {
  metaDataType: MetaDataType;
  isExpanded: boolean;
  onToggle: () => void;
  searchTerm: string;
  showBorder: boolean;
}

const MetadataTypeSection = ({
  metaDataType,
  isExpanded,
  onToggle,
  searchTerm,
  showBorder,
}: MetadataTypeSectionProps) => {
  return (
    <div className={showBorder ? "border-b border-[#2d2d30]" : ""}>
      {/* Metadata type header */}
      <button
        onClick={onToggle}
        className="w-full text-left flex items-center justify-between relative group py-0.5 pr-2 cursor-pointer"
      >
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>

        <div className="flex items-center gap-1 relative z-10">
          <span
            className={`codicon transition-transform duration-200 ${
              isExpanded ? "codicon-chevron-down" : "codicon-chevron-right"
            }`}
          ></span>
          <span>
            <HighlightText text={metaDataType.name} searchTerm={searchTerm} />
          </span>
        </div>
        <span className="text-xs rounded relative z-10">
          <VSCodeBadge>{metaDataType.count}</VSCodeBadge>
        </span>
      </button>

      {/* Metadata Items */}
      {isExpanded && (
        <div>
          {metaDataType.listMetaData.map((metaDataItem) => (
            <MetadataItem
              key={metaDataItem.id}
              metaDataItem={metaDataItem}
              searchTerm={searchTerm}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MetadataTypeSection;
