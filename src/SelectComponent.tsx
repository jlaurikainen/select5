import {
  useCallback,
  useContext,
  useState,
  useMemo,
  Children,
  useEffect,
} from "react";
import {
  GroupBase,
  OptionProps,
  components,
  MenuProps,
  MenuListProps,
  Options,
  ValueContainerProps,
  OnChangeValue,
} from "react-select";
import { FixedSizeList } from "react-window";
import styled from "styled-components";
import { OPTION_HEIGHT, SelectContext } from "./Select";
import { reduceOptionGroups, filterSelectableOptions } from "./selectUtils";

export const SingleOption = <
  Option,
  IsMulti extends boolean = false,
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
  IsMulti extends boolean = true,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti, Group>
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
              selectedOptions.filter((option) => option !== data) as any,
              "deselect-option",
              data
            );
          }

          setValue([...selectedOptions, data] as any, "deselect-option", data);
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
  const optionsAreGrouped =
    options !== undefined && options.length > 0 && "options" in options[0];

  const selectionState = useCallback(() => {
    const baseOptions = optionsAreGrouped
      ? reduceOptionGroups(options as Group[])
      : (options as Option[]);

    const selectableOptions = filterSelectableOptions(
      baseOptions,
      getOptionLabel,
      inputValue
    );

    const selectedOptions = baseOptions.filter((option) =>
      currentValue.includes(option)
    );

    const allOptionsSelected = selectableOptions.every((option) =>
      currentValue.includes(option)
    );

    return {
      baseOptions,
      selectableOptions,
      selectedOptions,
      allOptionsSelected,
    };
  }, [currentValue, options]);

  const { selectableOptions, selectedOptions, allOptionsSelected } =
    selectionState();

  const selectAllHandler = () => {
    if (allOptionsSelected) {
      clearValue();
      return;
    }

    setValue(
      selectableOptions as any,
      "select-option",
      selectableOptions as any
    );
  };

  const { showSelected, setShowSelected } = useContext(SelectContext);

  const showSelectedHandler = () => {
    setShowSelected(!showSelected);
  };

  const selectAllCheckboxState = () => {
    if (allOptionsSelected) return "X";

    if (selectedOptions.length === 0) return "0";

    return "-";
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
  const {
    children,
    getValue,
    isMulti,
    maxHeight,
    options,
    selectProps: { getOptionLabel, inputValue },
    setValue,
  } = props;

  if (!children) return null;

  const [menuListRef, setMenuListRef] =
    useState<FixedSizeList<HTMLElement> | null>(null);

  const groupSelectionState = useCallback(
    (currentValue: Options<Option>, optionsInGroup: readonly Option[]) => {
      const selectableGroupOptions = filterSelectableOptions(
        optionsInGroup,
        getOptionLabel,
        inputValue
      );

      const selectedGroupOptions = optionsInGroup.filter((option) =>
        currentValue.includes(option)
      );

      const allGroupOptionsSelected = selectableGroupOptions.every((option) =>
        currentValue.includes(option)
      );

      return {
        optionsInGroup,
        selectableGroupOptions,
        selectedGroupOptions,
        allGroupOptionsSelected,
      };
    },
    [children]
  );

  const { showSelected } = useContext(SelectContext);

  const childArray = useMemo(() => {
    const optionsAreGrouped =
      options !== undefined && options.length > 0 && "options" in options[0];

    const groupCheckboxState = (
      selectedGroupOptions: Options<Option>,
      allGroupOptionsSelected: boolean
    ) => {
      if (selectedGroupOptions.length === 0) return "O";

      if (allGroupOptionsSelected) return "X";

      return "-";
    };

    if (optionsAreGrouped) {
      if (!Array.isArray(children)) {
        return [children];
      }

      return Children.map(children as JSX.Element[], (optionGroup, index) => {
        if (isMulti) {
          const currentlySelectedOptions = getValue();

          const {
            selectableGroupOptions,
            selectedGroupOptions,
            allGroupOptionsSelected,
            optionsInGroup,
          } = groupSelectionState(
            currentlySelectedOptions,
            (options as Group[])[index].options
          );

          return [
            <MultiGroupHeading
              disabled={showSelected}
              onClick={() => {
                if (!allGroupOptionsSelected) {
                  setValue(
                    [
                      ...currentlySelectedOptions,
                      ...selectableGroupOptions,
                    ] as any,
                    "select-option",
                    selectableGroupOptions as any
                  );
                  return;
                }

                setValue(
                  currentlySelectedOptions.filter(
                    (option) => !optionsInGroup.includes(option)
                  ) as any,
                  "deselect-option",
                  selectableGroupOptions as any
                );
              }}
            >
              <span>
                {groupCheckboxState(
                  selectedGroupOptions,
                  allGroupOptionsSelected
                )}
              </span>
              {(options[index] as Group).label}
            </MultiGroupHeading>,
            ...optionGroup.props.children,
          ];
        }

        return [
          <SingleGroupHeading>
            {(options[index] as Group).label}
            <hr />
          </SingleGroupHeading>,
          ...optionGroup.props.children,
        ];
      });
    }

    return Children.toArray(children);
  }, [options, children]);

  const focusedOption = Math.max(
    Children.toArray(children).findIndex(
      (child) => (child as JSX.Element).props.isFocused
    ),
    0
  );

  useEffect(() => {
    menuListRef?.scrollToItem(focusedOption);
  }, [focusedOption]);

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
