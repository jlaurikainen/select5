import { ComponentType, createContext, Dispatch, SetStateAction } from "react";
import { ListChildComponentProps } from "react-window";
import { VirtualMenuListProps } from "./virtualized/VirtualMenuList";

export interface SelectContextProps {
  setMenuRef: Dispatch<SetStateAction<HTMLDivElement | null>>;
  setShowSelected: Dispatch<SetStateAction<boolean>>;
  showSelected: boolean;
}

export const SelectContext = createContext<SelectContextProps>(
  {} as SelectContextProps
);

export interface StickyHeadingContextProps extends VirtualMenuListProps {
  RenderComponent: ComponentType<ListChildComponentProps>;
}

export const StickyHeadingContext = createContext<StickyHeadingContextProps>(
  {} as StickyHeadingContextProps
);
