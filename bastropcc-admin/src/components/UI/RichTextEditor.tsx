import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const toggleBtnClass = (isActive: boolean) => 
    `p-2 rounded hover:bg-gray-200 transition-colors ${isActive ? 'bg-gray-200 text-primary' : 'text-gray-600'}`;

  return (
    <div className="border-b border-gray-300 p-2 flex flex-wrap gap-1 bg-gray-50 rounded-t-md">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={toggleBtnClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={toggleBtnClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toggleBtnClass(editor.isActive('heading', { level: 2 }))}
        title="Heading 2"
      >
        <Heading1 className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={toggleBtnClass(editor.isActive('heading', { level: 3 }))}
        title="Heading 3"
      >
        <Heading2 className="w-4 h-4" />
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={toggleBtnClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={toggleBtnClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={toggleBtnClass(editor.isActive('blockquote'))}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none max-w-none',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className="border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
