import React from "react";
import { components, GroupBase, MenuProps, OnChangeValue } from "react-select";
import { SelectContext } from "../contexts";
import {
  areOptionsGrouped,
  filterSelectableOptions,
  reduceOptionGroups,
} from "../utils";

export function Menu<
  Option,
  IsMulti extends boolean = boolean,
  Group extends GroupBase<Option> = GroupBase<Option>
>(props: MenuProps<Option, IsMulti, Group>) {
  const currentValue = props.getValue();

  const { showSelected, setShowSelected } = React.useContext(SelectContext);

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

    if (selectedOptions.length === 0) return "O";

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
            {showSelected ? "X" : "O"}
            Show selected
          </button>
        </div>
      )}
      {props.children}
    </components.Menu>
  );
}

export default Menu;
