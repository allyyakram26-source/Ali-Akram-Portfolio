import type { DriveWeather } from './weather';

type WeatherEffectsProps = {
  weather: DriveWeather;
};

export default function WeatherEffects({ weather }: WeatherEffectsProps) {
  return (
    <div className="drive-weather-effects" data-weather={weather} aria-hidden="true">
      {weather === 'rain' && <div className="drive-weather-rain" />}
      {weather === 'fog' && <div className="drive-weather-fog" />}
      {weather === 'snow' && (
        <div className="drive-weather-snow">
          {Array.from({ length: 18 }, (_, index) => (
            <i
              key={index}
              style={{
                left: `${(index * 47) % 100}%`,
                animationDelay: `-${(index * 1.7) % 9}s`,
                animationDuration: `${8 + (index % 6)}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
