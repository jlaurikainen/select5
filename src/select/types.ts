import {
  ComponentType,
  CSSProperties,
  Dispatch,
  ReactNode,
  SetStateAction,
} from "react";
import { ListChildComponentProps } from "react-window";

type RenderComponentType = ComponentType<ListChildComponentProps>;

interface StickyHeadingsProps {
  elements: ReactNode[];
  indices: number[];
}

export interface SelectContextProps {
  setShowSelected: Dispatch<SetStateAction<boolean>>;
  showSelected: boolean;
}

export interface StickyHeadingContextProps extends StickyHeadingsListProps {
  RenderComponent: RenderComponentType;
}

export interface ListItemWrapperProps {
  data: {
    headingIndices: number[];
    RenderComponent: RenderComponentType;
  };
  index: number;
  style: CSSProperties;
}

export interface StickyHeadingsListProps {
  scrollOffset: number;
  stickyHeadings: StickyHeadingsProps;
}

export interface VirtualRowProps {
  children: ReactNode;
  style: CSSProperties;
}
