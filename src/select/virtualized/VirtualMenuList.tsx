import React from "react";
import { FixedSizeList, FixedSizeListProps } from "react-window";
import { StickyHeadingContext } from "../contexts";
import { FixedSizedListWithStyles } from "../styles";
import OptionWrapper from "./OptionWrapper";

export interface StickyHeadingsProps {
  elements: React.ReactNode[];
  indices: number[];
}

export interface VirtualMenuListProps {
  scrollOffset: number;
  stickyHeadings: StickyHeadingsProps;
}

const VirtualMenuList = React.forwardRef<
  FixedSizeList<unknown>,
  FixedSizeListProps & VirtualMenuListProps
>((props, ref) => {
  const { children, scrollOffset, stickyHeadings, ...rest } = props;

  return (
    <StickyHeadingContext.Provider
      value={{
        RenderComponent: children,
        scrollOffset,
        stickyHeadings,
      }}
    >
      <FixedSizedListWithStyles ref={ref} {...rest}>
        {({ index, style }) => {
          return (
            <OptionWrapper
              data={{
                headingIndices: stickyHeadings.indices,
                RenderComponent: children,
              }}
              index={index}
              style={style}
            />
          );
        }}
      </FixedSizedListWithStyles>
    </StickyHeadingContext.Provider>
  );
});

export default VirtualMenuList;
