import React, {
  Children,
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
import { FixedSizeList } from "react-window";
import { SelectContext } from "./contexts";
import { OPTION_HEIGHT } from "./Select";
import {
  areOptionsGrouped,
  filterSelectableOptions,
  reduceOptionGroups,
} from "./selectUtils";
import { OptionCheckbox, StyledGroupHeading } from "./styles";
import {
  StickyHeadingsList,
  VirtualInnerElement,
  VirtualRow,
} from "./VirtualComponents";

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
