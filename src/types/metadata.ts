export interface MetadataType {
  id: string;
  xmlName: string;
  suffix?: string;
  directoryName?: string;
  selected?: boolean;
  components?: MetadataComponent[];
}
export interface MetadataComponent {
  id?: string;
  fullName: string;
  lastModifiedDate?: string;
  lastModifiedByName?: string;
  type: string;
}
