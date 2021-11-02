import React, { useRef, useState } from "react";
import BaseSelect, {
  ActionMeta,
  GroupBase,
  InputActionMeta,
  MultiValue,
  OnChangeValue,
  Props,
} from "react-select";
import { FilterOptionOption } from "react-select/dist/declarations/src/filters";
import { SelectContext } from "./contexts";
import {
  GroupHeading,
  Menu,
  MenuList,
  Option,
  ValueContainer,
} from "./overrides";

function Select<
  Option,
  IsMulti extends boolean = false,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: Props<Option, IsMulti, Group>) {
  const [inputValue, setInputValue] = useState("");
  const [internalValue, setInternalValue] =
    useState<OnChangeValue<Option, IsMulti>>();
  const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);
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

  function handleMenuPlacement() {
    if (menuRef) {
      const bodyHeight = document.documentElement.clientHeight;
      const menuBottom = menuRef.getBoundingClientRect().bottom;
      const windowHeight = window.innerHeight;

      return menuBottom > (windowHeight || bodyHeight) ? "top" : "bottom";
    }

    return "auto";
  }

  return (
    <SelectContext.Provider
      value={{ setMenuRef, showSelected, setShowSelected }}
    >
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
        menuPlacement={handleMenuPlacement()}
        menuPortalTarget={document.body}
        menuShouldScrollIntoView={false}
        onInputChange={handleInput}
        onChange={handleChange}
        onMenuClose={handleMenuClose}
        styles={{
          ...props.styles,
          menu: (provided, state) => {
            return {
              ...provided,
              top: state.menuPlacement === "top" ? "unset" : "100%",
              bottom: state.menuPlacement === "top" ? "100%" : "unset",
              ...props.styles?.menu,
            };
          },
        }}
      />
    </SelectContext.Provider>
  );
}

export default Select;
