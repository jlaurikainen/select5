import faker from "faker/locale/en_GB";
import { useState } from "react";
import { MultiValue } from "react-select";
import Select from "./Select";

const options = new Array(25)
  .fill(true)
  .map((_, i) => ({
    label: faker.name.findName(),
    value: i,
    isDisabled: Boolean(Math.round(Math.random())),
    extra: `ExtraProp${i}`,
  }))
  .sort((a, b) => (a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));

const groups = [
  {
    label: "Group 1",
    options: options.slice(0, 6),
  },
  {
    label: "Group 2",
    options: options.slice(13, -1),
  },
];

function App() {
  const [value, setValue] = useState<MultiValue<typeof options[0]>>([]);

  return (
    <>
      <Select
        options={groups}
        closeMenuOnSelect={false}
        isMulti
        value={value}
        onChange={(v) => setValue(v)}
      />
    </>
  );
}

export default App;
