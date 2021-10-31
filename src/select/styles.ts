import { FixedSizeList } from "react-window";
import styled from "styled-components";

export const OptionCheckbox = styled.input`
  padding: 0;
  margin: 0;
  margin-right: 8px;
`;

export const StyledGroupHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 100%;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;

  &::after {
    content: "";
    height: 0;
    width: 100%;
    border-bottom: 1px solid gray;
  }
`;

export const FixedSizedListWithStyles = styled(FixedSizeList)`
  margin: 8px 0;
`;
