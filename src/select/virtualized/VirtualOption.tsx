import React from "react";

export interface VirtualOptionProps {
  children: React.ReactNode;
  style: React.CSSProperties;
}

export function VirtualOption({ children, style }: VirtualOptionProps) {
  return <div style={style}>{children}</div>;
}

export default VirtualOption;
