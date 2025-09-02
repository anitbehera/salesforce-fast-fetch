import React from "react";

export interface TreeItemTooltipProps {
  createdByName?: string;
  createdDate?: string;
  lastModifiedByName?: string;
  lastModifiedDate?: string;
}

const formatDate = (date?: string) => {
  if (!date) return "Unknown";
  const d = new Date(date);
  return isNaN(d.getTime())
    ? date
    : d.toLocaleString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
};

export const TreeItemTooltip: React.FC<TreeItemTooltipProps> = ({
  createdByName,
  createdDate,
  lastModifiedByName,
  lastModifiedDate,
}) => (
 <div className="text-xs p-2 rounded shadow-lg bg-[var(--vscode-editorWidget-background)] border border-[var(--vscode-editorWidget-border)]">
    <div>
      Created By:{" "}
      <span style={{ color: "var(--vscode-testing-iconPassed)" }}>
        {createdByName ?? "Unknown"}
      </span>
    </div>
    <div>
      Created Date:{" "}
      <span style={{ color: "var(--vscode-testing-iconPassed)" }}>
        {formatDate(createdDate)}
      </span>
    </div>
    <div>
      Last Modified By:{" "}
      <span style={{ color: "var(--vscode-editorWarning-foreground)" }}>
        {lastModifiedByName ?? "Unknown"}
      </span>
    </div>
    <div>
      Last Modified Date:{" "}
      <span style={{ color: "var(--vscode-editorWarning-foreground)" }}>
        {formatDate(lastModifiedDate)}
      </span>
    </div>
  </div>
);
