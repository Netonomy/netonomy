import {
  useEditor,
  EditorContent,
  FloatingMenu,
  BubbleMenu,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

// define your extension array
const extensions = [StarterKit];

const content = "<p>Hello World!</p>";

export default function NoteEditorPage() {
  const editor = useEditor({
    extensions,
    content,
  });

  return (
    <div className="h-screen w-screen p-10 flex">
      <div className="flex flex-1 w-full bg-white rounded-lg shadow-lg overflow-hidden  flex-col items-center justify-center dark:bg-black relative">
        {editor && (
          <>
            <EditorContent editor={editor} />
            <FloatingMenu editor={editor}>
              This is the floating menu
            </FloatingMenu>
            <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
          </>
        )}
      </div>
    </div>
  );
}
