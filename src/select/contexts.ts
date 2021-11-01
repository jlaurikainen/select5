import { createContext, Dispatch, SetStateAction } from "react";
import { RenderComponentType } from "./types";
import { StickyHeadingsListProps } from "./virtualized/VirtualMenuList";

export interface SelectContextProps {
  setShowSelected: Dispatch<SetStateAction<boolean>>;
  showSelected: boolean;
}

export const SelectContext = createContext<SelectContextProps>(
  {} as SelectContextProps
);

export interface StickyHeadingContextProps extends StickyHeadingsListProps {
  RenderComponent: RenderComponentType;
}

export const StickyHeadingContext = createContext<StickyHeadingContextProps>(
  {} as StickyHeadingContextProps
);
