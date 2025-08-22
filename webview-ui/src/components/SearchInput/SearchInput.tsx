import { VSCodeTextField } from "@vscode/webview-ui-toolkit/react";

interface SearchInputProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const SearchInput = ({ searchTerm, onSearchChange }: SearchInputProps) => {
  return (
    <div className="w-full px-2">
      <VSCodeTextField
        placeholder="Type to search metadata..."
        className="w-full"
        value={searchTerm}
        onInput={(e) => {
          onSearchChange((e.target as HTMLInputElement).value);
        }}
      >
        <span slot="end" className="codicon codicon-search"></span>
      </VSCodeTextField>
    </div>
  );
};

export default SearchInput;
