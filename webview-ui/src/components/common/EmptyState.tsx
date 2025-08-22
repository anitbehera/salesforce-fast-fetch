interface EmptyStateProps {
  searchTerm: string;
}

const EmptyState = ({ searchTerm }: EmptyStateProps) => {
  return (
    <div className="p-4 text-gray-400 text-center">
      No metadata found matching "{searchTerm}"
    </div>
  );
};

export default EmptyState;
