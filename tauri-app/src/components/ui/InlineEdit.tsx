import { ReactNode, useEffect, useRef } from "react";

export default function InlineEdit({
  editView,
  readView,
  onConfirm,
  editing,
  setEditing,
}: {
  editView: ReactNode;
  readView: ReactNode;
  onConfirm: () => void;
  editing: boolean;
  setEditing: (editing: boolean) => void;
}) {
  const editViewRef = useRef<any>(null);

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, false);
    return () => {
      document.removeEventListener("click", handleClickOutside, false);
    };
  }, [editing]);

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
          className="hover:bg-primary-foreground rounded-lg p-1"
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
