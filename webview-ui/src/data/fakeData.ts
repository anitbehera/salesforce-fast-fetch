export interface MetaDataItem {
  id: string;
  fullName: string;
  lastModifiedByName: string;
  lastModifiedDate: string;
  type: string;
}

export interface MetaDataType {
  id: string;
  name: string;
  count: number;
  listMetaData: MetaDataItem[];
}

export interface ComponentsData {
  metaDataTypes: MetaDataType[];
}

export const componentsData: ComponentsData = {
  metaDataTypes: [
    {
      id: "OmniUICards",
      name: "OmniUICards",
      count: 4,
      listMetaData: [
        {
          id: "1",
          fullName: "TestCard_dev_1",
          lastModifiedByName: "User A",
          lastModifiedDate: "2023-01-01",
          type: "OmniUICards"
        },
        {
          id: "2",
          fullName: "AddContact_dev_2",
          lastModifiedByName: "User B",
          lastModifiedDate: "2023-01-02",
          type: "OmniUICards"
        },
        {
          id: "3",
          fullName: "DisplayRelatedList_dev_1",
          lastModifiedByName: "User C",
          lastModifiedDate: "2023-01-03",
          type: "OmniUICards"
        },
        {
          id: "4",
          fullName: "SaveLoanApplication_dev_1",
          lastModifiedByName: "User D",
          lastModifiedDate: "2023-01-04",
          type: "OmniUICards"
        }
      ]
    },
    {
      id: "OmniDataTransforms",
      name: "OmniDataTransforms",
      count: 2,
      listMetaData: [
        {
          id: "5",
          fullName: "TransformAccountRecords_1",
          lastModifiedByName: "User E",
          lastModifiedDate: "2023-01-05",
          type: "OmniDataTransforms"
        },
        {
          id: "6",
          fullName: "SaveLoanApplication_dev_1",
          lastModifiedByName: "User E",
          lastModifiedDate: "2023-01-06",
          type: "OmniDataTransforms"
        }
      ]
    }
  ]
};
