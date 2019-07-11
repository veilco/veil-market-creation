import React, { Component } from "react";
import { observable, computed, when, reaction } from "mobx";
import { observer } from "mobx-react";
import { Input, InputGroup } from "src/components/Form";
import Spacer from "src/components/Spacer";
import styled from "@emotion/styled";
import ms from "ms";
import format from "date-fns/format";
import ReactDatePickerStyles from "src/components/ReactDatePickerStyles";
import { colors } from "src/styles";

const DatePicker = React.lazy(() => import("react-datepicker"));
const TimezoneSelect = React.lazy(() =>
  import("src/components/TimezoneSelect")
);
const DatePickerInput = styled(Input)`
  width: 100%;
  font-size: 14px;
`;
const StyledDatePicker = DatePickerInput.withComponent(DatePicker);

const FormContainer = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin-top: -12px;
  & > * {
    margin-top: 12px;
  }
`;

const Error = styled.div`
  color: ${colors.red};
  margin-top: 6px;
  font-size: 14px;
`;

@observer
export default class ExpirationDatePicker extends Component<{
  onChange: (date: Date) => void;
  onTimezoneChange: (timezone: string) => void;
  defaultTimezone: string;
  defaultDate?: Date;
}> {
  @observable date: Date;
  @observable time: Date;
  @observable offsetInMinutes: number;

  disposer: any;

  componentDidMount() {
    // Wait for this.offsetInMinutes to be set (happens on TimezoneSelect mount)
    when(
      () => this.offsetInMinutes !== undefined,
      () => {
        let localDate = this.props.defaultDate
          ? new Date(this.props.defaultDate)
          : new Date();
        // Round to nearest 30 minutes
        localDate.setMinutes(Math.floor(localDate.getMinutes() / 30) * 30);
        localDate.setSeconds(0);
        // localDate is the correct actual time (i.e. the correct getTime()),
        // but needs to be adjusted to display with the current offsetInMinutes
        const newDate = new Date(
          localDate.getTime() +
            localDate.getTimezoneOffset() * 60000 -
            this.offsetInMinutes * 60000
        );
        // Note: newDate is now NOT THE ACTUAL DATE -- it just possesses the
        // correct display date MM/DD/YYYY and time, given this.offsetInMinutes
        this.date = newDate;
        this.time = newDate;
      }
    );
    this.disposer = reaction(
      () => this.finalDate && this.finalDate.getTime(),
      () => {
        if (this.finalDate) this.props.onChange(this.finalDate);
      }
    );
  }

  componentWillUnmount() {
    if (this.disposer) this.disposer();
  }

  get maxDate() {
    // Max September 15
    return new Date("2019-09-15T00:00:00.000Z");
  }

  @computed
  get offset() {
    const offset = this.offsetInMinutes || 0;
    const sign = offset < 0 ? "+" : "-";
    const hours = Math.floor(Math.abs(offset / 60)).toLocaleString(undefined, {
      minimumIntegerDigits: 2
    });
    let minutes = offset % 60;
    if (minutes < 0) minutes += 60;
    minutes = Math.abs(Math.round(minutes));
    return `${sign}${hours}${minutes.toLocaleString(undefined, {
      minimumIntegerDigits: 2
    })}`;
  }

  @computed
  get isDateTooEarly() {
    return this.finalDate && this.finalDate < new Date(Date.now() + ms("12h"));
  }

  @computed
  get isDateTooLate() {
    if (!this.finalDate) return false;
    return this.finalDate > this.maxDate;
  }

  @computed
  get finalDate() {
    if (!this.date || !this.time) return null;
    const date = format(this.date, "yyyy-MM-dd");
    const time = format(this.time, "HH:mm:ss");
    return new Date(`${date}T${time}${this.offset}`);
  }

  setDate(date: Date) {
    this.date = date;
  }

  setTime(time: Date) {
    this.time = time;
  }

  setOffset(offsetInMinutes: number) {
    this.offsetInMinutes = offsetInMinutes;
  }

  render() {
    return (
      <>
        <ReactDatePickerStyles />
        <React.Suspense fallback={null}>
          <FormContainer>
            <InputGroup style={{ width: 120, fontSize: "14px" }}>
              <StyledDatePicker
                onChange={(date: any) => this.setDate(date)}
                minDate={new Date()}
                maxDate={this.maxDate}
                selected={this.date}
                dateFormat="MMM d, yyyy"
                style={{ fontSize: "14px" }}
              />
            </InputGroup>
            <Spacer inline />
            <InputGroup style={{ width: 90, fontSize: "14px" }}>
              <StyledDatePicker
                showTimeSelect
                showTimeSelectOnly
                onChange={(time: any) => this.setTime(time)}
                dateFormat="h:mm a"
                selected={this.time}
                style={{ fontSize: "14px" }}
              />
            </InputGroup>
            <Spacer inline />
            <TimezoneSelect
              referenceDate={this.date || new Date()}
              onOffsetChange={offset => this.setOffset(offset)}
              onTimezoneChange={timezone =>
                this.props.onTimezoneChange(timezone)
              }
              defaultTimezone={this.props.defaultTimezone}
            />
          </FormContainer>
        </React.Suspense>
        {this.isDateTooEarly && (
          <Error>
            Expiration date must be more than 12 hours in the future.
          </Error>
        )}
        {this.isDateTooLate && (
          <Error>
            Due to Augur's planned V2 launch, the expiration date cannot be
            after September 15, 2019.
          </Error>
        )}
      </>
    );
  }
}
