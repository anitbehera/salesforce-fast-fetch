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
          <span key={index} className="bg-orange-300 text-black rounded px-0.5">
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
