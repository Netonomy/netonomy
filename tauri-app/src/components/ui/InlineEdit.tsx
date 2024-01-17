import { ReactNode, useEffect, useRef, useState } from "react";
import { InputProps } from "./input";

export default function InlineEdit({
  editView,
  readView,
  onConfirm,
  defaultValue,
  turnOnEditing,
}: {
  editView: ({ fieldProps }: { fieldProps: InputProps }) => ReactNode;
  readView: ReactNode;
  onConfirm: (value: string) => void;
  defaultValue: string;
  turnOnEditing?: boolean;
}) {
  const editViewRef = useRef<any>(null);
  const [value, setValue] = useState(defaultValue || "");
  const valueRef = useRef<string>(""); // Ref to store the current value
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    valueRef.current = value; // Update the ref whenever value changes
  }, [value, defaultValue]);

  useEffect(() => {
    if (turnOnEditing !== undefined && turnOnEditing) {
      setEditing(true);
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
              onChange: (e) => setValue(e.target.value),
              autoFocus: true,
            },
          })}
        </div>
      ) : (
        <div
          className="hover:bg-card rounded-lg p-2"
          onClick={() => {
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
