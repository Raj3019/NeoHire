'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Undo, Redo } from 'lucide-react';

/**
 * Rich Text Editor using TipTap (React 19 compatible)
 */
export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = '',
  className = '',
  name = ''
}) {
  // Track active formats in React state for reliable re-renders
  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    bulletList: false,
    orderedList: false,
  });

  const updateActiveFormats = useCallback((editorInstance) => {
    if (editorInstance) {
      setActiveFormats({
        bold: editorInstance.isActive('bold'),
        italic: editorInstance.isActive('italic'),
        bulletList: editorInstance.isActive('bulletList'),
        orderedList: editorInstance.isActive('orderedList'),
      });
    }
  }, []);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none min-h-[160px] p-3 focus:outline-none',
      },
    },
    onUpdate: ({ editor: e }) => {
      const html = e.getHTML();
      if (onChange) {
        onChange({ target: { name, value: html } });
      }
      updateActiveFormats(e);
    },
    onSelectionUpdate: ({ editor: e }) => {
      updateActiveFormats(e);
    },
    onTransaction: ({ editor: e }) => {
      updateActiveFormats(e);
    },
    onCreate: ({ editor: e }) => {
      updateActiveFormats(e);
    },
  });

  if (!editor) {
    return (
      <div className="min-h-[180px] bg-gray-100 dark:bg-zinc-800 animate-pulse border-2 border-neo-black dark:border-white rounded" />
    );
  }

  // Toolbar button with VERY visible active state
  const ToolbarButton = ({ onClick, isActive, children, title }) => (
    <button
      type="button"
      onClick={() => {
        onClick();
        // Force update after click
        setTimeout(() => updateActiveFormats(editor), 10);
      }}
      title={title}
      className={`w-9 h-9 flex items-center justify-center rounded transition-all duration-100
        ${isActive
          ? 'bg-orange-500 text-white ring-2 ring-orange-300 ring-offset-1 shadow-lg transform -translate-y-0.5'
          : 'bg-white dark:bg-zinc-700 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-zinc-600 hover:bg-yellow-400 hover:text-black'
        }`}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div className="w-px h-6 bg-gray-300 dark:bg-zinc-600 mx-1" />
  );

  return (
    <div className={`rich-text-editor ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 dark:bg-zinc-800 border-2 border-b-0 border-neo-black dark:border-white rounded-t">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={activeFormats.bold}
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" strokeWidth={activeFormats.bold ? 3 : 2} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={activeFormats.italic}
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" strokeWidth={activeFormats.italic ? 3 : 2} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={activeFormats.bulletList}
          title="Bullet List"
        >
          <List className="w-4 h-4" strokeWidth={activeFormats.bulletList ? 3 : 2} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={activeFormats.orderedList}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" strokeWidth={activeFormats.orderedList ? 3 : 2} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          isActive={false}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" strokeWidth={2} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          isActive={false}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" strokeWidth={2} />
        </ToolbarButton>

        <span className="ml-auto text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Format
        </span>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-zinc-800 border-2 border-neo-black dark:border-white rounded-b overflow-hidden">
        <EditorContent
          editor={editor}
          className="[&_.ProseMirror]:min-h-[160px] [&_.ProseMirror]:max-h-[300px] [&_.ProseMirror]:overflow-y-auto
            [&_.ProseMirror]:p-3 [&_.ProseMirror]:font-mono [&_.ProseMirror]:text-sm
            [&_.ProseMirror]:text-black [&_.ProseMirror]:dark:text-white
            [&_.ProseMirror:focus]:outline-none [&_.ProseMirror:focus]:ring-2 [&_.ProseMirror:focus]:ring-neo-blue
            [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:ml-5 [&_.ProseMirror_ul]:my-2
            [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:ml-5 [&_.ProseMirror_ol]:my-2
            [&_.ProseMirror_li]:my-0.5
            [&_.ProseMirror_p]:my-1
            [&_.ProseMirror_strong]:font-bold
            [&_.ProseMirror_em]:italic"
        />
      </div>
    </div>
  );
}
