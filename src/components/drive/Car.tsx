import { forwardRef } from 'react';

type CarProps = {
  isRaining: boolean;
  splashKey: number;
};

const Car = forwardRef<HTMLDivElement, CarProps>(function Car(
  { isRaining, splashKey },
  ref
) {
  return (
    <div
      ref={ref}
      className="drive-car"
      data-moving="false"
      data-boosting="false"
      data-raining={isRaining}
      aria-label="Ali's portfolio monster truck"
    >
      <svg className="drive-car-svg" viewBox="0 0 280 140" role="img" aria-label="Cyan monster truck">
        <defs>
          <linearGradient id="drive-car-paint" x1="32" y1="26" x2="250" y2="102" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67E8F9" />
            <stop offset=".48" stopColor="#22D3EE" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
          <linearGradient id="drive-car-window" x1="97" y1="25" x2="167" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0F172A" />
            <stop offset="1" stopColor="#164E63" />
          </linearGradient>
          <linearGradient id="drive-truck-rim" x1="52" y1="83" x2="91" y2="131" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E2E8F0" />
            <stop offset=".55" stopColor="#64748B" />
            <stop offset="1" stopColor="#CBD5E1" />
          </linearGradient>
        </defs>

        <ellipse
          className="drive-car-shadow"
          cx="143"
          cy="142"
          rx="118"
          ry="7"
          fill="#020617"
          opacity=".3"
        />

        <g className="drive-car-wheel">
          <circle cx="72" cy="111" r="29" fill="#111827" stroke="#020617" strokeWidth="5" />
          <circle cx="72" cy="111" r="24" fill="none" stroke="#475569" strokeWidth="5" strokeDasharray="8 7" />
          <circle cx="72" cy="111" r="17" fill="url(#drive-truck-rim)" stroke="#E2E8F0" strokeWidth="2" />
          <path d="M72 96v30m-15-15h30m-26-11 22 22m0-22-22 22" stroke="#22D3EE" strokeWidth="3" />
          <circle cx="72" cy="111" r="5" fill="#0F172A" />
        </g>

        <g className="drive-car-wheel">
          <circle cx="207" cy="111" r="29" fill="#111827" stroke="#020617" strokeWidth="5" />
          <circle cx="207" cy="111" r="24" fill="none" stroke="#475569" strokeWidth="5" strokeDasharray="8 7" />
          <circle cx="207" cy="111" r="17" fill="url(#drive-truck-rim)" stroke="#E2E8F0" strokeWidth="2" />
          <path d="M207 96v30m-15-15h30m-26-11 22 22m0-22-22 22" stroke="#22D3EE" strokeWidth="3" />
          <circle cx="207" cy="111" r="5" fill="#0F172A" />
        </g>

        <g className="drive-nitro-flame" aria-hidden="true">
          <path d="M29 66C10 55-4 58-23 48c9 17 10 21-7 34 19-4 35 4 59-4Z" fill="#F97316" />
          <path d="M27 69C11 63 2 65-10 59c7 11 8 14-4 21 13-2 23 2 37-3Z" fill="#FDE047" />
        </g>

        <path d="m45 82 22-17m24 17 21-17m56 16 19-15m17 16-18-15" fill="none" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
        <path d="M39 78h201v12H39z" fill="#1E293B" stroke="#67E8F9" strokeWidth="2" />
        <path d="M52 91h168" stroke="#0F172A" strokeWidth="5" />

        <path
          d="M22 88V69c0-7 5-12 13-14l47-8 20-25c4-5 9-7 16-7h41c10 0 18 5 24 13l17 22 29 8c9 3 15 10 17 19l2 11h-11c-4-16-15-27-30-27s-27 11-30 27h-73c-4-16-15-27-30-27S48 72 45 88H22Z"
          fill="url(#drive-car-paint)"
          stroke="#BAF7FF"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="m97 46 18-22c2-3 5-4 9-4h34c7 0 12 3 16 9l12 17H97Z" fill="url(#drive-car-window)" stroke="#A5F3FC" strokeOpacity=".85" strokeWidth="2" />
        <path d="M130 21v26m33-25 16 25" stroke="#67E8F9" strokeOpacity=".62" strokeWidth="2" />
        <g className="drive-car-wipers drive-car-wiper-one" aria-hidden="true">
          <path d="m119 45 16-18" />
        </g>
        <g className="drive-car-wipers drive-car-wiper-two" aria-hidden="true">
          <path d="m145 45 17-17" />
        </g>

        <path d="M91 52h122m-68-4v34m-37-15h18m39 0h20" stroke="#0F172A" strokeOpacity=".48" strokeWidth="2" />
        <path d="M157 61h20" stroke="#ECFEFF" strokeLinecap="round" strokeWidth="3" />
        <path d="M26 69h18l-3 8H25z" fill="#FB7185" />
        <path d="M250 61h12c4 0 7 3 7 7v8h-18l-5-8z" fill="#ECFEFF" />
        <rect x="249" y="82" width="20" height="7" rx="2" fill="#CBD5E1" />
        <rect x="16" y="84" width="17" height="7" fill="#64748B" />
        <path d="M111 12h74m-66-5v10m57-10v10" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
        <path d="M117 9h61" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
        <path d="M242 88v-7m-6 7v-7m-6 7v-7" stroke="#0F172A" strokeOpacity=".55" strokeWidth="2" />

        <path className="drive-headlight-beam" d="m260 61 112-24v52l-112-15V61Z" fill="#BAF7FF" />
      </svg>
      <span className="drive-car-glow" aria-hidden="true" />
      {splashKey > 0 && (
        <span key={splashKey} className="drive-wheel-splash" aria-hidden="true" />
      )}
    </div>
  );
});

export default Car;
