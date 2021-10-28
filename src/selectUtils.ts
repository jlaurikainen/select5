import { GroupBase } from "react-select";

export function reduceOptionGroups<Option>(options: GroupBase<Option>[]) {
  return options.reduce(
    (allOptions: readonly Option[], currentGroup) => [
      ...allOptions,
      ...currentGroup.options,
    ],
    []
  );
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
