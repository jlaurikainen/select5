import { createContext } from "react";
import { SelectContextProps, StickyHeadingContextProps } from "./types";

export const SelectContext = createContext<SelectContextProps>(
  {} as SelectContextProps
);

export const StickyHeadingContext = createContext<StickyHeadingContextProps>(
  {} as StickyHeadingContextProps
);
