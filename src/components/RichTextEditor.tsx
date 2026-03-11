import { useEditor, EditorContent, Extension, Node, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link } from '@tiptap/extension-link';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import { Image as TiptapImage } from '@tiptap/extension-image';
import { Superscript } from '@tiptap/extension-superscript';
import { Subscript } from '@tiptap/extension-subscript';
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { useState, useEffect, useRef } from 'react';
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Superscript as SuperscriptIcon,
    Subscript as SubscriptIcon,
    Code,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Link as LinkIcon,
    Undo,
    Redo,
    Type,
    Highlighter,
    Image as ImageIcon,
    Video as VideoIcon,
    Minus,
    ChevronDown,
    Columns2,
    Columns3,
    Maximize,
    FileText,
    Palette,
    LayoutGrid,
    ArrowDownAz,
    Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const PAGE_GAP = '20px';

// Custom Font Size Extension
const FontSize = Extension.create({
    name: 'fontSize',
    addOptions() {
        return {
            types: ['textStyle'],
        };
    },
    addGlobalAttributes() {
        return [
            {
                types: this.options.types,
                attributes: {
                    fontSize: {
                        default: null,
                        parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
                        renderHTML: attributes => {
                            if (!attributes.fontSize) return {};
                            return { style: `font-size: ${attributes.fontSize}` };
                        },
                    },
                },
            },
        ];
    },
    addCommands() {
        return {
            setFontSize: (fontSize: string) => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize })
                    .run();
            },
            unsetFontSize: () => ({ chain }: any) => {
                return chain()
                    .setMark('textStyle', { fontSize: null })
                    .removeEmptyTextStyle()
                    .run();
            },
        };
    },
});

// Custom CodeBlock Component for NodeView
const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
    const isEditable = extension.options.editable !== false;

    return (
        <NodeViewWrapper className="code-mirror-wrapper my-6 clear-both">
            <div
                className="rounded-lg border-2 border-[#8B4513] shadow-xl overflow-hidden bg-[#1e1e1e] w-fit max-w-full mx-auto sm:mx-0"
                contentEditable={false}
            >
                <div className="flex items-center justify-between px-3 py-1.5 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                    </div>
                    <span className="text-[9px] font-mono text-[#888] font-bold uppercase tracking-widest pl-4">PYTHON HEROES EDITOR</span>
                </div>
                <CodeMirror
                    value={node.attrs.content || ''}
                    height="auto"
                    minHeight="40px"
                    extensions={[python()]}
                    onChange={(value) => isEditable && updateAttributes({ content: value })}
                    theme="dark"
                    readOnly={!isEditable}
                    editable={isEditable}
                    basicSetup={{
                        lineNumbers: true,
                        foldGutter: false,
                        dropCursor: isEditable,
                        allowMultipleSelections: false,
                        indentOnInput: isEditable,
                        highlightActiveLine: isEditable,
                    }}
                    className="text-xs font-mono"
                />
            </div>
        </NodeViewWrapper>
    );
};

const CustomCodeBlock = Node.create({
    name: 'customCodeBlock',
    group: 'block',
    atom: true, // Treat as a single unit
    draggable: true,
    defining: true,
    isolating: true,

    addAttributes() {
        return {
            content: {
                default: '',
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'pre.code-mirror-block',
                getAttrs: node => ({
                    content: (node as HTMLElement).querySelector('code')?.innerText || (node as HTMLElement).innerText || '',
                }),
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['pre', {
            class: 'code-mirror-block',
            style: 'white-space: pre-wrap; word-break: break-all;'
        }, ['code', {}, HTMLAttributes.content]];
    },

    addOptions() {
        return {
            editable: true,
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(CodeBlockComponent);
    },

    addCommands() {
        return {
            toggleCodeBlock: () => ({ commands }: any) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: { content: '' }
                });
            },
        } as any;
    },
});

// Custom Page Node
const PageNode = Node.create({
    name: 'page',
    group: 'block',
    content: 'block+',
    isolating: true,

    parseHTML() {
        return [
            { tag: 'div.page-node' },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return ['div', {
            class: 'page-node bg-white text-black shadow-sm mx-auto overflow-visible border border-gray-100',
            style: 'width: min(100%, var(--page-width, 210mm)); min-height: var(--page-height, 297mm); padding: var(--page-margin-top, 1in) var(--page-margin-right, 1in) var(--page-margin-bottom, 1in) var(--page-margin-left, 1in); box-sizing: border-box; position: relative; margin-bottom: 20px;'
        }, 0];
    },
});

// Custom Document Node
const CustomDocument = Node.create({
    name: 'doc',
    topNode: true,
    content: 'page+',
});

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    isDocumentMode?: boolean;
    pageSize?: string;
    margins?: { top: string; bottom: string; left: string; right: string; };
    onPageSizeChange?: (size: string) => void;
    onMarginsChange?: (margins: { top: string; bottom: string; left: string; right: string; }) => void;
    readOnly?: boolean;
    onScrollProgress?: (progress: number) => void;
    initialScrollPercentage?: number;
}

