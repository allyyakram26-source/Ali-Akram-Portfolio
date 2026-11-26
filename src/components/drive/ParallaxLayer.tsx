import { forwardRef } from 'react';

type ParallaxLayerProps = {
  layer: 'far' | 'middle' | 'near';
};

const ParallaxLayer = forwardRef<HTMLDivElement, ParallaxLayerProps>(function ParallaxLayer(
  { layer },
  ref
) {
  return (
    <div ref={ref} className={`drive-parallax drive-parallax-${layer}`} aria-hidden="true">
      {layer === 'far' && (
        <div className="drive-cloud-bank">
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
      {layer === 'middle' && <div className="drive-mountains" />}
      {layer === 'near' && <div className="drive-city" />}
    </div>
  );
});

export default ParallaxLayer;
