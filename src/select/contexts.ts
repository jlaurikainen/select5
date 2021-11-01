import { createContext, Dispatch, SetStateAction } from "react";
import { RenderComponentType } from "./types";
import { VirtualMenuListProps } from "./virtualized/VirtualMenuList";

export interface SelectContextProps {
  setShowSelected: Dispatch<SetStateAction<boolean>>;
  showSelected: boolean;
}

export const SelectContext = createContext<SelectContextProps>(
  {} as SelectContextProps
);

export interface StickyHeadingContextProps extends VirtualMenuListProps {
  RenderComponent: RenderComponentType;
}

export const StickyHeadingContext = createContext<StickyHeadingContextProps>(
  {} as StickyHeadingContextProps
);
