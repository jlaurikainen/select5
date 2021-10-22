import React, {
  Children,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import BaseSelect, {
  components,
  GroupBase,
  MenuListProps,
  MenuProps,
  OnChangeValue,
  OptionProps,
  Options,
  Props,
  Theme,
  ValueContainerProps,
} from "react-select";
import { FixedSizeList } from "react-window";
import styled from "styled-components";

const OPTION_HEIGHT = 32;

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
  const [allSelected, setAllSelected] = useState(false);
  const { isMulti, options } = props;

  const areOptionsGrouped =
    options !== undefined && options.length > 0 && "options" in options[0];

  return (
    <components.Menu {...props}>
      {isMulti && (
        <div>
          <button onClick={() => setAllSelected(!allSelected)}>
            {allSelected ? "X" : "0"}
            Select all
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
  const { children, getValue, isMulti, maxHeight, options, setValue } = props;

  if (!children) return null;

  const [menuListRef, setMenuListRef] =
    useState<FixedSizeList<HTMLElement> | null>(null);

  const groupSelectionState = useCallback(
    (currentValue: Options<Option>, children: JSX.Element[]) => {
      const optionsInGroup: Options<Option> = children.map(
        (optionElement) => optionElement.props.data
      );

      const selectableGroupOptions: Options<Option> = children
        .filter(
          (optionElement) =>
            !optionElement.props.data.isDisabled &&
            !currentValue.includes(optionElement.props.data)
        )
        .map((optionElement) => optionElement.props.data);

      const selectedGroupOptions: Options<Option> = children
        .filter((optionElement) =>
          currentValue.includes(optionElement.props.data)
        )
        .map((optionElement) => optionElement.props.data);

      const allGroupOptionsSelected = selectableGroupOptions.every((option) => {
        return currentValue.includes(option);
      });

      return {
        optionsInGroup,
        selectableGroupOptions,
        selectedGroupOptions,
        allGroupOptionsSelected,
      };
    },
    [children]
  );

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

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  const { components, isMulti, styles, theme: themeProps } = props;

  const [inputValue, setInputValue] = useState("");

  return (
    <BaseSelect
      {...props}
      components={{
        Option: isMulti ? MultiOption : SingleOption,
        Menu,
        MenuList,
        MultiValue: () => null,
        MultiValueContainer: () => null,
        ValueContainer,
        ...components,
      }}
      placeholder="plgjyhijak"
      hideSelectedOptions={false}
      inputValue={inputValue}
      onInputChange={(value, action) => {
        if (action.action === "input-change") {
          setInputValue(value);
          return;
        }
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
