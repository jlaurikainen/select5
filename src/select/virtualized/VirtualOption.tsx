import React from "react";

export interface VirtualRowProps {
  children: React.ReactNode;
  style: React.CSSProperties;
}

export function VirtualOption({ children, style }: VirtualRowProps) {
  return <div style={style}>{children}</div>;
}

export default VirtualOption;
