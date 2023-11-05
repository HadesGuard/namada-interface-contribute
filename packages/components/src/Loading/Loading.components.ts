import { color, fontSize, spacement } from "@namada/utils";
import styled from "styled-components";

export const LoadingContainer = styled.div<{
  visible: boolean;
  variant: "contained" | "full";
}>`
  display: block;
  height: 100%;
  left: 0;
  min-height: 50vh;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  pointer-events: ${(props) => (props.visible ? "auto" : "none")};
  position: ${(props) =>
    props.variant === "contained" && props.visible ? "static" : "absolute"};
  top: 0;
  transition: 150ms ease-out opacity;
  width: 100%;
`;

export const LoadingPanel = styled.div`
  align-items: center;
  background-color: ${color("primary", "main")};
  display: flex;
  flex-direction: column;
  gap: ${spacement(10)};
  height: 100%;
  left: 0;
  padding: ${spacement(24)};
  position: absolute;
  top: 0;
  width: 100%;
`;

export const LoadingHeader = styled.header`
  align-items: flex-end;
  display: flex;
  font-size: ${fontSize("2xl")};
  font-weight: 500;
  min-height: 2.5em;
  text-align: center;
  text-transform: uppercase;
  text-wrap: balance;

  &::selection {
    background-color: ${color("utility1", "main")};
    color: ${color("primary", "main")};
  }
`;
