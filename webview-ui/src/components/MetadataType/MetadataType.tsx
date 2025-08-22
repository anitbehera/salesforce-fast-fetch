import { type MetaDataType } from "../../data/fakeData";
import MetadataTypeSection from "./MetadataTypeSection";
import EmptyState from "../common/EmptyState";

interface MetadataTypeProps {
  filteredMetaDataTypes: MetaDataType[];
  expandedSections: Record<string, boolean>;
  onToggleSection: (metaDataTypeId: string) => void;
  searchTerm: string;
}

const MetadataType = ({
  filteredMetaDataTypes,
  expandedSections,
  onToggleSection,
  searchTerm,
}: MetadataTypeProps) => {
  if (filteredMetaDataTypes.length === 0 && searchTerm) {
    return <EmptyState searchTerm={searchTerm} />;
  }

  return (
    <div className="flex-1">
      {filteredMetaDataTypes.map((metaDataType, metaDataTypeIndex) => (
        <MetadataTypeSection
          key={metaDataType.id}
          metaDataType={metaDataType}
          isExpanded={expandedSections[metaDataType.id]}
          onToggle={() => onToggleSection(metaDataType.id)}
          searchTerm={searchTerm}
          showBorder={metaDataTypeIndex < filteredMetaDataTypes.length - 1}
        />
      ))}
    </div>
  );
};

export default MetadataType;
