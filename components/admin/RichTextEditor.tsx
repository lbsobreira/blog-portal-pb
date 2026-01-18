"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Youtube from "@tiptap/extension-youtube";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect } from "react";

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        width: 640,
        height: 360,
      }),
    ],
    content,
    immediatelyRender: false, // Fix SSR hydration issues in Next.js
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[300px] max-w-none p-4",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addYouTubeVideo = () => {
    const url = prompt("Enter YouTube URL:");
    if (url) {
      editor.commands.setYoutubeVideo({ src: url });
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-600 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.commands.toggleBold();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("bold") ? "bg-gray-300 dark:bg-gray-600 font-bold" : ""
          }`}
          title="Bold (Ctrl+B) - Select text first"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.commands.toggleItalic();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("italic") ? "bg-gray-300 dark:bg-gray-600 italic" : ""
          }`}
          title="Italic (Ctrl+I) - Select text first"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.commands.toggleStrike();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("strike") ? "bg-gray-300 dark:bg-gray-600" : ""
          }`}
          title="Strikethrough - Select text first"
        >
          <s>S</s>
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Headings */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-500 text-white font-bold"
              : ""
          }`}
          title="Heading 2 (Large)"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-blue-500 text-white font-bold"
              : ""
          }`}
          title="Heading 3 (Medium)"
        >
          H3
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Lists */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBulletList().run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("bulletList") ? "bg-green-500 text-white" : ""
          }`}
          title="Bullet List"
        >
          • List
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleOrderedList().run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("orderedList") ? "bg-green-500 text-white" : ""
          }`}
          title="Numbered List"
        >
          1. List
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Code */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.commands.toggleCode();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("code") ? "bg-pink-500 text-white" : ""
          }`}
          title="Inline Code - Select text first, then click"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("codeBlock") ? "bg-gray-700 text-white" : ""
          }`}
          title="Code Block (creates dark box)"
        >
          {"{ }"}
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Blockquote */}
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBlockquote().run();
          }}
          className={`px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive("blockquote") ? "bg-blue-400 text-white" : ""
          }`}
          title="Blockquote (blue left border)"
        >
          "
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* YouTube */}
        <button
          type="button"
          onClick={addYouTubeVideo}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Add YouTube Video"
        >
          📺 YouTube
        </button>

        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"></div>

        {/* Undo/Redo */}
        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          title="Undo"
        >
          ↶
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="px-3 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
          title="Redo"
        >
          ↷
        </button>
      </div>

      {/* Editor */}
      <div className="bg-white dark:bg-gray-800">
        <EditorContent editor={editor} />
      </div>

      {/* Helper Text */}
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-300 dark:border-gray-600 p-3 text-xs text-gray-600 dark:text-gray-400 space-y-2">
        <div className="font-semibold text-gray-700 dark:text-gray-300">💡 How to use:</div>
        <div className="grid grid-cols-2 gap-2">
          <div><strong>H2/H3:</strong> Click button, then type (or use # ## at line start)</div>
          <div><strong>&lt;/&gt; (inline code):</strong> Select text, click button (or use `text`)</div>
          <div><strong>&#123; &#125; (code block):</strong> Click button, then type code</div>
          <div><strong>" (quote):</strong> Click button, then type quote</div>
          <div><strong>Lists:</strong> Click button, then type items (Enter for new item)</div>
          <div><strong>YouTube:</strong> Click button, paste URL</div>
        </div>
        <div className="text-gray-500 dark:text-gray-500 italic">
          Tip: Headings, code blocks, quotes, and lists are "block" elements - click the button first, then type.
        </div>
      </div>
    </div>
  );
}
