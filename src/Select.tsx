import React, {
  Children,
  createContext,
  Dispatch,
  FC,
  forwardRef,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import BaseSelect, {
  components,
  createFilter,
  GroupBase,
  MenuListProps,
  MenuProps,
  OptionProps,
  Options,
  Props,
  Theme,
  ValueContainerProps,
} from "react-select";
import { FixedSizeList } from "react-window";
import styled from "styled-components";

const OPTION_HEIGHT = 32;

function reduceOptionGroups<Option>(options: GroupBase<Option>[]) {
  return options.reduce(
    (allOptions: readonly Option[], currentGroup) => [
      ...allOptions,
      ...currentGroup.options,
    ],
    []
  );
}

function filterSelectableOptions<Option>(
  options: readonly Option[],
  getOptionLabel: (option: Option) => string,
  inputValue: string
) {
  return options.filter((option: Option & { isDisabled?: boolean }) => {
    return (
      !option.isDisabled &&
      getOptionLabel(option).toLowerCase().includes(inputValue.toLowerCase())
    );
  });
}

const SingleOption = <
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(
  props: OptionProps<Option, IsMulti, Group>
) => {
  const { children, isSelected } = props;

  return (
    <components.Option {...props}>
      {isSelected && <OptionIcon />}
      {children}
    </components.Option>
  );
};

const MultiOption = <
  Option,
  IsMulti extends boolean = true,
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

const Menu = <
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
    if (optionsAreGrouped) {
      const optionsInGroups = reduceOptionGroups(options as Group[]);

      const selectableOptions = filterSelectableOptions(
        optionsInGroups,
        getOptionLabel,
        inputValue
      );

      const selectedOptions = optionsInGroups.filter((option) =>
        currentValue.includes(option)
      );

      const allOptionsSelected = selectableOptions.every((option) =>
        currentValue.includes(option)
      );

      return {
        options: optionsInGroups,
        selectableOptions,
        selectedOptions,
        allOptionsSelected,
      };
    }

    const selectableOptions = filterSelectableOptions(
      options as Option[],
      getOptionLabel,
      inputValue
    );

    const selectedOptions = (options as Option[]).filter((option) =>
      currentValue.includes(option)
    );

    const allOptionsSelected = selectableOptions.every((option) =>
      currentValue.includes(option)
    );

    return {
      options,
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

const MenuList = <
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
    (currentValue: Options<Option>, children: JSX.Element | JSX.Element[]) => {
      if (!Array.isArray(children)) {
        return {
          optionsInGroup: [],
          selectableGroupOptions: [],
          selectedGroupOptions: [],
          allGroupOptionsSelected: true,
        };
      }

      const optionsInGroup: Option[] = (children as JSX.Element[]).map(
        (optionElement) => optionElement.props.data
      );

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
            optionGroup.props.children
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

const ValueContainer = <
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

interface SelectContextState {
  showSelected: boolean;
  setShowSelected: Dispatch<SetStateAction<boolean>>;
}

const SelectContext = createContext<SelectContextState>(
  {} as SelectContextState
);

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  const { components, isMulti, styles, theme: themeProps } = props;

  const [inputValue, setInputValue] = useState("");
  const [showSelected, setShowSelected] = useState(false);

  const [internalValue, setInternalValue] = useState<Option | Option[]>();

  return (
    <SelectContext.Provider value={{ showSelected, setShowSelected }}>
      <BaseSelect
        {...props}
        backspaceRemovesValue={false}
        components={{
          Option: isMulti ? MultiOption : SingleOption,
          Menu,
          MenuList,
          MultiValue: () => null,
          MultiValueContainer: () => null,
          ValueContainer,
          ...components,
        }}
        filterOption={(option, input) => {
          if (showSelected && isMulti) {
            createFilter();

            return (internalValue as readonly Option[])?.includes(option.data);
          }

          return option.label.toLowerCase().includes(input.toLowerCase());
        }}
        hideSelectedOptions={false}
        inputValue={inputValue}
        onInputChange={(value, action) => {
          if (action.action === "input-change") {
            setInputValue(value);
            return;
          }
        }}
        onChange={(e) => {
          setInternalValue(e as Option | Option[]);
          props.onChange?.(e, { action: "select-option", option: e as any });
        }}
        onMenuClose={() => {
          setShowSelected(false);
          props.onMenuClose?.();
        }}
        styles={{
          indicatorsContainer: (provided) => ({
            ...provided,
            height: 32,
          }),
          container: (provided) => ({
            ...provided,
            fontFamily: "sans-serif",
            fontSize: 16,
          }),
          control: (provided, state) => ({
            ...provided,
            borderColor: state.isFocused ? "blue" : "gray",
            boxShadow: state.isFocused ? "0 2px 4px rgba(0,0,255,0.2)" : "none",
          }),
          menu: (provided) => ({
            ...provided,
            boxShadow: "0 2px 8px 2px rgba(0,0,0,0.2)",
          }),
          option: (provided, state) => ({
            ...provided,
            display: "flex",
            alignItems: "center",
            padding: "0px 16px",
            height: OPTION_HEIGHT,
            backgroundColor: state.isFocused ? "lightblue" : "white",
            color: state.isDisabled ? "#999999" : "#333333",
          }),
          ...styles,
        }}
        menuIsOpen
        theme={(theme: Theme) => ({
          ...theme,
          borderRadius: 4,
          spacing: {
            ...theme.spacing,
            controlHeight: OPTION_HEIGHT,
            menuGutter: 4,
          },
          ...themeProps,
        })}
      />
    </SelectContext.Provider>
  );
}

export default Select;

const OptionIcon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 16px;
  margin-right: 8px;

  ::after {
    content: "";
    position: absolute;
    top: 50%;
    left: 4px;
    height: 6px;
    width: 2px;
    background-color: green;
    transform: rotate(-45deg);
  }

  ::before {
    content: "";
    position: absolute;
    top: 10px;
    right: 6px;
    height: 12px;
    width: 2px;
    background-color: green;
    transform: rotate(30deg);
  }
`;

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
