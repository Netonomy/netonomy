import PageContainer from "@/components/PageContainer";
import SlashCommand from "@/components/editor/extensions/SlashCommand";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function NoteEditorPage() {
  const editor = useEditor({
    extensions: [SlashCommand, StarterKit],
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-dark max-w-none w-full outline-none focus:outline-none",
      },
    },
    content: `
    <h1>Hello</h1>
        <h2>Hello</h2>
            <h3>Hello</h3>
                <h4>Hello</h4>
    <p>
      this is a basic <em>basic</em> example of <strong>tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:
    </p>
    <ul>
      <li>
        That’s a bullet list with one …
      </li>
      <li>
        … or two list items.
      </li>
    </ul>
    <p>
      Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:
    </p>
<pre><code class="language-css">body {
  display: none;
}</code></pre>
    <p>
      I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.
    </p>
    <blockquote>
      Wow, that’s amazing. Good work, boy! 👏
      <br />
      — Mom
    </blockquote>
    `,
  });

  return (
    <PageContainer>
      <div className="flex flex-1 w-full  pl-4 overflow-hidden  flex-col items-center justify-center dark:bg-black relative">
        {editor && (
          <EditorContent
            editor={editor}
            className="h-full w-full overflow-y-auto"
          />
        )}
      </div>
    </PageContainer>
  );
}
