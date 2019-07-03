import React, { Component } from "react";
import styled from "@emotion/styled";
import { observable } from "mobx";
import { observer } from "mobx-react";
import Portal from "src/components/Portal";
import { Transition } from "react-transition-group";
import OutsideClickHandler from "react-outside-click-handler";
import { colors, media, basePadding } from "src/styles";
import { Global, css } from "@emotion/core";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  dark?: boolean;
  noPortal?: boolean;
}

const ModalContainer = styled.div<{ dark?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;

  display: flex;
  align-items: center;
  overflow: auto;
  flex-direction: column;
  background-color: ${props =>
    props.dark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.1)"};
  padding: ${basePadding}px 0;

  transition: background-color 0.2s;

  &.entered,
  &.entering {
    background-color: ${props =>
      props.dark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.1)"};
  }

  &.exited,
  &.exiting {
    background-color: rgba(0, 0, 0, 0);
  }

  &.exited {
    visibility: hidden;
  }
`;

const ModalInner = styled.div<{ dark?: boolean }>`
  transition: transform 0.2s, opacity 0.2s;

  &.entered,
  &.entering {
    transform: none;
    opacity: 1;
  }

  &.exited,
  &.exiting {
    transform: scale(0.9) translateY(10px);
    opacity: 0;
  }

  ${media.phone} {
    align-self: stretch;
    margin: 0 ${basePadding}px;
  }
`;

export const ModalBox = styled.div<{ dark?: boolean }>`
  min-width: 200px;
  background-color: ${props => (props.dark ? colors.bgLight : colors.white)};
  box-shadow: 0 2px 4px rgba(50, 50, 93, 0.11), 0 1px 2px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  overflow: hidden;
`;

export const ModalHeader = styled.h1`
  font-size: 28px;
  font-weight: 500;
`;

const ModalContext = React.createContext(() => {});

export const CloseButton: React.SFC = ({ children }) => (
  <ModalContext.Consumer>
    {handleClose => (
      <span style={{ cursor: "pointer" }} onClick={handleClose}>
        {children}
      </span>
    )}
  </ModalContext.Consumer>
);

@observer
export default class Modal extends Component<Props> {
  @observable isMounted = this.props.isOpen;
  @observable isOpen = this.props.isOpen;

  componentDidMount() {
    if (this.props.isOpen) this.open();
  }

  componentDidUpdate(oldProps: Props) {
    if (!oldProps.isOpen && this.props.isOpen) this.open();
    if (oldProps.isOpen && !this.props.isOpen) this.close();
  }

  componentWillUnmount() {
    if (this.props.isOpen) this.close();
  }

  open() {
    this.isMounted = true;
    setTimeout(() => (this.isOpen = true));
  }

  close() {
    this.isOpen = false;
  }

  remove() {
    this.isMounted = false;
  }

  handleClose = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    if (!this.isMounted) return null;
    const ContainerComponent = this.props.noPortal ? "div" : Portal;
    return (
      <ModalContext.Provider value={this.handleClose}>
        <ContainerComponent>
          <Transition
            in={this.isOpen}
            timeout={200}
            onExited={() => this.remove()}
          >
            {status => (
              <ModalContainer dark={this.props.dark} className={status}>
                <div style={{ height: 60 }} />
                <ModalInner className={status}>
                  <OutsideClickHandler onOutsideClick={this.handleClose}>
                    <ModalBox dark={this.props.dark}>
                      {this.props.children}
                    </ModalBox>
                  </OutsideClickHandler>
                </ModalInner>
                {(status === "entered" || status === "entering") && (
                  <Global
                    styles={css`
                      body {
                        overflow: hidden;
                      }
                    `}
                  />
                )}
              </ModalContainer>
            )}
          </Transition>
        </ContainerComponent>
      </ModalContext.Provider>
    );
  }
}
