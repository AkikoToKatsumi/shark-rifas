'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'rich-editor-body',
        'data-placeholder': placeholder || 'Descripción detallada del premio...',
      },
    },
  });

  // Sync external value changes (e.g., when loading edit data)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) return null;

  const ToolbarBtn = ({
    onClick,
    active,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'rgba(0, 242, 254, 0.18)' : 'rgba(255,255,255,0.04)',
        border: active ? '1px solid var(--primary-cyan)' : '1px solid rgba(255,255,255,0.1)',
        color: active ? 'var(--primary-cyan)' : 'var(--text-main)',
        borderRadius: '6px',
        padding: '5px 9px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        lineHeight: 1,
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '30px',
        height: '30px',
      }}
      onMouseOver={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
      onMouseOut={e => !active && (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
    >
      {children}
    </button>
  );

  const Divider = () => (
    <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
  );

  return (
    <div style={{
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: '12px',
      overflow: 'hidden',
      background: 'rgba(0,0,0,0.3)',
    }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '4px',
        padding: '8px 10px',
        background: 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        alignItems: 'center',
      }}>
        {/* Headings */}
        <ToolbarBtn
          title="Título H2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >H2</ToolbarBtn>
        <ToolbarBtn
          title="Subtítulo H3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >H3</ToolbarBtn>

        <Divider />

        {/* Text styles */}
        <ToolbarBtn
          title="Negrita"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        ><b>B</b></ToolbarBtn>
        <ToolbarBtn
          title="Cursiva"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        ><i>I</i></ToolbarBtn>
        <ToolbarBtn
          title="Subrayado"
          active={editor.isActive('underline')}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        ><u>U</u></ToolbarBtn>
        <ToolbarBtn
          title="Tachado"
          active={editor.isActive('strike')}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        ><s>S</s></ToolbarBtn>

        <Divider />

        {/* Alignment */}
        <ToolbarBtn
          title="Alinear izquierda"
          active={editor.isActive({ textAlign: 'left' })}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >≡</ToolbarBtn>
        <ToolbarBtn
          title="Centrar"
          active={editor.isActive({ textAlign: 'center' })}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >≡</ToolbarBtn>
        <ToolbarBtn
          title="Alinear derecha"
          active={editor.isActive({ textAlign: 'right' })}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >≡</ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn
          title="Lista con viñetas"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >• ≡</ToolbarBtn>
        <ToolbarBtn
          title="Lista numerada"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >1. ≡</ToolbarBtn>

        <Divider />

        {/* Block quote */}
        <ToolbarBtn
          title="Cita"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >"</ToolbarBtn>

        {/* Horizontal rule */}
        <ToolbarBtn
          title="Línea divisoria"
          active={false}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >—</ToolbarBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarBtn
          title="Deshacer"
          active={false}
          onClick={() => editor.chain().focus().undo().run()}
        >↩</ToolbarBtn>
        <ToolbarBtn
          title="Rehacer"
          active={false}
          onClick={() => editor.chain().focus().redo().run()}
        >↪</ToolbarBtn>
      </div>

      {/* Editor area */}
      <EditorContent editor={editor} />
    </div>
  );
}
