import React, { Component, useRef, Fragment } from "react";
import { observable, computed } from "mobx";
import { observer, inject } from "mobx-react";
import Store from "src/store";
import {
  Input,
  InputGroup,
  InputUnit,
  Label,
  ButtonGroup,
  PositionButton,
  Check
} from "src/components/Form";
import Spacer from "src/components/Spacer";
import ms from "ms";
import ExpirationDatePicker from "src/components/ExpirationDatePicker";
import styled from "@emotion/styled";
import { basePadding, colors } from "src/styles";
import Icon from "src/components/Icon";
import { BigNumber } from "bignumber.js";
import Select from "react-select";
import ParseInput from "src/components/ParseInput";
import bnAdapter from "src/utils/bnAdapter";
import { toWei, fromWei } from "src/utils/units";
import { Market } from "src/types";
import Flex from "src/components/Flex";
import Tooltip from "src/components/Tooltip";

const Checkbox = require("src/components/Checkbox").default;

const ResolutionSourceOption = styled.label`
  display: flex;
  align-items: center;
`;

const ThemeOptions = styled.div`
  display: flex;
  align-items: flex-start;
`;

const ThemeOptionDot = styled.div<{ color: string; selected: boolean }>`
  width: ${basePadding * 2}px;
  height: ${basePadding * 2}px;
  border-radius: ${basePadding}px;
  margin-right: ${basePadding / 2}px;
  background-color: ${props => props.color};
  opacity: ${props => (props.selected ? 1 : 0.7)};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    opacity: 1;
  }

  & > i {
    color: #fff;
  }
`;

const Error = styled.div`
  color: ${colors.red};
  font-size: 14px;
`;

const ThemeOption = observer(
  ({
    color,
    form,
    theme
  }: {
    color: string;
    form: MarketFormStore;
    theme: string;
  }) => (
    <ThemeOptionDot
      color={color}
      selected={form.theme === theme}
      onClick={() => (form.theme = theme)}
    >
      {form.theme === theme && <Icon block name="check" />}
    </ThemeOptionDot>
  )
);

function DenominationSelect(props: {
  onChange: (d: string) => void;
  value: string;
}) {
  const options = useRef([
    {
      value: "USD",
      label: (
        <span>
          USD <span style={{ opacity: 0.7 }}>$</span>
        </span>
      )
    },
    {
      value: "ETH",
      label: (
        <span>
          ETH <span style={{ opacity: 0.7 }}>Ξ</span>
        </span>
      )
    },
    {
      value: "",
      label: <span>Other</span>
    }
  ]);
  let selected = options.current.find(opt => opt.value === props.value);
  const isOther =
    props.value !== undefined && (!selected || selected === options.current[2]);
  if (isOther) selected = options.current[2];
  return (
    <Flex>
      <Select
        styles={{
          container: base => ({
            ...base,
            width: 120
          }),
          control: base => ({
            ...base,
            border: `2px solid ${colors.borderGrey}`,
            borderRadius: 4,
            backgroundColor: colors.white,
            padding: `${basePadding / 2}px 0`,
            "&:hover": { borderColor: colors.grey }
          })
        }}
        options={options.current}
        onChange={(opt: any) => props.onChange(opt.value)}
        value={selected}
      />
      <Spacer inline />
      {isOther && (
        <InputGroup style={{ width: 150 }}>
          <Input
            onChange={e => props.onChange(e.target.value)}
            value={props.value || ""}
          />
        </InputGroup>
      )}
    </Flex>
  );
}

function Help(props: { children: React.ReactNode }) {
  return (
    <Tooltip content={props.children}>
      <Icon name="help" style={{ fontSize: "14px", color: colors.textGrey }} />
    </Tooltip>
  );
}

interface Props {
  store?: Store;
  form: MarketFormStore;
}

export class MarketFormStore {
  @observable type: "yesno" | "scalar" = "yesno";
  @observable name: string = "";
  @observable details: string = "";
  @observable endsAt: Date;
  @observable resolutionSource: string | null = null;
  @observable theme: string = "blue";
  @observable maxPrice: BigNumber;
  @observable minPrice: BigNumber;
  @observable denomination: string = "USD";
  @observable timezone: string;

