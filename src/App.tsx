import faker from "faker/locale/en_GB";
import Select from "./Select";

const options = new Array(25)
  .fill(true)
  .map((_, i) => ({
    label: faker.name.findName(),
    value: i,
    isDisabled: Boolean(Math.round(Math.random())),
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
  return (
    <>
      <Select options={groups} closeMenuOnSelect={false} isMulti />
    </>
  );
}

export default App;
