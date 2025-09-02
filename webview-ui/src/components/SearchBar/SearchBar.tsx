interface Props {
  searchTerm: string;
  onSearch: (value: string) => void;
}

function SearchBar({ searchTerm, onSearch }: Props) {
  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    const value = (e.currentTarget as unknown as { value?: string }).value ?? "";
    onSearch(value);
  };

  return (
    <div className="w-full px-2 py-2 border-b border-[var(--vscode-sideBar-border)]">
      <vscode-textfield
        placeholder="Type to search metadata..."
        className="w-full"
        value={searchTerm}
        onInput={handleInput}
      >
        <vscode-icon
          slot="content-after"
          name="search"
          title="search"
          className="px-1"
        />
      </vscode-textfield>
    </div>
  );
}

export default SearchBar;
