import React, { useRef, Fragment } from "react";
import { observable, computed } from "mobx";
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
import { useObserver, Observer } from "mobx-react-lite";
import gql from "graphql-tag";
import { useQuery } from "react-apollo-hooks";
import TextLink from "src/components/TextLink";

const CreatableSelect: typeof Select = require("react-select/creatable")
  .default;
const Checkbox = require("src/components/Checkbox").default;

const ResolutionSourceOption = styled.label`
  display: flex;
  align-items: center;
`;

const Error = styled.div`
  color: ${colors.red};
  font-size: 14px;
`;

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

function Required() {
  return <span style={{ color: colors.red }}>*</span>;
}

interface Props {
  store?: Store;
  form: MarketFormStore;
}

export class MarketFormStore {
  @observable type: "yesno" | "scalar" = "yesno";
  @observable description: string = "";
  @observable details: string = "";
  @observable endTime: Date;
  @observable resolutionSource: string | null = null;
  @observable theme: string = "blue";
  @observable maxPrice: BigNumber | null;
  @observable minPrice: BigNumber | null;
  @observable scalarDenomination: string = "USD";
  @observable timezone: string;
  @observable tags: string[];
  @observable category: string;
  @observable marketCreatorFeeRate: string;
  @observable scalarPrecision: BigNumber | null = new BigNumber("0.01");

  @computed
  get isExpirationValid() {
    return (
      this.endTime.getTime() > Date.now() + ms("1h") &&
      this.endTime.getTime() < Date.now() + ms("90d")
    );
  }

  @computed
  get isScalarValid() {
    if (this.type !== "scalar") return true;
    return (
      this.scalarDenomination &&
      this.minPrice &&
      this.maxPrice &&
      this.maxPrice.gt(this.minPrice) &&
      this.scalarPrecision &&
      this.scalarPrecision.gt(0)
    );
  }

  @computed
  get isResolutionSourceValid() {
    const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)$/;
    return !this.resolutionSource || urlRegex.test(this.resolutionSource);
  }

  @computed
  get isMarketCreatorFeeRateValid() {
    const rateRegex = /^[0-9]+(\.[0-9]+)?$/;
    if (!rateRegex.test(this.marketCreatorFeeRate)) return false;
    const rate = new BigNumber(this.marketCreatorFeeRate);
    return rate.gte(0) && rate.lte(10);
  }

  @computed
  get isValid() {
    return (
      this.description &&
      this.details &&
      this.isExpirationValid &&
      this.isScalarValid &&
      this.isResolutionSourceValid &&
      this.isMarketCreatorFeeRateValid
    );
  }

  @computed
  get numTicks() {
    if (!this.maxPrice || !this.minPrice || !this.scalarPrecision) return null;
    return this.maxPrice.minus(this.minPrice).div(this.scalarPrecision);
  }

  toParams(): Partial<Market> {
    const scalarFields = {
      maxPrice: this.maxPrice,
      minPrice: this.minPrice,
      scalarDenomination: this.scalarDenomination,
      numTicks: this.numTicks
    };
    return {
      type: this.type,
      description: this.description,
      details: this.details,
      endTime: this.endTime.toISOString(),
      resolutionSource: this.resolutionSource,
      metadata: { timezone: this.timezone },
      tags: this.tags,
      category: this.category,
      marketCreatorFeeRate: new BigNumber(
        this.marketCreatorFeeRate || "0"
      ).toString(),
      ...(this.type === "scalar" ? scalarFields : {})
    } as Partial<Market>;
  }

  static fromMarket(market: Market) {
    const form = new MarketFormStore();
    form.type = market.type as typeof form.type;
    form.endTime = new Date(market.endTime);
    form.description = market.description;
    form.details = market.details;
    form.resolutionSource = market.resolutionSource || null;
    form.timezone = market.metadata.timezone;
    form.minPrice = market.minPrice ? new BigNumber(market.minPrice) : null;
    form.maxPrice = market.maxPrice ? new BigNumber(market.maxPrice) : null;
    form.tags = market.tags;
    form.category = market.category;
    form.scalarDenomination = market.scalarDenomination || "USD";
    form.marketCreatorFeeRate = market.marketCreatorFeeRate || "";
    form.scalarPrecision =
      market.numTicks && form.minPrice && form.maxPrice
        ? form.maxPrice.minus(form.minPrice).div(market.numTicks)
        : form.scalarPrecision;
    return form;
  }
}

