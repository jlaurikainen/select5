import React, { Children, useMemo, useState } from "react";
import { GroupBase, MenuListProps } from "react-select";
import { FixedSizeList } from "react-window";
import { OPTION_HEIGHT } from "../Select";
import { areOptionsGrouped } from "../utils";
import {
  VirtualInnerElement,
  VirtualMenuList,
  VirtualOption,
} from "../virtualized";
import GroupHeading from "./GroupHeading";

export function MenuList<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: MenuListProps<Option, IsMulti, Group>) {
  const { children, maxHeight, options } = props;

  const [menuListRef, setMenuListRef] = useState<FixedSizeList<unknown> | null>(
    null
  );
  const [scrollOffset, setScrollOffset] = useState(0);

  if (!children) return null;

  const childArray = useMemo(() => {
    if (areOptionsGrouped(options)) {
      if (!Array.isArray(children)) {
        return [children];
      }

      return Children.map(children as JSX.Element[], (optionGroup) => {
        return [
          <optionGroup.props.Heading
            {...optionGroup.props.headingProps}
            selectProps={optionGroup.props.selectProps}
            theme={optionGroup.props.theme}
            getStyles={optionGroup.props.getStyles}
            cx={optionGroup.props.cx}
          >
            {optionGroup.props.label}
          </optionGroup.props.Heading>,
          ...optionGroup.props.children,
        ];
      });
    }

    return Children.toArray(children);
  }, [children, menuListRef, options]);

  const stickyHeadings = useMemo(() => {
    const headings: {
      elements: React.ReactNode[];
      indices: number[];
    } = {
      elements: [],
      indices: [],
    };

    childArray.forEach((child) => {
      if ((child as JSX.Element).type === GroupHeading) {
        headings.elements.push(child);
        headings.indices.push(childArray.indexOf(child));
      }
    });

    return headings;
  }, [childArray]);

  const focusedOption = Math.max(
    childArray.findIndex((child) => (child as JSX.Element).props.isFocused),
    0
  );

  React.useEffect(() => {
    menuListRef?.scrollToItem(focusedOption);
  }, [focusedOption, menuListRef]);

  return (
    <VirtualMenuList
      height={
        childArray.length * OPTION_HEIGHT > maxHeight
          ? maxHeight - (maxHeight % OPTION_HEIGHT)
          : childArray.length * OPTION_HEIGHT
      }
      innerElementType={VirtualInnerElement}
      itemCount={childArray.length}
      itemSize={OPTION_HEIGHT}
      onScroll={(e) => setScrollOffset(e.scrollOffset)}
      ref={(refInstance) =>
        setMenuListRef(refInstance as FixedSizeList<unknown>)
      }
      scrollOffset={scrollOffset}
      stickyHeadings={stickyHeadings}
      width="100%"
    >
      {({ index, style }) => {
        return (
          <VirtualOption key={index} style={style}>
            {childArray[index]}
          </VirtualOption>
        );
      }}
    </VirtualMenuList>
  );
}

export default MenuList;
