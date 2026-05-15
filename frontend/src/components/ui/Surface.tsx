import React from 'react';

interface SurfaceProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: React.ElementType;
}

const paddingMap = {
  none: '',
  sm:   'p-4',
  md:   'p-5',
  lg:   'p-6',
};

export default function Surface({
  children,
  className,
  padding = 'md',
  as: Tag = 'div',
}: SurfaceProps) {
  return (
    <Tag
      className={`bg-(--bg-card) rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.35)] ${paddingMap[padding]} ${className ?? ''}`}
    >
      {children}
    </Tag>
  );
}
