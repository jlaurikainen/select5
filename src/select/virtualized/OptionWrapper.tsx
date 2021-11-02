import React, { ComponentType } from "react";
import { ListChildComponentProps } from "react-window";

export interface OptionWrapperProps {
  data: {
    headingIndices: number[];
    RenderComponent: ComponentType<ListChildComponentProps>;
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
