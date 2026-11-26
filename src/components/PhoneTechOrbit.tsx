export default function PhoneTechOrbit() {
  return (
    <div className="phone-tech-orbit" aria-hidden="true">
      <span className="phone-tech-orbit-ring" />
      <div className="phone-tech-orbit-track">
        <span className="phone-tech-icon phone-tech-react">
          <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5">
            <ellipse cx="16" cy="16" rx="13" ry="5.2" />
            <ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(60 16 16)" />
            <ellipse cx="16" cy="16" rx="13" ry="5.2" transform="rotate(120 16 16)" />
            <circle cx="16" cy="16" r="2" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <span className="phone-tech-icon phone-tech-typescript"><b>TS</b></span>
        <span className="phone-tech-icon phone-tech-expo"><b>EX</b></span>
        <span className="phone-tech-icon phone-tech-firebase">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M5.2 19.8 7.7 3.9c.1-.6.9-.8 1.2-.3l2.4 4.5-6.1 11.7Zm.9 1.1 11.1-1.6c.5-.1.7-.7.3-1.1L11.8 8.1 6.1 19.8c-.2.5.1 1.2.7 1.1Zm12.2-2.8 2.4-14.4c.1-.6-.7-.9-1-.4l-3.1 4.8 1.7 10Z" />
          </svg>
        </span>
        <span className="phone-tech-icon phone-tech-redux"><b>RT</b></span>
      </div>
    </div>
  );
}
