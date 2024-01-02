import React from "react";

const Cancel = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      dataSlot="icon"
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
        d="M6 18 18 6M6 6l12 12"
      />
    </svg>
  );
};

export default Cancel;
