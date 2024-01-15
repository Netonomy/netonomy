import { ReactNode, useEffect, useRef, useState } from "react";

export default function InlineEdit({
  editView,
  readView,
  onConfirm,
}: {
  editView: ReactNode;
  readView: ReactNode;
  onConfirm: () => void;
}) {
  const editViewRef = useRef<any>(null);

  const [editing, setEditing] = useState(false);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, []);

  const handleClickOutside = (event: any) => {
    if (editViewRef.current && !editViewRef.current.contains(event.target)) {
      setEditing(false);
      onConfirm();
    }
  };

  return (
    <div className="transition-all">
      {editing ? (
        <div ref={editViewRef}>{editView}</div>
      ) : (
        <div
          className="hover:bg-primary-foreground p-1 rounded-lg"
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
