import React from 'react';

const OverlayRenderer = ({ overlays }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {overlays.map((overlay) => (
        <div
          key={overlay.id}
          className="absolute"
          style={{
            left: `${overlay.position.x}%`,
            top: `${overlay.position.y}%`,
            width: `${overlay.size.width}px`,
            height: `${overlay.size.height}px`,
            transform: `rotate(${overlay.rotation || 0}deg)`,
            opacity: overlay.opacity || 1,
            zIndex: overlay.zIndex || 1,
          }}
        >
          {overlay.type === 'text' && (
            <div
              className="text-white font-bold"
              style={{
                fontSize: `${overlay.fontSize || 16}px`,
                color: overlay.color || '#ffffff',
                fontFamily: overlay.fontFamily || 'Arial',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              }}
            >
              {overlay.content}
            </div>
          )}
          {overlay.type === 'image' && (
            <img
              src={overlay.src}
              alt={overlay.alt || 'Overlay'}
              className="w-full h-full object-contain"
            />
          )}
          {overlay.type === 'logo' && (
            <div className="w-full h-full flex items-center justify-center bg-blue-600 text-white font-bold rounded">
              {overlay.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default OverlayRenderer;