  @computed
  get isExpirationValid() {
    return (
      this.endsAt.getTime() > Date.now() + ms("1h") &&
      this.endsAt.getTime() < Date.now() + ms("90d")
    );
  }

  @computed
  get isScalarValid() {
    if (this.type !== "scalar") return true;
    return (
      this.denomination &&
      this.minPrice &&
      this.maxPrice &&
      this.maxPrice.gt(this.minPrice)
    );
  }

  @computed
  get isResolutionSourceValid() {
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    return !this.resolutionSource || urlRegex.test(this.resolutionSource);
  }

  @computed
  get isValid() {
    return (
      this.name &&
      this.details &&
      this.isExpirationValid &&
      this.isScalarValid &&
      this.isResolutionSourceValid
    );
  }

  toParams() {
    const scalarFields = {
      maxPrice: this.maxPrice,
      minPrice: this.minPrice,
      denomination: this.denomination
    };
    return {
      type: this.type,
      name: this.name,
      details: this.details,
      endsAt: this.endsAt,
      resolutionSource: this.resolutionSource,
      metadata: { theme: this.theme, timezone: this.timezone },
      ...(this.type === "scalar" ? scalarFields : {})
    };
  }

  // static fromMarket(market: Market) {
  //   const form = new MarketFormStore();
  //   form.type = market.type as typeof form.type;
  //   form.endsAt = market.endsAt;
  //   form.name = market.description;
  //   form.details = market.details;
  //   form.resolutionSource = market.resolutionSource;
  //   form.theme = market.metadata.theme;
  //   form.timezone = market.metadata.timezone;
  //   form.minPrice = market.minPrice;
  //   form.maxPrice = market.maxPrice;
  //   form.denomination = market.denomination;
  //   return form;
  // }
}

@inject("store")
@observer
export default class MarketForm extends Component<Props> {
  get form() {
    return this.props.form;
  }

