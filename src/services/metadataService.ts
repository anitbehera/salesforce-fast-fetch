import * as vscode from "vscode";
import { SalesforceCLIExecutor } from "../cli/commandExecutor";
import { MetadataType, MetadataComponent } from "../types/metadata";
import { sortMetadataComponents } from "../utils/common";
export class MetadataService {
  /**
   * Get all available metadata types from the org
   */
  public static async getAllMetadataTypes(): Promise<MetadataType[]> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "org list metadata-types",
        ["--json"]
      );

      if (result.success) {
        const output = JSON.parse(result.stdout);
        return output.result.metadataObjects || [];
      } else {
        throw new Error(`Failed to get metadata types: ${result.stderr}`);
      }
    } catch (error) {
      console.error("Error fetching metadata types:", error);
      return [];
    }
  }

  /**
   * Get user selected metadata list from the org
   */
  public static async getSelectedMetadataList(
    selectedTypes: string[],
    allMetadataTypes: MetadataType[],
    orgFolderUri?: vscode.Uri
  ): Promise<(MetadataType & { components?: MetadataComponent[] })[]> {
    try {
      const { default: pLimit } = await import("p-limit");
      const limit = pLimit(3);

      const filteredTypes = allMetadataTypes.filter((mt) =>
        selectedTypes.includes(mt.xmlName)
      );

      const withComponents = await Promise.all(
        filteredTypes.map((metadata) =>
          limit(async () => {
            try {
              const components = await MetadataService.listMetadataComponents(
                metadata.xmlName,
                undefined,
                orgFolderUri
              );
              return { ...metadata, components, selected: true };
            } catch {
              return { ...metadata, components: [], selected: true };
            }
          })
        )
      );

      return allMetadataTypes.map(
        (mt) => withComponents.find((x) => x.xmlName === mt.xmlName) || mt
      );
    } catch (error) {
      console.error("Failed to fetch selected metadata:", error);
      return allMetadataTypes;
    }
  }

  /**
   * List all components for a specific metadata type
   * and persist them to disk if orgFolderUri is provided
   */
  public static async listMetadataComponents(
    metadataType: string,
    folder?: string,
    orgFolderUri?: vscode.Uri
  ): Promise<MetadataComponent[]> {
    try {
      const args = [
        "org list metadata",
        "--metadata-type",
        metadataType,
        "--json",
      ];

      if (folder) args.push("--folder", folder);

      const result = await SalesforceCLIExecutor.executeSfCommand("", args);

      if (result.success) {
        const output = JSON.parse(result.stdout);
        let components: MetadataComponent[] = output.result || [];

        // Sort components using helper
        components = sortMetadataComponents(components);

        // Persist to disk if orgFolderUri is provided
        if (orgFolderUri) {
          const fileUri = vscode.Uri.joinPath(
            orgFolderUri,
            `${metadataType}.json`
          );
          await vscode.workspace.fs.writeFile(
            fileUri,
            new TextEncoder().encode(JSON.stringify(components, null, 2))
          );
        }

        return components;
      } else {
        throw new Error(
          `Failed to list components for ${metadataType}: ${result.stderr}`
        );
      }
    } catch (error) {
      console.error(`Error listing components for ${metadataType}:`, error);
      return [];
    }
  }

  /**
   * Retrieve a single metadata component
   */
  public static async retrieveSingleComponent(
    metadataType: string,
    componentName: string
  ): Promise<boolean> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "project retrieve start",
        ["--metadata", `${metadataType}:${componentName}`, "--json"]
      );

      return result.success;
    } catch (error) {
      console.error(
        `Error retrieving ${metadataType}:${componentName}:`,
        error
      );
      return false;
    }
  }

  /**
   * Retrieve all components of a specific metadata type
   */
  public static async retrieveAllComponentsOfType(
    metadataType: string
  ): Promise<boolean> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "project retrieve start",
        ["--metadata", metadataType, "--json"]
      );

      return result.success;
    } catch (error) {
      console.error(`Error retrieving all ${metadataType} components:`, error);
      return false;
    }
  }

  /**
   * Retrieve multiple specific components
   */
  public static async retrieveMultipleComponents(
    components: { type: string; name: string }[]
  ): Promise<boolean> {
    try {
      const metadataItems = components.map(
        (comp) => `${comp.type}:${comp.name}`
      );

      const result = await SalesforceCLIExecutor.executeSfCommand(
        "project retrieve start",
        ["--metadata", ...metadataItems, "--json"]
      );

      return result.success;
    } catch (error) {
      console.error("Error retrieving multiple components:", error);
      return false;
    }
  }

  /**
   * Get folders for metadata types that support them
   */
  public static async getFolders(metadataType: string): Promise<string[]> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "org list metadata",
        ["--metadata-type", `${metadataType}Folder`, "--json"]
      );

      if (result.success) {
        const output = JSON.parse(result.stdout);
        return output.result?.map((folder: any) => folder.fullName) || [];
      }
    } catch (error) {
      console.error(`Error fetching folders for ${metadataType}:`, error);
    }
    return [];
  }

  /**
   * Delete a specific metadata component
   */
  public static async deleteMetadata(
    metadataType: string,
    componentName: string
  ): Promise<boolean> {
    try {
      const result = await SalesforceCLIExecutor.executeSfCommand(
        "project delete source",
        ["--metadata", `${metadataType}:${componentName}`, "--no-prompt", "--json"]
      );
      return result.success;
    } catch (error) {
      console.error(`Error deleting ${metadataType}:${componentName}:`, error);
      return false;
    }
  }
}
