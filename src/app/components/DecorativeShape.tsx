'use client';

interface DecorativeShapeProps {
  iconPath: string;
  className: string;
}

export default function DecorativeShape({ iconPath, className }: DecorativeShapeProps) {
  return (
    <div
      className={`absolute bg-gray-300 ${className}`}
      style={{
        maskImage: `url(${iconPath})`,
        WebkitMaskImage: `url(${iconPath})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  );
}