const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
    disabled = false,
    className
}: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
    className?: string;
}) => (
    <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        className={cn(
            "w-8 h-8 transition-colors",
            isActive ? "bg-primary/20 text-primary hover:bg-primary/30" : "text-muted-foreground hover:bg-muted",
            className
        )}
        title={title}
    >
        {children}
    </Button>
);

const FONT_FAMILIES = [
    { label: 'Sans Serif', value: 'Inter, sans-serif' },
    { label: 'Serif', value: 'serif' },
    { label: 'Monospace', value: 'monospace' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Georgia', value: 'Georgia' },
];

const FONT_SIZES = ['8pt', '10pt', '12pt', '14pt', '16pt', '18pt', '24pt', '36pt'];

const PAGE_SIZES = [
    { label: 'A4', value: 'a4' },
    { label: 'A3', value: 'a3' },
    { label: 'A5', value: 'a5' },
    { label: 'Letter', value: 'letter' },
    { label: 'Legal', value: 'legal' },
    { label: 'Executive', value: 'executive' },
    { label: 'B5', value: 'b5' },
    { label: 'Tabloid', value: 'tabloid' },
];

const PAGE_DIMENSIONS: Record<string, { width: string; minHeight: string; heightVal: string; dimLabel: string }> = {
    a4: { width: 'w-[210mm]', minHeight: 'min-h-[297mm]', heightVal: '297mm', dimLabel: '210 × 297 mm' },
    a3: { width: 'w-[297mm]', minHeight: 'min-h-[420mm]', heightVal: '420mm', dimLabel: '297 × 420 mm' },
    a5: { width: 'w-[148mm]', minHeight: 'min-h-[210mm]', heightVal: '210mm', dimLabel: '148 × 210 mm' },
    letter: { width: 'w-[8.5in]', minHeight: 'min-h-[11in]', heightVal: '11in', dimLabel: '8.5 × 11 in' },
    legal: { width: 'w-[8.5in]', minHeight: 'min-h-[14in]', heightVal: '14in', dimLabel: '8.5 × 14 in' },
    executive: { width: 'w-[7.25in]', minHeight: 'min-h-[10.5in]', heightVal: '10.5in', dimLabel: '7.25 × 10.5 in' },
    b5: { width: 'w-[176mm]', minHeight: 'min-h-[250mm]', heightVal: '250mm', dimLabel: '176 × 250 mm' },
    tabloid: { width: 'w-[11in]', minHeight: 'min-h-[17in]', heightVal: '17in', dimLabel: '11 × 17 in' },
};

const MARGINS = [
    { label: 'None', value: 'none', size: '0in' },
    { label: 'Extra Narrow', value: 'extra-narrow', size: '0.25in' },
    { label: 'Narrow', value: 'narrow', size: '0.5in' },
    { label: 'Moderate', value: 'moderate', size: '0.75in' },
    { label: 'Normal', value: 'normal', size: '1in' },
    { label: 'Wide', value: 'wide', size: '1.5in' },
    { label: 'Extra Wide', value: 'extra-wide', size: '2in' },
];

const getMarginStyle = (margin: string) => {
    const preset = MARGINS.find(m => m.value === margin);
    if (preset) return { padding: preset.size };
    return { padding: margin };
};

const formatMargin = (val: string | undefined): string => {
    if (!val) return '1in';
    const trimmed = val.trim();
    if (/^\d*(\.\d+)?$/.test(trimmed)) return `${trimmed}in`;
    return trimmed;
};

const RichTextEditor = ({
    content,
    onChange,
    placeholder,
    isDocumentMode = false,
    pageSize = 'a4',
    margins,
    onPageSizeChange,
    onMarginsChange,
    readOnly = false,
    onScrollProgress,
    initialScrollPercentage = 0
}: RichTextEditorProps) => {
    const [pageCount, setPageCount] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                document: false,
                codeBlock: false, // Disable default codeBlock
                heading: { levels: [1, 2, 3] },
            }),
            CustomDocument,
            PageNode,
            CustomCodeBlock.configure({
                editable: !readOnly,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline cursor-pointer',
                },
            }),
            Placeholder.configure({
                placeholder: placeholder || 'Start typing...',
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            TextStyle,
            FontFamily,
            FontSize,
            Color,
            Highlight.configure({ multicolor: true }),
            Superscript,
            Subscript,
            TiptapImage.configure({
                HTMLAttributes: {
                    class: 'rounded-lg border border-border max-w-full h-auto my-4',
                },
            }),
        ],
        content: content,
        onUpdate: ({ editor }) => {
            if (!readOnly) onChange(editor.getHTML());
        },
        editable: !readOnly,
        editorProps: {
            attributes: {
                class: cn(
                    "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px]",
                    isDocumentMode
                        ? cn(
                            PAGE_DIMENSIONS[pageSize]?.width || 'w-[210mm]',
                            PAGE_DIMENSIONS[pageSize]?.minHeight || 'min-h-[297mm]',
                            "bg-transparent relative mx-auto"
                        )
                        : "p-4 font-mono text-xs text-black"
                ),
                ...(isDocumentMode ? {
                    style: `--page-margin-top: ${margins?.top || '1in'}; --page-margin-bottom: ${margins?.bottom || '1in'}; --page-margin-left: ${margins?.left || '1in'}; --page-margin-right: ${margins?.right || '1in'}; --page-width: ${PAGE_DIMENSIONS[pageSize]?.width || '210mm'}; --page-height: ${PAGE_DIMENSIONS[pageSize]?.heightVal || '297mm'};`
                } : {}),
            },
        },
    });

    useEffect(() => {
        if (editor) {
            editor.setOptions({
                editorProps: {
                    attributes: {
                        class: cn(
                            "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[400px]",
                            isDocumentMode
                                ? cn(
                                    "bg-transparent relative mx-auto",
                                    PAGE_DIMENSIONS[pageSize]?.width || 'w-[210mm]',
                                    PAGE_DIMENSIONS[pageSize]?.minHeight || 'min-h-[297mm]'
                                )
                                : "p-4 font-mono text-xs text-black"
                        ),
                        ...(isDocumentMode ? {
                            style: `--page-margin-top: ${formatMargin(margins?.top)}; --page-margin-bottom: ${formatMargin(margins?.bottom)}; --page-margin-left: ${formatMargin(margins?.left)}; --page-margin-right: ${formatMargin(margins?.right)}; --page-width: ${PAGE_DIMENSIONS[pageSize]?.width || '210mm'}; --page-height: ${PAGE_DIMENSIONS[pageSize]?.heightVal || '297mm'};`
                        } : {}),
                    },
                },
            });
        }
    }, [pageSize, margins, isDocumentMode, editor]);

    useEffect(() => {
        if (!editor || !isDocumentMode) return;
        const updatePageCount = () => {
            if (editor.isDestroyed || !editor.view.dom) return;
            const height = editor.view.dom.scrollHeight;
            const pageHeightVal = PAGE_DIMENSIONS[pageSize]?.heightVal || '297mm';
            let pxHeight = 1122;
            if (pageHeightVal.includes('mm')) {
                pxHeight = parseFloat(pageHeightVal) * 3.7795275591;
            } else if (pageHeightVal.includes('in')) {
                pxHeight = parseFloat(pageHeightVal) * 96;
            }
            const count = Math.max(1, Math.ceil(height / pxHeight));
            if (count !== pageCount) setPageCount(count);
        };
        const interval = setInterval(updatePageCount, 2000);
        return () => clearInterval(interval);
    }, [editor, isDocumentMode, pageSize, pageCount]);

    useEffect(() => {
        if (!editor || !isDocumentMode) return;
        const checkPagination = () => {
            if (editor.isDestroyed) return;
            if (editor.state.doc.content.size === 0) {
                editor.commands.setContent('<div class="page-node"><p></p></div>');
                return;
            }
            const { view } = editor;
            const pageNodes = view.dom.querySelectorAll('.page-node');
            pageNodes.forEach((pageEl, index) => {
                if (pageEl.scrollHeight > pageEl.clientHeight + 1) {
                    const pageNode = editor.state.doc.child(index);
                    if (pageNode.childCount > 1) {
                        const lastNode = pageNode.lastChild;
                        let pagePos = 0;
                        for (let i = 0; i < index; i++) {
                            pagePos += editor.state.doc.child(i).nodeSize;
                        }
                        const lastNodePos = pagePos + 1 + pageNode.content.size - lastNode!.nodeSize;
                        const hasNextPage = index < editor.state.doc.childCount - 1;
                        if (hasNextPage) {
                            const nextPagePos = pagePos + pageNode.nodeSize + 1;
                            const content = lastNode!.toJSON();
                            editor.chain()
                                .deleteRange({ from: lastNodePos, to: lastNodePos + lastNode!.nodeSize })
                                .insertContentAt(nextPagePos, content)
                                .run();
                        } else {
                            const content = lastNode!.toJSON();
                            editor.chain()
                                .deleteRange({ from: lastNodePos, to: lastNodePos + lastNode!.nodeSize })
                                .insertContentAt(editor.state.doc.content.size, {
                                    type: 'page',
                                    content: [content]
                                })
                                .run();
                        }
                    }
                }
            });
        };
        const interval = setInterval(checkPagination, 1000);
        return () => clearInterval(interval);
    }, [editor, isDocumentMode]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = target;
        const maxScroll = scrollHeight - clientHeight;
        const progress = maxScroll > 0 ? Math.round((scrollTop / maxScroll) * 100) : 100;

        // Notify parent component of scroll progress
        if (onScrollProgress && isDocumentMode) {
            onScrollProgress(progress);
        }

        // Page tracking for document mode
        if (isDocumentMode) {
            const pageHeightVal = PAGE_DIMENSIONS[pageSize]?.heightVal || '297mm';
            let pxHeight = 1122;
            if (pageHeightVal.includes('mm')) {
                pxHeight = parseFloat(pageHeightVal) * 3.7795275591;
            } else if (pageHeightVal.includes('in')) {
                pxHeight = parseFloat(pageHeightVal) * 96;
            }
            const scrollMid = scrollTop + (clientHeight / 2);
            const current = Math.max(1, Math.ceil(scrollMid / pxHeight));
            if (current !== currentPage) setCurrentPage(current);
        }
    };

    // Restore scroll position
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (isDocumentMode && initialScrollPercentage > 0 && scrollContainerRef.current) {
            // Small timeout to allow layout to settle
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    const { scrollHeight, clientHeight } = scrollContainerRef.current;
                    const maxScroll = scrollHeight - clientHeight;
                    if (maxScroll > 0) {
                        scrollContainerRef.current.scrollTop = (initialScrollPercentage / 100) * maxScroll;
                    }
                }
            }, 50);
        }
    }, [isDocumentMode, initialScrollPercentage, pageCount, editor]);

    if (!editor) return null;

    const addImage = () => {
        const url = window.prompt('Enter image URL');
        if (url) editor.chain().focus().setImage({ src: url }).run();
    };

    const addVideo = () => {
        const url = window.prompt('Enter video URL');
        if (!url) return;
        const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/);
        if (ytMatch) {
            editor.chain().focus().insertContent(
                `<div data-video-embed="true" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:16px 0;border-radius:8px;"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0;border-radius:8px;" allowfullscreen></iframe></div>`
            ).run();
            return;
        }
        editor.chain().focus().insertContent(`<video controls style="max-width:100%;border-radius:8px;margin:16px 0;" src="${url}"></video>`).run();
    };

    const insertPageBreak = () => {
        editor.chain().focus().insertContent(
            `<div class="page-break" style="page-break-after: always; break-after: page; height: 1px; margin: 24px 0; background: repeating-linear-gradient(90deg, #ccc 0, #ccc 5px, transparent 5px, transparent 10px);"></div><p></p>`
        ).run();
    };

    return (
        <div className={cn(
            "rounded-xl overflow-hidden flex flex-col transition-all duration-300",
            readOnly ? "bg-transparent border-none" : cn("border border-emerald-500/10", isDocumentMode ? "bg-slate-950" : "bg-muted/30")
        )}>
            {!readOnly && (
                <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/20 border-b border-border sticky top-0 z-20 backdrop-blur-sm">
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-4 h-4" /></ToolbarButton>
                    </div>
                    <div className="flex items-center gap-1 border-r border-border pr-1 mr-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-mono gap-1">
                                    <Palette className="w-3 h-3" />
                                    {FONT_FAMILIES.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || 'Font'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[150px]">
                                <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground">Font Family</DropdownMenuLabel>
                                {FONT_FAMILIES.map(f => (
                                    <DropdownMenuItem key={f.value} onClick={() => editor.chain().focus().setFontFamily(f.value).run()} className={cn("text-xs", editor.isActive('textStyle', { fontFamily: f.value }) && "bg-primary/10 text-primary")}>
                                        {f.label}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-mono gap-1">
                                    {FONT_SIZES.find(s => editor.isActive('textStyle', { fontSize: s })) || 'Size'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="min-w-[80px]">
                                {FONT_SIZES.map(s => (
                                    <DropdownMenuItem key={s} onClick={() => (editor.chain().focus() as any).setFontSize(s).run()} className={cn("text-xs", editor.isActive('textStyle', { fontSize: s }) && "bg-primary/10 text-primary")}>
                                        {s}
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => (editor.chain().focus() as any).unsetFontSize().run()} className="text-xs">
                                    Default (Standard)
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Bold"><Bold className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italic"><Italic className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Underline"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Strikethrough"><Strikethrough className="w-4 h-4" /></ToolbarButton>
                    </div>
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleSuperscript().run()} isActive={editor.isActive('superscript')} title="Superscript"><SuperscriptIcon className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleSubscript().run()} isActive={editor.isActive('subscript')} title="Subscript"><SubscriptIcon className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} isActive={editor.isActive('code')} title="Inline Code"><Code className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('customCodeBlock')} title="Code Editor Block" className="text-emerald-500"><Terminal className="w-4 h-4" /></ToolbarButton>
                    </div>
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Left"><AlignLeft className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Center"><AlignCenter className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Right"><AlignRight className="w-4 h-4" /></ToolbarButton>
                    </div>
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Bullets"><List className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Numbers"><ListOrdered className="w-4 h-4" /></ToolbarButton>
                    </div>
                    <div className="flex items-center gap-0.5 border-r border-border pr-1 mr-1">
                        <ToolbarButton onClick={() => {
                            const url = window.prompt('Enter URL');
                            if (url) editor.chain().focus().setLink({ href: url }).run();
                        }} isActive={editor.isActive('link')} title="Link"><LinkIcon className="w-4 h-4" /></ToolbarButton>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-mono gap-1 text-muted-foreground hover:text-primary">
                                    <ChevronDown className="w-3 h-3" /> Insert
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-[160px]">
                                <DropdownMenuItem onClick={addImage} className="text-xs gap-2"><ImageIcon className="w-3.5 h-3.5" /> Image</DropdownMenuItem>
                                <DropdownMenuItem onClick={addVideo} className="text-xs gap-2"><VideoIcon className="w-3.5 h-3.5" /> Video</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<div style="column-count:2;column-gap:24px;margin:16px 0;"><p>Column 1...</p><p>Column 2...</p></div>').run()} className="text-xs gap-2"><Columns2 className="w-3.5 h-3.5" /> 2-Column</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<div style="column-count:3;column-gap:24px;margin:16px 0;"><p>Col 1...</p><p>Col 2...</p><p>Col 3...</p></div>').run()} className="text-xs gap-2"><Columns3 className="w-3.5 h-3.5" /> 3-Column</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={insertPageBreak} className="text-xs gap-2 text-blue-600 font-medium"><ArrowDownAz className="w-3.5 h-3.5" /> Page Break</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Line"><Minus className="w-4 h-4" /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight().run()} isActive={editor.isActive('highlight')} title="Highlight"><Highlighter className="w-4 h-4" /></ToolbarButton>
                    </div>
                    {isDocumentMode && (
                        <div className="flex items-center gap-1">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-mono gap-1 text-primary">
                                        <FileText className="w-3 h-3" /> {PAGE_SIZES.find(ps => ps.value === pageSize)?.label}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[120px]">
                                    {PAGE_SIZES.map(ps => (
                                        <DropdownMenuItem key={ps.value} onClick={() => onPageSizeChange?.(ps.value)} className={cn("text-xs", pageSize === ps.value && "bg-primary/10 text-primary")}>{ps.label}</DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 px-2 text-[10px] font-mono gap-1 text-primary">
                                        <Maximize className="w-3 h-3" /> Margins
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-[200px] p-3">
                                    <DropdownMenuLabel className="text-[10px] uppercase font-mono text-muted-foreground mb-2">Granular Margins</DropdownMenuLabel>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground">TOP</label>
                                            <input
                                                type="text"
                                                value={margins?.top || '1in'}
                                                onChange={e => onMarginsChange?.({ ...margins!, top: e.target.value })}
                                                className="w-full h-7 px-2 text-[10px] border rounded bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground">BOTTOM</label>
                                            <input
                                                type="text"
                                                value={margins?.bottom || '1in'}
                                                onChange={e => onMarginsChange?.({ ...margins!, bottom: e.target.value })}
                                                className="w-full h-7 px-2 text-[10px] border rounded bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground">LEFT</label>
                                            <input
                                                type="text"
                                                value={margins?.left || '1in'}
                                                onChange={e => onMarginsChange?.({ ...margins!, left: e.target.value })}
                                                className="w-full h-7 px-2 text-[10px] border rounded bg-muted"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[9px] font-mono text-muted-foreground">RIGHT</label>
                                            <input
                                                type="text"
                                                value={margins?.right || '1in'}
                                                onChange={e => onMarginsChange?.({ ...margins!, right: e.target.value })}
                                                className="w-full h-7 px-2 text-[10px] border rounded bg-muted"
                                            />
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator className="my-2" />
                                    <div className="grid grid-cols-2 gap-1">
                                        <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => onMarginsChange?.({ top: '0in', bottom: '0in', left: '0in', right: '0in' })}>None</Button>
                                        <Button variant="ghost" size="sm" className="h-6 text-[9px]" onClick={() => onMarginsChange?.({ top: '1in', bottom: '1in', left: '1in', right: '1in' })}>Normal</Button>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>
            )}
            <div
                ref={scrollContainerRef}
                className={cn(
                    isDocumentMode
                        ? cn(
                            "overflow-y-auto overflow-x-hidden flex items-center justify-center",
                            readOnly ? "bg-slate-50" : "bg-slate-950"
                        )
                        : cn(
                            "flex-1 custom-scrollbar",
                            readOnly ? "p-0 overflow-visible" : "overflow-auto p-0"
                        )
                )}
                onScroll={handleScroll}
                style={isDocumentMode ? {
                    maxHeight: '70vh',
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#10b981 rgba(0,0,0,0.1)'
                } : undefined}
            >
                <style dangerouslySetInnerHTML={{
                    __html: `
                    .page-node > * { margin-left: 0 !important; margin-right: 0 !important; }
                    .page-node > p:first-child { margin-top: 0 !important; }
                    .page-node > p:last-child { margin-bottom: 0 !important; }
                    .tiptap p.is-editor-empty:first-child::before { color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none; }
                    
                    /* Mobile responsive scaling */
                    @media (max-width: 768px) {
                        .page-node {
                            width: 100% !important;
                            max-width: 100% !important;
                            margin-left: auto;
                            margin-right: auto;
                            padding: 0.15in !important;
                            font-size: 14px;
                            transform-origin: top center;
                        }
                        .page-node h1 { font-size: 1.5em !important; }
                        .page-node h2 { font-size: 1.3em !important; }
                        .page-node h3 { font-size: 1.1em !important; }
                        .page-node p { font-size: 14px !important; }
                    }
                    
                    .code-editor-block {
                        background: #1e1e1e;
                        color: #d4d4d4;
                        font-family: 'Fira Code', 'JetBrains Mono', 'Source Code Pro', monospace;
                        padding: 1.5rem 1rem 1rem 1.5rem;
                        border-radius: 8px;
                        margin: 1.5rem 0;
                        position: relative;
                        box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5);
                        border: 1px solid #333;
                        line-height: 1.6;
                        font-size: 13px;
                        white-space: pre-wrap;
                        word-break: break-all;
                    }
                    .code-editor-block::before {
                        content: 'PYTHON HEROES EDITOR';
                        position: absolute;
                        top: 0;
                        right: 0;
                        background: #333;
                        color: #888;
                        font-family: sans-serif;
                        font-size: 8px;
                        font-weight: 900;
                        padding: 4px 10px;
                        border-bottom-left-radius: 8px;
                        letter-spacing: 1px;
                        z-index: 5;
                    }
                    .code-editor-block::after {
                        content: '';
                        position: absolute;
                        top: 12px;
                        left: 12px;
                        width: 8px;
                        height: 8px;
                        background: #ff5f56;
                        border-radius: 50%;
                        box-shadow: 12px 0 0 #ffbd2e, 24px 0 0 #27c93f;
                        opacity: 0.6;
                    }
                ` }} />
                <EditorContent editor={editor} className="w-full" />
            </div>
        </div>
    );
};

export { RichTextEditor };
