import React from "react";
import { RenderComponentType } from "../types";

export interface OptionWrapperProps {
  data: {
    headingIndices: number[];
    RenderComponent: RenderComponentType;
  };
  index: number;
  style: React.CSSProperties;
}

function OptionWrapper({ data, index, style }: OptionWrapperProps) {
  const { headingIndices, RenderComponent } = data;

  if (headingIndices && headingIndices.includes(index)) {
    return null;
  }

  return <RenderComponent index={index} data={data} style={style} />;
}

export default OptionWrapper;
