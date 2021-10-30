import React, {
  Children,
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
import styled from "styled-components";
import { OPTION_HEIGHT, SelectContext } from "./Select";
import { filterSelectableOptions, reduceOptionGroups } from "./selectUtils";

export const SingleOption = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti, Group>
) => {
  const { children, isSelected } = props;

  return (
    <components.Option {...props}>
      {isSelected && "V "}
      {children}
    </components.Option>
  );
};

export const MultiOption = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti | true, Group>
) => {
  const { data, getValue, isDisabled, isSelected, label, setValue } = props;

  const selectedOptions = getValue();

  return (
    <components.Option {...props}>
      <OptionCheckbox
        aria-checked={isSelected}
        aria-label={label}
        checked={isSelected}
        disabled={isDisabled}
        onChange={() => {
          if (isSelected) {
            setValue(
              selectedOptions.filter((option) => option !== data),
              "deselect-option",
              data
            );
          }

          setValue([...selectedOptions, data], "deselect-option", data);
        }}
        type="checkbox"
      />
      {label}
    </components.Option>
  );
};

export const Menu = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: MenuProps<Option, IsMulti, Group>
) => {
  const {
    clearValue,
    getValue,
    isMulti,
    options,
    selectProps: { inputValue, getOptionLabel },
    setValue,
  } = props;

  const currentValue = getValue();
  const { showSelected, setShowSelected } = useContext(SelectContext);

  const areOptionsGrouped = useMemo(
    () => options?.find((option) => "options" in option) !== undefined,
    [options]
  );

  const allBaseOptions = areOptionsGrouped
    ? reduceOptionGroups(options as Group[])
    : (options as Option[]);

  const selectableOptions = filterSelectableOptions(
    allBaseOptions,
    getOptionLabel,
    inputValue
  );

  const selectedOptions = allBaseOptions.filter((option) =>
    currentValue.includes(option)
  );

  const allOptionsSelected = selectableOptions.every((option) =>
    currentValue.includes(option)
  );

  const selectAllHandler = () => {
    if (allOptionsSelected) {
      clearValue();
      return;
    }

    /** This is the only fucky bit, since we can't make a menu to be
     * single/multi option selection specific with the default typings. */
    setValue(
      selectableOptions as unknown as OnChangeValue<Option, IsMulti>,
      "select-option",
      selectableOptions[0]
    );
  };

  const selectAllCheckboxState = () => {
    if (allOptionsSelected) return "X";

    if (selectedOptions.length === 0) return "0";

    return "-";
  };

  const showSelectedHandler = () => {
    setShowSelected(!showSelected);
  };

  return (
    <components.Menu {...props}>
      {isMulti && (
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
};

export const MenuList = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: MenuListProps<Option, IsMulti, Group>
) => {
  const { children, maxHeight, options } = props;

  const [menuListRef, setMenuListRef] =
    useState<FixedSizeList<HTMLElement> | null>(null);

  const optionsAreGrouped = useMemo(
    () => options?.find((option) => "options" in option) !== undefined,
    [options]
  );

  if (!children) return null;

  const childArray = useMemo(() => {
    if (optionsAreGrouped) {
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
  }, [options, children]);

  const focusedOption = Math.max(
    childArray.findIndex((child) => (child as JSX.Element).props.isFocused),
    0
  );

  useEffect(() => {
    menuListRef?.scrollToItem(focusedOption);
  }, [focusedOption, menuListRef]);

  return (
    <FixedSizedListWithStyles
      height={
        childArray.length * OPTION_HEIGHT > maxHeight
          ? maxHeight - (maxHeight % OPTION_HEIGHT)
          : childArray.length * OPTION_HEIGHT
      }
      itemCount={childArray.length}
      itemSize={OPTION_HEIGHT}
      ref={(refInstance) =>
        setMenuListRef(refInstance as FixedSizeList<HTMLElement>)
      }
      width="100%"
    >
      {({ index, style }) => (
        <div style={style} key={index}>
          {childArray[index]}
        </div>
      )}
    </FixedSizedListWithStyles>
  );
};

export const GroupHeading = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: GroupHeadingProps<Option, IsMulti | true, Group>
) => {
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

    const groupCheckboxState = () => {
      if (selectedGroupOptions.length === 0) return "O";

      if (allGroupOptionsSelected) return "X";

      return "-";
    };

    return (
      <MultiGroupHeading
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
      </MultiGroupHeading>
    );
  }

  return (
    <SingleGroupHeading>
      {data.label}
      <hr />
    </SingleGroupHeading>
  );
};

export const ValueContainer = <
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: ValueContainerProps<Option, IsMulti, Group>
) => {
  const selectedCount = props.getValue().length;

  return (
    <components.ValueContainer {...props}>
      {selectedCount > 0 && props.isMulti && `${selectedCount} selected`}
      {props.children}
    </components.ValueContainer>
  );
};

const OptionCheckbox = styled.input`
  padding: 0;
  margin: 0;
  margin-right: 8px;
`;

const SingleGroupHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  & hr {
    height: 0;
    width: 100%;
    border-width: 0 0 1px 0;
    border-style: solid;
    border-color: gray;
  }
`;

const MultiGroupHeading = styled.button``;

const FixedSizedListWithStyles = styled(FixedSizeList)`
  margin: 8px 0;
`;
