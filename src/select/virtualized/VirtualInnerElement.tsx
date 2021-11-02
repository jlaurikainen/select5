import React from "react";
import { StickyHeadingContext } from "../contexts";
import { OPTION_HEIGHT } from "../styles";
import VirtualOption from "./VirtualOption";

export const VirtualInnerElement = React.forwardRef<HTMLDivElement, React.FC>(
  ({ children, ...rest }, ref) => {
    const {
      stickyHeadings: { elements, indices },
      scrollOffset,
    } = React.useContext(StickyHeadingContext);

    return (
      <div ref={ref} {...rest}>
        {indices.map((index, idx) => {
          const absoluteOffset = index * OPTION_HEIGHT;
          const offsetFromTop = index * OPTION_HEIGHT - scrollOffset;

          const finalStyles = (): React.CSSProperties => {
            if (offsetFromTop > 0) {
              return {
                position: "absolute",
                top: absoluteOffset,
                left: 0,
                height: OPTION_HEIGHT,
                width: "100%",
                backgroundColor: "white",
                zIndex: 2,
              };
            }

            return {
              position: "sticky",
              top: 0,
              left: 0,
              height: OPTION_HEIGHT,
              width: "100%",
              backgroundColor: "white",
              zIndex: 2,
            };
          };

          return (
            <VirtualOption key={index} style={finalStyles()}>
              {elements[idx]}
            </VirtualOption>
          );
        })}
        {children}
      </div>
    );
  }
);

export default VirtualInnerElement;
