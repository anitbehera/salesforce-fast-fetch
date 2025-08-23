interface HighlightTextProps {
  text: string;
  searchTerm: string;
}

const HighlightText = ({ text, searchTerm }: HighlightTextProps) => {
  if (!searchTerm.trim()) return <>{text}</>;

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <span key={index} className="bg-amber-600 text-black px-0.5">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
};

export default HighlightText;