export default function MarketForm(props: Props) {
  return useObserver(() => {
    const form = props.form;

    const { data, loading, error } = useQuery<{
      categories: { name: string; tags: string[] }[];
    }>(
      gql`
        query GetCategories {
          categories {
            name
            tags
          }
        }
      `
    );

    const categoryOptions =
      !loading && !error && data && data.categories
        ? data.categories.map(c => ({
            value: c.name,
            label: c.name,
            tags: c.tags
          }))
        : [];
    let selectedCategory = categoryOptions.find(c => c.value === form.category);
    if (form.category && !selectedCategory) {
      selectedCategory = {
        value: form.category,
        label: form.category,
        tags: []
      };
      categoryOptions.push(selectedCategory);
    }

    type TagOption = { value: string; label: string };
    let tagOptionsByTag: { [tagName: string]: TagOption } = {};
    let tagOptions: TagOption[] = [];
    const getTagOption = (tag: string) =>
      tagOptionsByTag[tag] || { value: tag, label: tag };

    if (selectedCategory)
      selectedCategory.tags.forEach(tag => {
        const tagOption = { value: tag, label: tag };
        tagOptions.push(tagOption);
        tagOptionsByTag[tag] = tagOption;
      });

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
            selected={form.type === "yesno"}
            onClick={() => (form.type = "yesno")}
          >
            <h2>Binary</h2>
            <h3>Yes or no</h3>
            <Check in={form.type === "yesno"} />
          </PositionButton>
          <div>
            <Spacer big inline />
          </div>
          <PositionButton
            selected={form.type === "scalar"}
            onClick={() => (form.type = "scalar")}
          >
            <h2>Scalar</h2>
            <h3>Pick a range</h3>
            <Check in={form.type === "scalar"} />
          </PositionButton>
          <div>
            <Spacer big inline />
          </div>
          <PositionButton selected={false} disabled>
            <h2>Categorical</h2>
            <h3>😞 Not supported yet</h3>
            <Check in={false} />
          </PositionButton>
        </ButtonGroup>
        <Spacer big />
        <Label>
          Market question <Required />
        </Label>
        <Spacer small />
        <Observer>
          {() => (
            <InputGroup>
              <Input
                placeholder="Write your question here"
                onChange={e => (form.description = e.target.value)}
                value={form.description}
              />
            </InputGroup>
          )}
        </Observer>
        {form.type === "scalar" && (
          <Fragment>
            <Spacer big />
            <Label>
              Unit of measurement <Required />
            </Label>
            <Spacer small />
            <DenominationSelect
              value={form.scalarDenomination}
              onChange={denomination =>
                (form.scalarDenomination = denomination)
              }
            />
            <Spacer big />
            <Label>
              Scalar market range <Required />
            </Label>
            <Spacer small />
            <div style={{ display: "flex", alignItems: "center" }}>
              <InputGroup style={{ width: 150 }}>
                <ParseInput
                  placeholder="0"
                  component={Input}
                  value={form.minPrice}
                  onChange={val => (form.minPrice = val || null)}
                  {...bnAdapter(
                    bn => (bn ? fromWei(bn) : ""),
                    str => toWei(str)
                  )}
                  style={{ minWidth: 0 }}
                />
                <InputUnit>{form.scalarDenomination}</InputUnit>
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
                  value={form.maxPrice}
                  onChange={val => (form.maxPrice = val || null)}
                  {...bnAdapter(
                    bn => (bn ? fromWei(bn) : ""),
                    str => toWei(str)
                  )}
                  style={{ minWidth: 0 }}
                />
                <InputUnit>{form.scalarDenomination}</InputUnit>
              </InputGroup>
            </div>
            <Spacer big />
            <Label>
              Scalar market precision <Required />{" "}
              <Help>
                This value determines how many distinct outcomes between the
                bounds reporters can choose for this market.
              </Help>
            </Label>
            <Spacer small />
            <InputGroup style={{ width: 150 }}>
              <ParseInput
                placeholder="0.01"
                component={Input}
                value={form.scalarPrecision}
                onChange={val => (form.scalarPrecision = val || null)}
                {...bnAdapter(
                  bn => (bn ? bn.toString() : ""),
                  str => new BigNumber(str)
                )}
                style={{ minWidth: 0 }}
              />
              <InputUnit>{form.scalarDenomination}</InputUnit>
            </InputGroup>
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
          defaultDate={form.endTime || new Date(Date.now() + ms("7d"))}
          onChange={date => (form.endTime = date)}
          onTimezoneChange={timezone => (form.timezone = timezone)}
          defaultTimezone={form.timezone}
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
            onChange={() => (form.resolutionSource = null) as any}
            checked={form.resolutionSource === null}
          />
          <Spacer inline small />
          General knowledge (recommended)
        </ResolutionSourceOption>
        <Spacer size={0.25} />
        <ResolutionSourceOption>
          <Checkbox
            type="radio"
            name="resolutionSource"
            onChange={() => (form.resolutionSource = "")}
            checked={form.resolutionSource !== null}
          />
          <Spacer inline small /> Other:
          <Spacer inline small />
          <InputGroup style={{ display: "inline-flex" }}>
            <Input
              style={{ fontSize: "14px", padding: "6px" }}
              value={form.resolutionSource || ""}
              onChange={e => (form.resolutionSource = e.target.value)}
            />
          </InputGroup>
        </ResolutionSourceOption>
        {!form.isResolutionSourceValid && (
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
          Resolution rules <Required />
          <Spacer small inline />
          <Help>
            Resolution rules help clarify your market to traders and reporters.
            Be as clear as possible to prevent your market from being disputed.
          </Help>
        </Label>
        <Spacer small />
        <Observer>
          {() => (
            <InputGroup>
              <Input
                as="textarea"
                placeholder="Write comprehensive instructions for how this market should resolve"
                onChange={e => (form.details = e.target.value)}
                value={form.details}
                style={{ resize: "none", fontSize: "16px" }}
                {...{
                  rows: 4
                } as any}
              />
            </InputGroup>
          )}
        </Observer>
        <Spacer big />
        <Label>
          Category <Required />
          <Spacer small inline />
          <Help>
            Choose a broad category that this market belongs to to help people
            find your market.
          </Help>
        </Label>
        <Spacer small />
        <CreatableSelect
          styles={{
            control: base => ({
              ...base,
              border: `2px solid ${colors.borderGrey}`,
              borderRadius: 4,
              backgroundColor: colors.white,
              padding: `${basePadding / 2}px 0`,
              "&:hover": { borderColor: colors.grey }
            })
          }}
          value={selectedCategory}
          options={categoryOptions}
          onChange={(newVal: any) =>
            (form.category = newVal ? newVal.value : "")
          }
          noOptionsMessage={() => "Type to create a category"}
        />
        <Spacer big />
        <Label>
          Tags
          <Spacer small inline />
          <Help>
            Choose tags that are specific to your market. If your category is
            "Sports", tags might be "Basketball" or "NBA".
          </Help>
        </Label>
        <Spacer small />
        <CreatableSelect
          styles={{
            control: base => ({
              ...base,
              border: `2px solid ${colors.borderGrey}`,
              borderRadius: 4,
              backgroundColor: colors.white,
              padding: `${basePadding / 2}px 0`,
              "&:hover": { borderColor: colors.grey }
            })
          }}
          value={(form.tags || []).map(getTagOption)}
          onChange={(tags: { value: string }[]) =>
            (form.tags = (tags || []).map(t => t.value))
          }
          options={tagOptions}
          noOptionsMessage={() => "Type to add tags"}
          isMulti={true}
        />
        <Spacer big />
        <Label>
          Creator fee <Required />
          <Spacer small inline />
          <Help>
            A percentage from 0% to 10%, the creator fee is the share of open
            interest that you will earn from traders redeeming their positions.
          </Help>
        </Label>
        <Spacer small />
        <Flex alignCenter>
          <Observer>
            {() => (
              <InputGroup style={{ maxWidth: "100px" }}>
                <Input
                  onChange={e => (form.marketCreatorFeeRate = e.target.value)}
                  value={form.marketCreatorFeeRate}
                  style={{ minWidth: 0 }}
                />
                <InputUnit>%</InputUnit>
              </InputGroup>
            )}
          </Observer>
          <Spacer inline big />
          <span style={{ color: colors.textGrey }}>
            <small>Suggested values:</small>
            <br />
            <TextLink onClick={() => (form.marketCreatorFeeRate = "0")}>
              0.0%
            </TextLink>
            <Spacer inline />
            <TextLink onClick={() => (form.marketCreatorFeeRate = "0.5")}>
              0.5%
            </TextLink>
            <Spacer inline />
            <TextLink onClick={() => (form.marketCreatorFeeRate = "1")}>
              1.0%
            </TextLink>
          </span>
        </Flex>
      </div>
    );
  });
}
