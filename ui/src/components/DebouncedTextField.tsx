import { TextField, TextFieldProps } from "@mui/material";
import { useEffect, useRef, useState } from "react";

type DebouncedTextFieldProps = TextFieldProps & {
  debounceMs?: number;
};

export default function DebouncedTextField({
  value,
  onChange,
  debounceMs = 300,
  ...props
}: DebouncedTextFieldProps) {
  const [localValue, setLocalValue] = useState(value ?? "");
  const timeoutRef = useRef<number | null>(null);

  // Keep local state in sync if parent value changes
  useEffect(() => {
    setLocalValue(value ?? "");
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      onChange?.({
        ...e,
        target: {
          ...e.target,
          value: newValue,
        },
      } as React.ChangeEvent<HTMLInputElement>);
    }, debounceMs);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return <TextField {...props} value={localValue} onChange={handleChange} />;
}
