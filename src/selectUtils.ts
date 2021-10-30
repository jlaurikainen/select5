import { GroupBase, OptionsOrGroups } from "react-select";

export function areOptionsGrouped<Option, Group extends GroupBase<Option>>(
  options: OptionsOrGroups<Option, Group>
) {
  return options?.find((option) => "options" in option) !== undefined;
}

export function filterSelectableOptions<Option>(
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

export function reduceOptionGroups<Option>(options: GroupBase<Option>[]) {
  return options.reduce(
    (allOptions: readonly Option[], currentGroup) => [
      ...allOptions,
      ...currentGroup.options,
    ],
    []
  );
}
