import React from "react";
import { components, GroupBase, ValueContainerProps } from "react-select";

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

export default ValueContainer;
