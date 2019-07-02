import React from "react";
import styled from "@emotion/styled";
import { basePadding } from "src/styles";
import OutsideClickHandler from "react-outside-click-handler";
import { TransitionGroup, CSSTransition } from "react-transition-group";
import useDimensions from "src/hooks/useDimensions";

export const PopoverContainer = styled.div`
  position: absolute;
  top: 100%;
  left: 50%;
  z-index: 15;
  width: 340px;
  margin-left: -170px;
`;

const AnimationContainer = styled.div`
  opacity: 0;
  position: relative;
  transform: scale(0.95) translateY(5px);
  transition: opacity 0.2s, transform 0.2s;

  padding-top: ${basePadding}px;
  .fade-enter-active &,
  .fade-enter-done & {
    opacity: 1;
    transform: none;
  }
`;

export const PopoverBox = styled.div<{ noPad?: boolean }>`
  padding: ${props => (props.noPad ? "0" : `0 ${basePadding}px`)};
  background-color: #fff;
  border-radius: 5px;
  overflow: hidden;

  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

export const PopoverArrow = styled.div<{ arrowColor?: string }>`
  position: absolute;
  top: 0;
  left: 50%;
  margin-top: ${basePadding - 6}px;
  margin-left: -6px;
  border-color: transparent;
  border-width: 0 6px 6px 6px;
  border-bottom-color: ${props =>
    props.arrowColor ? props.arrowColor : "#fff"};
  border-style: solid;
`;

interface PopoverProps {
  onClose: () => void;
  isOpen: boolean;
  children: React.ReactNode;
  noPad?: boolean;
  arrowColor?: string;
  popoverStyles?: React.CSSProperties;
}

export function Popover({
  onClose,
  isOpen,
  children,
  noPad,
  arrowColor,
  popoverStyles
}: PopoverProps) {
  const [ref, dimensions] = useDimensions();
  return (
    <div>
      <TransitionGroup>
        {isOpen && (
          <CSSTransition classNames="fade" timeout={200}>
            <PopoverContainer style={popoverStyles} ref={ref}>
              <AnimationContainer>
                <OutsideClickHandler
                  onOutsideClick={() => setTimeout(onClose, 0)}
                >
                  <PopoverArrow arrowColor={arrowColor} />
                  <PopoverBox
                    noPad={noPad}
                    style={
                      dimensions.right &&
                      dimensions.right > window.innerWidth - basePadding
                        ? {
                            transform: `translateX(-${dimensions.right -
                              window.innerWidth +
                              basePadding}px)`
                          }
                        : {}
                    }
                  >
                    {children}
                  </PopoverBox>
                </OutsideClickHandler>
              </AnimationContainer>
            </PopoverContainer>
          </CSSTransition>
        )}
      </TransitionGroup>
    </div>
  );
}