  render() {
    return (
      <div>
        <Label>
          Market type
          <Spacer inline small />
          <Help>
            A <b>binary</b> market resolves to "yes" or "no", while a{" "}
            <b>scalar</b> market can resolve to any value along a range.
          </Help>
        </Label>
        <Spacer small />
        <ButtonGroup style={{ flexWrap: "wrap" }}>
          <PositionButton
            selected={this.form.type === "yesno"}
            onClick={() => (this.form.type = "yesno")}
          >
            <h2>Binary</h2>
            <h3>Yes or no</h3>
            <Check in={this.form.type === "yesno"} />
          </PositionButton>
          <Spacer big inline />
          <PositionButton
            selected={this.form.type === "scalar"}
            onClick={() => (this.form.type = "scalar")}
          >
            <h2>Scalar</h2>
            <h3>Pick a range</h3>
            <Check in={this.form.type === "scalar"} />
          </PositionButton>
          <Spacer big inline />
          <PositionButton selected={false} disabled>
            <h2>Categorical</h2>
            <h3>😞 Not supported yet</h3>
            <Check in={false} />
          </PositionButton>
        </ButtonGroup>
        <Spacer big />
        <Label>Market question</Label>
        <Spacer small />
        <InputGroup>
          <Input
            placeholder="Write your question here"
            onChange={e => (this.form.name = e.target.value)}
            value={this.form.name}
          />
        </InputGroup>
        {this.form.type === "scalar" && (
          <Fragment>
            <Spacer big />
            <Label>Unit of measurement</Label>
            <Spacer small />
            <DenominationSelect
              value={this.form.denomination}
              onChange={denomination => (this.form.denomination = denomination)}
            />
            <Spacer big />
            <Label>Scalar market range</Label>
            <Spacer small />
            <div style={{ display: "flex", alignItems: "center" }}>
              <InputGroup style={{ width: 150 }}>
                <ParseInput
                  placeholder="0"
                  component={Input}
                  value={this.form.minPrice}
                  onChange={val => (this.form.minPrice = val)}
                  {...bnAdapter(
                    bn => (bn ? fromWei(bn) : ""),
                    str => toWei(str)
                  )}
                  style={{ minWidth: 0 }}
                />
                <InputUnit>{this.form.denomination}</InputUnit>
              </InputGroup>
              <Spacer inline />
              <span style={{ color: colors.textGrey, fontSize: "14px" }}>
                TO
              </span>
              <Spacer inline />
              <InputGroup style={{ width: 150 }}>
                <ParseInput
                  placeholder="100"
                  component={Input}
                  value={this.form.maxPrice}
                  onChange={val => (this.form.maxPrice = val)}
                  {...bnAdapter(
                    bn => (bn ? fromWei(bn) : ""),
                    str => toWei(str)
                  )}
                  style={{ minWidth: 0 }}
                />
                <InputUnit>{this.form.denomination}</InputUnit>
              </InputGroup>
            </div>
          </Fragment>
        )}
        <Spacer big />
        <Label>
          Expiration
          <Spacer small inline />
          <Help>
            Choose the date and time that this market ends. At this point,
            trading will stop and you will be able to report an outcome.
          </Help>
        </Label>
        <Spacer small />
        <ExpirationDatePicker
          defaultDate={this.form.endsAt || new Date(Date.now() + ms("7d"))}
          onChange={date => (this.form.endsAt = date)}
          onTimezoneChange={timezone => (this.form.timezone = timezone)}
          defaultTimezone={this.form.timezone}
        />
        <Spacer big />
        <Label>
          Resolution source
          <Spacer small inline />
          <Help>
            If your market requires information from a particular source or
            website, specify it here. "General Knowledge" is recommended unless
            your market has very specific resolution criteria.
          </Help>
        </Label>
        <Spacer small />
        <ResolutionSourceOption>
          <Checkbox
            type="radio"
            name="resolutionSource"
            onChange={() => (this.form.resolutionSource = null) as any}
            checked={this.form.resolutionSource === null}
          />
          <Spacer inline small />
          General knowledge (recommended)
        </ResolutionSourceOption>
        <Spacer size={0.25} />
        <ResolutionSourceOption>
          <Checkbox
            type="radio"
            name="resolutionSource"
            onChange={() => (this.form.resolutionSource = "")}
            checked={this.form.resolutionSource !== null}
          />
          <Spacer inline small /> Other:
          <Spacer inline small />
          <InputGroup style={{ display: "inline-flex" }}>
            <Input
              style={{ fontSize: "14px", padding: "6px" }}
              value={this.form.resolutionSource || ""}
              onChange={e => (this.form.resolutionSource = e.target.value)}
            />
          </InputGroup>
        </ResolutionSourceOption>
        {!this.form.isResolutionSourceValid && (
          <Fragment>
            <Spacer small />
            <Error>
              Resolution source must be a URL, like{" "}
              <b>https://example.com/resolution</b>.
            </Error>
          </Fragment>
        )}
        <Spacer big />
        <Label>
          Resolution rules
          <Spacer small inline />
          <Help>
            Resolution rules help clarify your market to traders and reporters.
            Be as clear as possible to prevent your market from being disputed.
          </Help>
        </Label>
        <Spacer small />
        <InputGroup>
          <Input
            as="textarea"
            placeholder="Write comprehensive instructions for how this market should resolve"
            onChange={e => (this.form.details = e.target.value)}
            value={this.form.details}
            style={{ resize: "none", fontSize: "16px" }}
            {...{
              rows: 4
            } as any}
          />
        </InputGroup>
        <Spacer big />
        <Label>Theme color</Label>
        <ThemeOptions>
          <ThemeOption color={colors.blue} form={this.form} theme="blue" />
          <ThemeOption
            color={colors.darkGreen}
            form={this.form}
            theme="green"
          />
          <ThemeOption color={colors.red} form={this.form} theme="red" />
          <ThemeOption color={colors.orange} form={this.form} theme="orange" />
          <ThemeOption color={colors.purple} form={this.form} theme="purple" />
        </ThemeOptions>
      </div>
    );
  }
}
