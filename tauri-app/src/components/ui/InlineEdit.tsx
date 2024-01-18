import { ReactNode, useEffect, useRef, useState } from "react";
import { InputProps } from "./input";

export default function InlineEdit({
  editView,
  readView,
  onConfirm,
  defaultValue,
  turnOnEditing,
  disabled,
}: {
  editView: ({ fieldProps }: { fieldProps: InputProps }) => ReactNode;
  readView: ReactNode;
  onConfirm: (value: string) => void;
  defaultValue: string;
  turnOnEditing?: boolean;
  disabled?: boolean;
}) {
  const editViewRef = useRef<any>(null);
  const [value, setValue] = useState(defaultValue || "");
  const valueRef = useRef<string>(""); // Ref to store the current value
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    valueRef.current = value; // Update the ref whenever value changes
  }, [value]);

  useEffect(() => {
    if (turnOnEditing !== undefined && turnOnEditing) {
      setEditing(true);
    } else if (turnOnEditing !== undefined && !turnOnEditing) {
      setEditing(false);
    }
  }, [turnOnEditing]);

  useEffect(() => {
    setValue(defaultValue || "");
  }, [defaultValue, turnOnEditing]);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [editing]);

  const handleClickOutside = (event: any) => {
    if (editViewRef.current && !editViewRef.current.contains(event.target)) {
      setEditing(false);
      onConfirm(valueRef.current);
    }
  };

  return (
    <div className="transition-all">
      {editing ? (
        <div ref={editViewRef}>
          {editView({
            fieldProps: {
              value,
              onChange: (e) => {
                setValue(e.target.value);
                valueRef.current = e.target.value;
              },
              autoFocus: true,
            },
          })}
        </div>
      ) : (
        <div
          className={`${
            !disabled && "hover:bg-card-foreground"
          } rounded-lg p-1 px-2`}
          onClick={() => {
            if (disabled) return;
            setTimeout(() => {
              setEditing(true);
            }, 0);
          }}
        >
          {readView}
        </div>
      )}
    </div>
  );
}
