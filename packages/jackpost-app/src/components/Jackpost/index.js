import React from 'react';

// Jackpost logo mark
const Jackpost = ({ width }) => {
  return (
    <svg width={width} viewBox="0 0 72 72" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jackpost">
      <rect x="4" y="4" width="64" height="64" rx="16" fill="#2BC4B0" />
      <path
        d="M41 18v22c0 7-4 11-10 11-3.5 0-6.2-1.2-8-3.3l4-5c1 1.2 2.2 1.8 3.7 1.8 2 0 3.3-1.2 3.3-4.3V18z"
        fill="#10201E"
      />
    </svg>
  );
};

export default Jackpost;
