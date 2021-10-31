import { CSSProperties, FC, forwardRef, useContext } from "react";
import { FixedSizeList, FixedSizeListProps } from "react-window";
import { StickyHeadingContext } from "./contexts";
import { OPTION_HEIGHT } from "./Select";
import { FixedSizedListWithStyles } from "./styles";
import {
  ListItemWrapperProps,
  StickyHeadingsListProps,
  VirtualRowProps,
} from "./types";

export const StickyHeadingsList = forwardRef<
  FixedSizeList<unknown>,
  FixedSizeListProps & StickyHeadingsListProps
>((props, ref) => {
  const { children, scrollOffset, stickyHeadings, ...rest } = props;

  return (
    <StickyHeadingContext.Provider
      value={{
        RenderComponent: children,
        stickyHeadings,
        scrollOffset,
      }}
    >
      <FixedSizedListWithStyles ref={ref} {...rest}>
        {({ index, style }) => {
          return (
            <ListItemWrapper
              data={{
                RenderComponent: children,
                headingIndices: stickyHeadings.indices,
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

export function ListItemWrapper({ data, index, style }: ListItemWrapperProps) {
  const { RenderComponent, headingIndices } = data;

  if (headingIndices && headingIndices.includes(index)) {
    return null;
  }

  return <RenderComponent index={index} data={{}} style={style} />;
}

export function VirtualRow({ children, style }: VirtualRowProps) {
  return <div style={style}>{children}</div>;
}

export const VirtualInnerElement = forwardRef<HTMLDivElement, FC>(
  ({ children, ...rest }, ref) => {
    const {
      stickyHeadings: { indices, elements },
      scrollOffset,
    } = useContext(StickyHeadingContext);

    return (
      <div ref={ref} {...rest}>
        {indices.map((index, idx) => {
          const absoluteOffset = index * OPTION_HEIGHT;
          const offsetFromTop = index * OPTION_HEIGHT - scrollOffset;

          const finalStyles = (): CSSProperties => {
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
            <VirtualRow key={index} style={finalStyles()}>
              {elements[idx]}
            </VirtualRow>
          );
        })}
        {children}
      </div>
    );
  }
);
