import { forwardRef } from 'react';

const Car = forwardRef<HTMLDivElement>(function Car(_props, ref) {
  return (
    <div ref={ref} className="drive-car" data-moving="false" aria-label="Ali's portfolio car">
      <svg className="drive-car-svg" viewBox="0 0 220 100" role="img" aria-label="Blue sports car">
        <defs>
          <linearGradient id="drive-car-paint" x1="30" y1="24" x2="190" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset=".48" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="drive-car-window" x1="83" y1="33" x2="145" y2="61" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#164E63" />
          </linearGradient>
        </defs>
        <ellipse cx="113" cy="85" rx="91" ry="9" fill="#020617" opacity=".28" />
        <path d="M22 68c3-10 10-17 21-20l36-8 22-24c4-5 10-8 16-8h32c10 0 18 5 24 13l16 21 15 7c7 3 11 8 13 16l2 9H19l3-6Z" fill="url(#drive-car-paint)" stroke="#BAF7FF" strokeWidth="2" />
        <path d="m88 39 19-21c3-3 6-5 11-5h28c7 0 12 3 16 9l13 17H88Z" fill="url(#drive-car-window)" stroke="#A5F3FC" strokeOpacity=".8" strokeWidth="2" />
        <path d="M118 14v25m44-17 10 17" stroke="#67E8F9" strokeOpacity=".58" strokeWidth="2" />
        <path d="M28 66h25m127 0h19" stroke="#E0F2FE" strokeLinecap="round" strokeWidth="4" />
        <path d="M21 75h177" stroke="#0F172A" strokeOpacity=".42" strokeWidth="3" />
        <path d="M204 58h9c2 0 4 2 4 4v5h-10l-3-9Z" fill="#ECFEFF" />
        <path d="M20 61h9l-3 9h-9v-5c0-2 1-4 3-4Z" fill="#FB7185" />
        <g className="drive-car-wheel">
          <circle cx="62" cy="77" r="15" fill="#111827" stroke="#CBD5E1" strokeWidth="4" />
          <circle cx="62" cy="77" r="5" fill="#67E8F9" />
        </g>
        <g className="drive-car-wheel">
          <circle cx="177" cy="77" r="15" fill="#111827" stroke="#CBD5E1" strokeWidth="4" />
          <circle cx="177" cy="77" r="5" fill="#67E8F9" />
        </g>
        <path className="drive-headlight-beam" d="M210 59 318 37v47l-108-13v-12Z" fill="#BAF7FF" />
      </svg>
      <span className="drive-car-glow" aria-hidden="true" />
    </div>
  );
});

export default Car;
