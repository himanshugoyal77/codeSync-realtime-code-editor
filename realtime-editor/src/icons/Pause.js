import React from "react";

const Pause = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      style={{
        width: "1.5rem",
        height: "1.5rem",
        display: "block",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: 3,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        cursor: "pointer",
      }}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
      />
    </svg>
  );
};

export default Pause;
