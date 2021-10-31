import {
  ComponentType,
  CSSProperties,
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";
import { ListChildComponentProps } from "react-window";

interface StickyHeadingsProps {
  indices: number[];
  elements: ReactNode[];
}

export interface SelectContextProps {
  showSelected: boolean;
  setShowSelected: Dispatch<SetStateAction<boolean>>;
}

export interface StickyHeadingContextProps extends StickyHeadingsListProps {
  RenderComponent: ComponentType<ListChildComponentProps>;
}

export interface ListItemWrapperProps {
  data: {
    RenderComponent: ComponentType<ListChildComponentProps>;
    headingIndices: number[];
  };
  index: number;
  style: CSSProperties;
}

export interface StickyHeadingsListProps {
  stickyHeadings: StickyHeadingsProps;
  scrollOffset: number;
}

export interface VirtualRowProps {
  children: ReactNode;
  style: CSSProperties;
}
