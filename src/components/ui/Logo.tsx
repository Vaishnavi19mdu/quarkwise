import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <svg
        width="150"
        height="32"
        viewBox="0 0 150 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
        textRendering="geometricPrecision"
      >
        <g transform="translate(4, 4)">
          {/* Tilted Orbits */}
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4"
            stroke="#2F6F73"
            strokeWidth="1.2"
            transform="rotate(30 12 12)"
            vectorEffect="non-scaling-stroke"
          />
          <ellipse
            cx="12"
            cy="12"
            rx="11"
            ry="4"
            stroke="#2F6F73"
            strokeWidth="1.2"
            transform="rotate(-40 12 12)"
            vectorEffect="non-scaling-stroke"
          />
          
          {/* Stylized Q/W Center */}
          <circle cx="12" cy="12" r="5" fill="#B3E0DC" fillOpacity="0.3" />
          <path
            d="M10 9.5C9 10 8.5 12 9 14C9.5 16 12 17 14.5 15"
            stroke="#2F6F73"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d="M11 12.5L12 11L13 12.5L14 11"
            stroke="#2F6F73"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {/* Electron dot */}
          <circle cx="21" cy="8" r="1.8" fill="#22C55E">
             <animate
              attributeName="opacity"
              values="1;0.5;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        <text
          x="28"
          y="22"
          fill="#0F172A"
          style={{ 
            fontFamily: 'Inter, sans-serif', 
            fontWeight: 600, 
            fontSize: '19px',
            letterSpacing: '-0.03em'
          }}
        >
          Quarkwise
        </text>
      </svg>
    </div>
  );
};
