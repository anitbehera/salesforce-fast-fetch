import "./ProgressRing.css";

const ProgressRing = () => {
  return (
    <>
      <svg
        className="vscode-progress-ring"
        viewBox="0 0 16 16"
        width="1em"
        height="1em"
        role="progressbar"
        aria-label="Loading"
      >
        <circle className="background" cx="8" cy="8" r="7" />
        <circle className="indicator" cx="8" cy="8" r="7" />
      </svg>
    </>
  );
};

export default ProgressRing;
