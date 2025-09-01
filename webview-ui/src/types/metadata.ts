export interface MetadataType {
  id: string;
  xmlName: string;
  suffix?: string;
  directoryName?: string;
  selected?: boolean | undefined;
  components?: MetadataComponent[] | undefined;
}
export interface MetadataComponent {
  createdDate: string;
  createdByName: string;
  id: string;
  fullName: string;
  lastModifiedDate?: string;
  lastModifiedByName?: string;
  type: string;
}

