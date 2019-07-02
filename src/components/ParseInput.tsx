import React, { useState, useEffect } from "react";

type Renderer<T> = (val: T | undefined) => string;
type Parser<T> = (raw: string) => T | undefined;

type Component =
  | string
  | React.FunctionComponent<any>
  | React.ComponentClass<any>;

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

interface Props<T>
  extends Omit<React.HTMLProps<HTMLInputElement>, "onChange" | "value"> {
  value?: T;
  render: Renderer<T>;
  parse: Parser<T>;
  onChange: (val: T | undefined) => void;
  onError?: (error: any) => void;
  component?: Component;
}

export default function ParseInput<T>({
  value,
  onChange,
  render,
  parse,
  component,
  onError,
  ...props
}: Props<T>) {
  const Component: Component = component ? component : "input";
  let defaultRawValue: string = "";
  if (value) defaultRawValue = render(value);
  const [raw, setRaw] = useState<string>(defaultRawValue);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (onError) onError(error);
  }, [error]);
  useEffect(() => {
    let parsedValue;
    try {
      parsedValue = parse(raw);
    } catch (e) {}
    if (parsedValue && render(value) === render(parsedValue)) return;
    setRaw(render(value));
  }, [render(value)]);

  return (
    <Component
      type="text"
      value={raw}
      title={error}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        setRaw(e.target.value);
        try {
          const val = parse(e.target.value);
          onChange(val);
          setError(null);
        } catch (e) {
          setError(e.message);
        }
      }}
      {...props}
    />
  );
}

export const BigNumberInput = {};
