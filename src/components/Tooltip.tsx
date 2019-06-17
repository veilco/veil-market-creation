import React, { Component } from "react";
import ReactDOM from "react-dom";
import { observer } from "mobx-react";
import { observable, action } from "mobx";
import Portal from "src/components/Portal";
import styled from "@emotion/styled";
import { basePadding } from "src/styles";
import { CSSTransition } from "react-transition-group";

interface Props {
  bottom?: boolean;
  replace?: boolean;
  content: React.ReactNode;
}

const ARROW_SIZE = 5;
const PADDING = 3;
const MAX_WIDTH = 200;
const TRANSITION_DURATION = 150;
const EDGE_BUFFER = 6;

const TooltipContainerOuter = styled.div`
  position: fixed;
  z-index: 100;
  width: 100%;
`;

const TooltipContainerInner = styled.div`
  width: 100%;
  margin-left: -50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  perspective: 100px;
`;

const TooltipContainerInnerTop = styled(TooltipContainerInner)`
  margin-bottom: ${ARROW_SIZE}px;
`;

const TooltipContainerInnerBottom = styled(TooltipContainerInner)`
  margin-top: ${ARROW_SIZE}px;
`;

const TooltipBox = styled.div`
  max-width: ${MAX_WIDTH}px;
  background-color: #555;
  color: #eee;
  font-size: 12px;
  font-weight: 400;
  padding: ${basePadding / 2}px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  text-align: center;

  position: relative;
  transform-origin: 50% 100%;
  transition: transform ${TRANSITION_DURATION}ms,
    opacity ${TRANSITION_DURATION}ms;
  opacity: 0;
  .tooltip-enter &,
  .tooltip-enter-done & {
    transform: translateZ(0);
    opacity: 1;
  }
`;

const TooltipBoxTop = styled(TooltipBox)`
  transform: translateY(-4px);
`;

const TooltipBoxBottom = styled(TooltipBox)`
  transform: translateY(4px);
`;

const TooltipArrow = styled.div`
  position: absolute;
  left: 50%;
  margin-left: -${ARROW_SIZE}px;
  border-style: solid;
  border-color: #555 transparent;
`;

const TooltipArrowTop = styled(TooltipArrow)`
  bottom: -${ARROW_SIZE}px;
  border-width: ${ARROW_SIZE}px ${ARROW_SIZE}px 0;
`;

const TooltipArrowBottom = styled(TooltipArrow)`
  top: -${ARROW_SIZE}px;
  border-width: 0 ${ARROW_SIZE}px ${ARROW_SIZE}px;
`;

@observer
export default class Tooltip extends Component<Props> {
  @observable isMousedOver = false;
  @observable isFocused = false;
  @observable isMounted = false;
  @observable isOpen = false;
  @observable top = 0;
  @observable bottom = 0;
  @observable center = 0;
  @observable boxHeight = 20;
  @observable horizontalOffset = 0;
  isDelaying: boolean = false;
  box: HTMLDivElement | null;

  @action
  calculatePosition() {
    const element = ReactDOM.findDOMNode(this) as HTMLDivElement;
    const { top, left, width, height } = element.getBoundingClientRect();
    this.bottom = top + height;
    this.top = top;
    this.center = left + width / 2;
    if (!this.box) {
      // Initially assume height of 20
      this.boxHeight = 20 + ARROW_SIZE;
    } else {
      const boxRect = this.box.getBoundingClientRect();
      this.boxHeight = boxRect.height + ARROW_SIZE;
      // Check if box goes off edge
      const left = this.center - boxRect.width / 2;
      const right = this.center + boxRect.width / 2;
      if (left < EDGE_BUFFER) {
        this.horizontalOffset = EDGE_BUFFER - left;
      } else if (right > window.innerWidth) {
        this.horizontalOffset = window.innerWidth - EDGE_BUFFER - right;
      } else {
        this.horizontalOffset = 0;
      }
    }
  }

  delayOpen(delay: number) {
    if (this.isDelaying) return;
    this.isDelaying = true;
    // Calculating position normally takes two passes--do one now
    setTimeout(() => this.calculatePosition(), 1);
    setTimeout(
      action(() => {
        this.isDelaying = false;
        if (!this.isMousedOver && !this.isFocused) return;
        this.isOpen = true;
        this.calculatePosition();
      }),
      delay
    );
  }

  cancel() {
    if (this.isMounted && !this.isOpen) this.isMounted = false;
  }

  handleMouseOver = action(() => {
    this.isMounted = true;
    this.isMousedOver = true;
    this.delayOpen(300);
  });

  handleMouseOut = action(() => {
    this.isMousedOver = false;
    this.cancel();
  });

  handleFocus = action(() => {
    this.isMounted = true;
    this.isFocused = true;
    this.delayOpen(1);
  });

  handleBlur = action(() => {
    this.isFocused = false;
    this.cancel();
  });

  remove = action(() => {
    this.isMounted = false;
    this.isOpen = false;
  });

  get shouldShow() {
    return this.isOpen && (this.isMousedOver || this.isFocused);
  }

  get containerTop() {
    if (this.props.bottom) return this.bottom + PADDING;
    return this.top - this.boxHeight - PADDING;
  }

  render() {
    if (!this.props.content) return this.props.children;

    let toRender;
    if (this.props.replace) {
      const child = React.Children.only(this.props.children);
      const newChild = React.cloneElement(child as React.ReactElement<any>, {
        onMouseOver: this.handleMouseOver,
        onMouseOut: this.handleMouseOut,
        onFocus: this.handleFocus,
        onBlur: this.handleBlur,
        tabIndex: "0",
        key: "content"
      });
      toRender = newChild;
    } else {
      toRender = (
        <span
          onMouseOver={this.handleMouseOver}
          onMouseOut={this.handleMouseOut}
          onFocus={this.handleFocus}
          onBlur={this.handleBlur}
          tabIndex={0}
          key="content"
        >
          {this.props.children}
        </span>
      );
    }

    const isTop = !this.props.bottom;

    const TooltipBox = isTop ? TooltipBoxTop : TooltipBoxBottom;
    const TooltipContainerInner = isTop
      ? TooltipContainerInnerTop
      : TooltipContainerInnerBottom;
    const TooltipArrow = isTop ? TooltipArrowTop : TooltipArrowBottom;

    return [
      toRender,
      <Portal key="portal">
        {this.isMounted ? (
          <CSSTransition
            in={this.shouldShow}
            classNames="tooltip"
            timeout={TRANSITION_DURATION}
            onExited={() => this.remove()}
          >
            <TooltipContainerOuter
              style={{ top: this.containerTop, left: this.center }}
            >
              <TooltipContainerInner>
                <TooltipBox
                  ref={box => (this.box = box)}
                  style={{
                    left: this.horizontalOffset
                  }}
                >
                  <TooltipArrow
                    style={{
                      transform: `translateX(${-this.horizontalOffset}px)`
                    }}
                  />
                  {this.props.content}
                </TooltipBox>
              </TooltipContainerInner>
            </TooltipContainerOuter>
          </CSSTransition>
        ) : null}
      </Portal>
    ];
  }
}
