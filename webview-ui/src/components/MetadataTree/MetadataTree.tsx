import { useEffect, type RefObject } from "react";
import type { MetadataComponent, MetadataType } from "../../types/metadata";
import type { VscodeTree } from "@vscode-elements/elements/dist/vscode-tree";
import { vscode } from "../../utils/vscode";
import { useShadowEventDelegation } from "../../hooks/useShadowEventDelegation";
import { TreeItemTooltip } from "../common/TreeItemTooltip/TreeItemTooltip";
import { useTooltip } from "../../hooks/useTooltip";

interface Props {
  metadataTypes: MetadataType[];
  searchTerm: string;
  treeRef: RefObject<VscodeTree | null>;
}

function MetadataTree({ metadataTypes, searchTerm, treeRef }: Props) {

    const { hovered: hoveredComponent, attach, TooltipPortal } = useTooltip<MetadataComponent>();
  
    useEffect(() => {
      attach("vscode-tree-item", (el: HTMLElement): MetadataComponent | null => {
        const raw = el.getAttribute("data-component");
        return raw ? (JSON.parse(raw) as MetadataComponent) : null;
      });
    }, [attach]);
    
  const handleDownload = (metadataType: string, componentName: string) => {
    if(!metadataType || !componentName) return;
    vscode.postMessage({
      command: "retrieveMetadata",
      type: metadataType,
      value: componentName,
    });
  };
  useShadowEventDelegation<HTMLButtonElement>(
    treeRef,
    "click",
    (button, ev) => {
      ev.stopPropagation();
      const type = button.dataset.type ?? "";
      const name = button.dataset.component ?? "";
      handleDownload(type, name);
    },
    "vscode-toolbar-button"
  );

  return (
    <div className="flex-1">
      <vscode-tree ref={treeRef}>
        {metadataTypes
          .filter((type) => type.selected)
          .map((type) => {
            const filteredComponents =
              type.components?.filter((component) =>
                component.fullName
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase())
              ) ?? [];

            return (
              <vscode-tree-item key={type.xmlName} className="relative">
                <vscode-icon name="folder" slot="icon-branch"></vscode-icon>
                <vscode-icon
                  name="folder-opened"
                  slot="icon-branch-opened"
                ></vscode-icon>
                {type.xmlName}

                <span className="absolute right-2">
                  <vscode-badge
                    className="text-xs px-1 py-0 scale-90"
                    variant="counter"
                  >
                    {filteredComponents.length}
                  </vscode-badge>
                </span>

                {/* Render filtered components */}
                {filteredComponents.map((component) => (
                  <vscode-tree-item
                    key={component.fullName}
                    className="group relative tree-item-with-button"
                    data-component={JSON.stringify(component)}
                  >
                    <vscode-icon name="file" slot="icon-leaf"></vscode-icon>
                    <span className="flex-1">{component.fullName}</span>
                    <vscode-toolbar-button
                      data-component={component.fullName}
                      data-type={type.xmlName}
                      className={`
                        absolute right-2 opacity-0 group-hover:opacity-100 
                        transition-opacity duration-200
                      `}
                      icon="cloud-download"
                      label="Download Component"
                    ></vscode-toolbar-button>
                  </vscode-tree-item>
                ))}
              </vscode-tree-item>
            );
          })}
      </vscode-tree>
      <TooltipPortal>
        {hoveredComponent && (
          <TreeItemTooltip
            createdByName={hoveredComponent.createdByName}
            createdDate={hoveredComponent.createdDate}
            lastModifiedByName={hoveredComponent.lastModifiedByName}
            lastModifiedDate={hoveredComponent.lastModifiedDate}
          />
        )}
      </TooltipPortal>
    </div>
    
  );
}

export default MetadataTree;
