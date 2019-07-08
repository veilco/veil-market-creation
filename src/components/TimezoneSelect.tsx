import React, { useEffect, useMemo } from "react";
import Select from "react-select";
import { useState } from "react";
import { colors, basePadding } from "src/styles";
import { listTimeZones, getUTCOffset, findTimeZone } from "timezone-support";
import find from "lodash/find";
import sortBy from "lodash/sortBy";
import { List } from "react-virtualized";
import memoize from "lodash/memoize";

interface Props {
  onOffsetChange: (offset: number) => void;
  onTimezoneChange: (timezone: string) => void;
  defaultTimezone: string;
  referenceDate: Date;
}
// Takes a minute offset and returns (GMT-07:00)
// This is memoized because Number.prototype.toLocaleString is slow af
// getOptions without this memoized: 1000ms
// With memoization: 10ms
const offsetToString = memoize((offset: number) => {
  const sign = offset < 0 ? "+" : "-";
  const hours = Math.floor(Math.abs(offset / 60)).toLocaleString("en-US", {
    minimumIntegerDigits: 2
  });
  let minutes = offset % 60;
  if (minutes < 0) minutes += 60;
  // NOTE: sometimes, in some browsers, minutes here is negative 0, which
  // sometimes results in `toLocaleString` tacking on a negative sign
  minutes = Math.abs(Math.round(minutes));
  return `(GMT${sign}${hours}:${minutes.toLocaleString("en-US", {
    minimumIntegerDigits: 2
  })})`;
});
const timezones = listTimeZones().map(name => findTimeZone(name));

function getOptions(referenceDate: Date) {
  const options = sortBy(
    timezones.map(timezone => {
      const offset = getUTCOffset(referenceDate, timezone);
      const name = timezone.name;
      const offsetString = offsetToString(offset.offset);
      return {
        // value is searchable, so concat all of the fields
        value: name + " " + offset.abbreviation + " " + offsetString,
        offset: offset.offset,
        offsetString,
        name
      };
    }),
    option => -option.offset
  );
  return options;
}

function MenuList(props: any) {
  return (
    <List
      style={{ width: 350, height: 200 }}
      width={350}
      height={200}
      rowCount={props.children.length || 0}
      rowHeight={34}
      rowRenderer={({ key, index, style }) => (
        <div key={key} style={style}>
          {props.children[index]}
        </div>
      )}
    />
  );
}

export default function TimezoneSelect({
  onOffsetChange,
  onTimezoneChange,
  defaultTimezone,
  referenceDate
}: Props) {
  const currentTimezone =
    defaultTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;

  const options = useMemo(() => {
    return getOptions(referenceDate || new Date());
  }, [referenceDate]);
  const [name, setName] = useState(currentTimezone);
  const value = find(options, opt => opt.name === name);
  useEffect(() => {
    let timezone = findTimeZone(name);
    if (!timezone)
      timezone = findTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    if (onTimezoneChange) onTimezoneChange(name);
    if (onOffsetChange)
      onOffsetChange(getUTCOffset(referenceDate, timezone).offset);
  }, [referenceDate, name]);
  return (
    <Select
      components={{ MenuList }}
      styles={{
        control: base => ({
          ...base,
          border: `2px solid ${colors.borderGrey}`,
          borderRadius: 4,
          backgroundColor: colors.white,
          padding: `${basePadding / 2}px 0`,
          "&:hover": { borderColor: colors.grey },
          width: 300,
          fontSize: "14px"
        }),
        menu: base => ({
          ...base,
          width: 330
        }),
        option: base => ({
          ...base,
          whiteSpace: "nowrap",
          textOverflow: "ellipsis"
        })
      }}
      getOptionLabel={opt =>
        (
          <span>
            {opt.name}{" "}
            <small style={{ opacity: 0.7 }}>{opt.offsetString}</small>
          </span>
        ) as any
      }
      options={options}
      value={value}
      onChange={(val: any) => setName(val.name)}
    />
  );
}
