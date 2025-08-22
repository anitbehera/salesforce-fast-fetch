import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { type MetaDataItem } from "../../data/fakeData";
import HighlightText from "../common/HighlightText";

interface MetadataItemProps {
  metaDataItem: MetaDataItem;
  searchTerm: string;
}

const MetadataItem = ({ metaDataItem, searchTerm }: MetadataItemProps) => {
  return (
    <div className="flex items-center gap-1 pl-2 pr-6 py-0.5 relative group cursor-pointer">
      <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"></div>
      
      <div className="relative z-10 rounded hover:scale-110 transition-transform duration-150 flex items-center justify-center">
        <VSCodeButton appearance="icon">
          <span className="codicon codicon-cloud-download"></span>
        </VSCodeButton>
      </div>

      <span className="relative z-10">
        <HighlightText text={metaDataItem.fullName} searchTerm={searchTerm} />
      </span>
    </div>
  );
};

export default MetadataItem;
