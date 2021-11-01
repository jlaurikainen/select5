import React from "react";
import { GroupBase, GroupHeadingProps } from "react-select";
import { SelectContext } from "../contexts";
import { StyledGroupHeading } from "../styles";
import { filterSelectableOptions } from "../utils";

function GroupHeading<
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

    const { showSelected } = React.useContext(SelectContext);

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
                name: undefined,
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

export default GroupHeading;
