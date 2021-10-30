import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
} from "react";
import BaseSelect, {
  ActionMeta,
  GroupBase,
  InputActionMeta,
  MultiValue,
  OnChangeValue,
  Props,
  Theme,
} from "react-select";
import { FilterOptionOption } from "react-select/dist/declarations/src/filters";
import {
  GroupHeading,
  Menu,
  MenuList,
  Option,
  ValueContainer,
} from "./SelectComponent";

export const OPTION_HEIGHT = 32;

interface SelectContextState {
  showSelected: boolean;
  setShowSelected: Dispatch<SetStateAction<boolean>>;
}

export const SelectContext = createContext<SelectContextState>(
  {} as SelectContextState
);

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  const [inputValue, setInputValue] = useState("");
  const [internalValue, setInternalValue] =
    useState<OnChangeValue<Option, IsMulti>>();
  const [showSelected, setShowSelected] = useState(false);

  function handleChange(
    newValue: OnChangeValue<Option, IsMulti>,
    actionMeta: ActionMeta<Option>
  ) {
    setInternalValue(newValue);
    props.onChange?.(newValue, actionMeta);
  }

  function handleFilter(option: FilterOptionOption<Option>, input: string) {
    if (props.isMulti && showSelected) {
      return (internalValue as MultiValue<Option>)?.includes(option.data);
    }
    return option.label.toLowerCase().includes(input.toLowerCase());
  }

  function handleInput(value: string, action: InputActionMeta) {
    if (action.action === "input-change") {
      setInputValue(value);
      return;
    }
  }

  function handleMenuClose() {
    setShowSelected(false);
    props.onMenuClose?.();
  }

  return (
    <SelectContext.Provider value={{ showSelected, setShowSelected }}>
      <BaseSelect
        {...props}
        backspaceRemovesValue={false}
        closeMenuOnSelect={props.closeMenuOnSelect ?? !props.isMulti}
        components={{
          Menu,
          MenuList,
          MultiValue: () => null,
          MultiValueContainer: () => null,
          Option,
          ValueContainer,
          GroupHeading,
          ...props.components,
        }}
        filterOption={handleFilter}
        hideSelectedOptions={props.hideSelectedOptions ?? false}
        inputValue={inputValue}
        onInputChange={handleInput}
        onChange={handleChange}
        onMenuClose={handleMenuClose}
        styles={{
          indicatorsContainer: (provided) => ({
            ...provided,
            height: OPTION_HEIGHT,
          }),
          option: (provided) => ({
            ...provided,
            display: "flex",
            alignItems: "center",
            height: OPTION_HEIGHT,
          }),
          ...props.styles,
        }}
        theme={(theme: Theme) => ({
          ...theme,
          spacing: {
            ...theme.spacing,
            controlHeight: OPTION_HEIGHT,
          },
          ...props.theme,
        })}
      />
    </SelectContext.Provider>
  );
}

export default Select;
