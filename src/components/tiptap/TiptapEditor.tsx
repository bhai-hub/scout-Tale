
'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image'; // Renamed to avoid conflict
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, Pilcrow, Undo, Redo,
  Palette, Highlighter, AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, Upload, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import React, { useCallback, useState, useRef } from 'react';

interface TiptapEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  placeholder?: string;
  onImageUpload?: (file: File) => Promise<string | undefined>;
}

const TiptapEditor = ({ content, onChange, placeholder, onImageUpload }: TiptapEditorProps) => {
  const [isEditorImageUploading, setIsEditorImageUploading] = useState(false);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      ImageExtension.configure({
        inline: false,
        allowBase64: !!onImageUpload,
      }),
      Placeholder.configure({ placeholder: placeholder || 'Start writing...' }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          'prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-5 focus:outline-none min-h-[250px] p-4 border border-input rounded-md bg-background',
      },
      handlePaste: (view, event, slice) => {
        if (!onImageUpload) return false;

        const items = Array.from(event.clipboardData?.items || []);
        for (const item of items) {
          if (item.type.indexOf('image') === 0) {
            const file = item.getAsFile();
            if (file) {
              handleFileUpload(file);
              return true;
            }
          }
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!onImageUpload || moved) return false;

        const files = Array.from(event.dataTransfer?.files || []);
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault();
            handleFileUpload(file);
            return true;
          }
        }
        return false;
      },
    },
  });

  const [imageUrlInput, setImageUrlInput] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (onImageUpload && editor) {
      setIsEditorImageUploading(true);
      try {
        const uploadedUrl = await onImageUpload(file);
        if (uploadedUrl) {
          editor.chain().focus().setImage({ src: uploadedUrl }).run();
        }
      } catch (error) {
        console.error("Error uploading image to editor:", error);
        // Toast notification for error is handled in AdminUploadPage
      } finally {
        setIsEditorImageUploading(false);
      }
    }
  };
  
  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const addImageFromUrl = useCallback(async () => {
    if (imageUrlInput && editor) {
      editor.chain().focus().setImage({ src: imageUrlInput }).run();
      setImageUrlInput('');
    }
  }, [editor, imageUrlInput]);

  const setLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      setLinkUrl('');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl, target: '_blank' }).run();
    setLinkUrl('');
  }, [editor, linkUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1 p-2 border border-input rounded-md bg-card">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          aria-label="Toggle bold"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          aria-label="Toggle italic"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('underline')}
          onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
          aria-label="Toggle underline"
        >
          <UnderlineIcon className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          aria-label="Toggle strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          aria-label="Toggle H1"
        >
          <Heading1 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          aria-label="Toggle H2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
         size="sm"
         pressed={editor.isActive('heading', { level: 3 })}
         onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
         aria-label="Toggle H3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>
        <Toggle
         size="sm"
         pressed={editor.isActive('paragraph')}
         onPressedChange={() => editor.chain().focus().setParagraph().run()}
         aria-label="Toggle paragraph"
        >
          <Pilcrow className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          aria-label="Toggle bullet list"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          aria-label="Toggle ordered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          aria-label="Toggle blockquote"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

         <Separator orientation="vertical" className="h-6 mx-1" />
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Set link">
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Enter URL"
                value={linkUrl || editor.getAttributes('link').href || ''}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="h-8"
              />
              <Button size="sm" onClick={setLink} className="h-8">Set</Button>
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Add image" disabled={isEditorImageUploading}>
              {isEditorImageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-2 space-y-2">
            {onImageUpload && (
              <>
                <Button 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()} 
                  className="w-full h-8"
                  disabled={isEditorImageUploading}
                >
                  {isEditorImageUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" /> Upload from Computer
                    </>
                  )}
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={onFileChange}
                  className="hidden"
                  accept="image/*"
                  disabled={isEditorImageUploading}
                />
                <Separator />
              </>
            )}
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="Or paste image URL"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                className="h-8"
                disabled={isEditorImageUploading}
              />
              <Button size="sm" onClick={addImageFromUrl} className="h-8" disabled={isEditorImageUploading}>Add</Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              You can also paste images directly into the editor or drag & drop.
            </p>
          </PopoverContent>
        </Popover>
        
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          aria-label="Add horizontal rule"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Text color">
              <Palette className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-auto">
            <input
              type="color"
              onInput={(event) => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
              value={editor.getAttributes('textStyle').color || '#000000'}
              className="w-full h-8 border-none cursor-pointer"
              title="Text color"
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" aria-label="Highlight color">
              <Highlighter className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-1 w-auto">
             <input
              type="color"
              onInput={(event) => editor.chain().focus().toggleHighlight({ color: (event.target as HTMLInputElement).value }).run()}
              value={editor.getAttributes('highlight').color || '#ffff00'}
              className="w-full h-8 border-none cursor-pointer"
              title="Highlight color"
            />
            <Button variant="outline" size="xs" className="w-full mt-1" onClick={() => editor.chain().focus().unsetHighlight().run()}>
              Remove highlight
            </Button>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'left' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
          aria-label="Align left"
        >
          <AlignLeft className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'center' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
          aria-label="Align center"
        >
          <AlignCenter className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'right' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
          aria-label="Align right"
        >
          <AlignRight className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive({ textAlign: 'justify' })}
          onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
          aria-label="Align justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost" size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />
      {editor && (
        <>
          <BubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-background border border-input rounded-md shadow-lg p-1 flex gap-1"
          >
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive('bold') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Bold
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive('italic') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Italic
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={editor.isActive('strike') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Strike
            </Button>
             <Button
              size="sm" variant="ghost"
              onClick={setLink}
              className={editor.isActive('link') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Link
            </Button>
          </BubbleMenu>
          
          <FloatingMenu
            editor={editor}
            tippyOptions={{ duration: 100 }}
            className="bg-background border border-input rounded-md shadow-lg p-1 flex gap-1"
          >
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              H1
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              H2
            </Button>
            <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Bullet List
            </Button>
             <Button
              size="sm" variant="ghost"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active bg-accent text-accent-foreground' : ''}
            >
              Quote
            </Button>
          </FloatingMenu>
        </>
      )}
    </div>
  );
};

export default TiptapEditor;
