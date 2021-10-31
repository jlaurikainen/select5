import faker from "faker/locale/en_GB";
import Select from "./select/Select";

const options = new Array(50)
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
    options: options.slice(0, 25),
  },
  {
    label: "Group 2",
    options: options.slice(26, -1),
  },
];

function App() {
  return (
    <>
      <Select options={groups} isMulti={true} />
    </>
  );
}

export default App;
