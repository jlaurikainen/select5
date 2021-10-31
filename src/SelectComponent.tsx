import React, {
  Children,
  ComponentType,
  createContext,
  CSSProperties,
  FC,
  forwardRef,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  components,
  GroupBase,
  GroupHeadingProps,
  MenuListProps,
  MenuProps,
  OnChangeValue,
  OptionProps,
  ValueContainerProps,
} from "react-select";
import {
  FixedSizeList,
  FixedSizeListProps,
  ListChildComponentProps,
} from "react-window";
import styled from "styled-components";
import { OPTION_HEIGHT, SelectContext } from "./Select";
import {
  areOptionsGrouped,
  filterSelectableOptions,
  reduceOptionGroups,
} from "./selectUtils";

export function Option<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: OptionProps<Option, IsMulti, Group>) {
  const selectedOptions = props.getValue();

  if (props.isMulti) {
    return (
      <components.Option {...props}>
        <OptionCheckbox
          aria-checked={props.isSelected}
          aria-label={props.label}
          checked={props.isSelected}
          disabled={props.isDisabled}
          onChange={() => {
            if (props.isSelected) {
              props.setValue(
                selectedOptions.filter(
                  (option) => option !== props.data
                ) as unknown as OnChangeValue<Option, IsMulti>,
                "deselect-option",
                props.data
              );
            }

            props.setValue(
              [...selectedOptions, props.data] as unknown as OnChangeValue<
                Option,
                IsMulti
              >,
              "deselect-option",
              props.data
            );
          }}
          type="checkbox"
        />
        {props.label}
      </components.Option>
    );
  }

  return (
    <components.Option {...props}>
      {props.isSelected && "V "}
      {props.children}
    </components.Option>
  );
}

export function Menu<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: MenuProps<Option, IsMulti, Group>) {
  const currentValue = props.getValue();

  const { showSelected, setShowSelected } = useContext(SelectContext);

  const allBaseOptions = areOptionsGrouped(props.options)
    ? reduceOptionGroups(props.options as Group[])
    : (props.options as Option[]);

  const selectableOptions = filterSelectableOptions(
    allBaseOptions,
    props.selectProps.getOptionLabel,
    props.selectProps.inputValue
  );

  const selectedOptions = allBaseOptions.filter((option) =>
    currentValue.includes(option)
  );

  const allOptionsSelected = selectableOptions.every((option) =>
    currentValue.includes(option)
  );

  function selectAllHandler() {
    if (allOptionsSelected) {
      props.clearValue();
      return;
    }

    props.setValue(
      selectableOptions as unknown as OnChangeValue<Option, IsMulti>,
      "select-option",
      selectableOptions[0]
    );
  }

  function selectAllCheckboxState() {
    if (allOptionsSelected) return "X";

    if (selectedOptions.length === 0) return "0";

    return "-";
  }

  function showSelectedHandler() {
    setShowSelected(!showSelected);
  }

  return (
    <components.Menu {...props}>
      {props.isMulti && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button disabled={showSelected} onClick={selectAllHandler}>
            {selectAllCheckboxState()}
            Select all
          </button>
          <button onClick={showSelectedHandler}>
            {showSelected ? "0" : "X"}
            Show selected
          </button>
        </div>
      )}
      {props.children}
    </components.Menu>
  );
}

interface ListItemWrapperProps {
  data: {
    RenderComponent: ComponentType<ListChildComponentProps>;
    headingIndices: number[];
  };
  index: number;
  style: CSSProperties;
}

function ListItemWrapper({ data, index, style }: ListItemWrapperProps) {
  const { RenderComponent, headingIndices } = data;

  if (headingIndices && headingIndices.includes(index)) {
    return null;
  }

  return <RenderComponent index={index} data={{}} style={style} />;
}

interface VirtualRowProps {
  children: ReactNode;
  style: CSSProperties;
}

function VirtualRow({ children, style }: VirtualRowProps) {
  return <div style={style}>{children}</div>;
}

interface StickyHeadingContextProps {
  RenderComponent: ComponentType<ListChildComponentProps>;
  stickyHeadings: {
    indices: number[];
    elements: ReactNode[];
  };
  scrollOffset: number;
}

const StickyHeadingContext = createContext<StickyHeadingContextProps>(
  {} as StickyHeadingContextProps
);

interface StickyHeadingsListProps {
  stickyHeadings: {
    indices: number[];
    elements: ReactNode[];
  };
  scrollOffset: number;
}

const StickyHeadingsList = forwardRef<
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

const VirtualInnerElement = forwardRef<HTMLDivElement, FC>(
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
      indices: number[];
      elements: ReactNode[];
    } = {
      indices: [],
      elements: [],
    };

    childArray.forEach((child) => {
      if ((child as JSX.Element).type === GroupHeading) {
        headings.indices.push(childArray.indexOf(child));
        headings.elements.push(child);
      }
    });

    return headings;
  }, [childArray]);

  const focusedOption = Math.max(
    childArray.findIndex((child) => (child as JSX.Element).props.isFocused),
    0
  );

  useEffect(() => {
    menuListRef?.scrollToItem(focusedOption);
  }, [focusedOption, menuListRef]);

  return (
    <StickyHeadingsList
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
          <VirtualRow key={index} style={style}>
            {childArray[index]}
          </VirtualRow>
        );
      }}
    </StickyHeadingsList>
  );
}

export function GroupHeading<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: GroupHeadingProps<Option, IsMulti | true, Group>) {
  const {
    data,
    selectProps: { getOptionLabel, inputValue, isMulti, onChange, value },
  } = props;

  if (isMulti) {
    const currentValue = value !== null ? (value as Option[]) : [];

    const { showSelected } = useContext(SelectContext);

    const selectableGroupOptions = filterSelectableOptions(
      data.options,
      getOptionLabel,
      inputValue
    );

    const selectedGroupOptions = data.options.filter((option) =>
      currentValue.includes(option)
    );

    const allGroupOptionsSelected = selectableGroupOptions.every((option) =>
      currentValue.includes(option)
    );

    function groupCheckboxState() {
      if (selectedGroupOptions.length === 0) return "O";

      if (allGroupOptionsSelected) return "X";

      return "-";
    }

    return (
      <StyledGroupHeading>
        <button
          disabled={showSelected}
          onClick={() => {
            if (!allGroupOptionsSelected) {
              onChange([...currentValue, ...selectableGroupOptions], {
                action: "select-option",
                name: "undefined",
                option: undefined,
              });
              return;
            }

            onChange(
              currentValue.filter((option) => !data.options.includes(option)),
              { action: "deselect-option", name: undefined, option: undefined }
            );
          }}
        >
          <span>{groupCheckboxState()}</span>
          {data.label}
        </button>
      </StyledGroupHeading>
    );
  }

  return <StyledGroupHeading>{data.label}</StyledGroupHeading>;
}

export function ValueContainer<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: ValueContainerProps<Option, IsMulti, Group>) {
  const selectedCount = props.getValue().length;

  return (
    <components.ValueContainer {...props}>
      {selectedCount > 0 && props.isMulti && `${selectedCount} selected`}
      {props.children}
    </components.ValueContainer>
  );
}

const OptionCheckbox = styled.input`
  padding: 0;
  margin: 0;
  margin-right: 8px;
`;

const StyledGroupHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  &::after {
    content: "";
    height: 0;
    width: 100%;
    border-bottom: 1px solid gray;
  }
`;

const FixedSizedListWithStyles = styled(FixedSizeList)`
  margin: 8px 0;
`;
