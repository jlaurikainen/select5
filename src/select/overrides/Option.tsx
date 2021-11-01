import React from "react";
import {
  components,
  GroupBase,
  OnChangeValue,
  OptionProps,
} from "react-select";
import { OptionCheckbox } from "../styles";

function Option<
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

export default Option;
