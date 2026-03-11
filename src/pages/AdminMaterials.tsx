import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Plus, Search, Filter, Trash2, Edit2, ExternalLink, Loader2, FileText, Video, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Types
interface Material {
    _id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    raw_text?: string;
    category: string;
    created_at: string;
    document_settings?: {
        pageSize: string;
        marginSize: string;
        margins?: { top: string; bottom: string; left: string; right: string; };
    };
}

const AdminMaterials = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [filters, setFilters] = useState({ search: "", type: "all", sort: "date" });

    // Form State
    const [formData, setFormData] = useState({
        title: "", description: "", type: "pdf" as Material['type'], url: "", category: "", raw_text: "",
        uploadType: "url", file: null as File | null, contentCategory: "binary",
        pageSize: "a4", marginSize: "none",
        margins: { top: "1in", bottom: "1in", left: "1in", right: "1in" }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [viewMaterial, setViewMaterial] = useState<Material | null>(null);

    useEffect(() => {
        if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'master1_vectors'))) {
            toast.error("Access denied.");
            navigate("/", { replace: true });
        } else if (user) fetchMaterials();
    }, [user, authLoading, navigate]);

    const fetchMaterials = async () => {
        try {
            const res = await fetch("/api/learning/materials", { headers: { "X-Admin-Email": user?.email || "" } });
            if (res.ok) setMaterials(await res.json());
        } catch { toast.error("Failed to load materials"); }
        finally { setIsLoading(false); }
    };

    const handleSave = async () => {
        if (!formData.title.trim()) return toast.error("Title required");
        setIsSubmitting(true);
        try {
            const data = new FormData();
            // Simplified payload construction
            data.append('title', formData.title);
            data.append('description', formData.description);
            data.append('category', formData.category || "General");
            data.append('raw_text', formData.raw_text);

            if (formData.contentCategory === 'static') {
                data.append('type', 'document');
                data.append('document_settings', JSON.stringify({
                    pageSize: formData.pageSize,
                    marginSize: formData.marginSize,
                    margins: formData.margins
                }));
            } else {
                data.append('type', formData.type);
                if (formData.uploadType === 'url') data.append('url', formData.url);
                else if (formData.file) data.append('file', formData.file);
            }

            const url = editingId ? `/api/learning/materials/${editingId}` : "/api/learning/materials";
            const headers: Record<string, string> = { "X-Admin-Email": user?.email || "" };

            // Note: For FormData with file upload, we let browser set Content-Type. 
            // BUT if editing (PUT), backend expects JSON typically? 
            // The original code used JSON for PUT. Let's stick to that pattern for safety if established.
            let body: BodyInit;
            if (editingId) {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify({
                    ...formData,
                    type: formData.contentCategory === 'static' ? 'document' : formData.type,
                    url: formData.contentCategory === 'static' ? '' : formData.url,
                    document_settings: formData.contentCategory === 'static' ? {
                        pageSize: formData.pageSize,
                        marginSize: formData.marginSize,
                        margins: formData.margins
                    } : undefined
                });
            } else {
                body = data;
            }

            const res = await fetch(url, { method: editingId ? "PUT" : "POST", headers, body });

            if (res.ok) {
                toast.success("Saved!");
                setShowModal(false);
                fetchMaterials();
            } else {
                const err = await res.json();
                toast.error(err.error || "Failed to save");
            }
        } catch { toast.error("Error saving material"); }
        finally { setIsSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this material?")) return;
        const res = await fetch(`/api/learning/materials/${id}`, { method: "DELETE", headers: { "X-Admin-Email": user?.email || "" } });
        if (res.ok) { toast.success("Deleted"); fetchMaterials(); }
        else toast.error("Failed to delete");
    };

    const openModal = (m?: Material) => {
        if (m) {
            setEditingId(m._id);
            setFormData({
                title: m.title, description: m.description, type: m.type, url: m.url, category: m.category, raw_text: m.raw_text || "",
                uploadType: "url", file: null, contentCategory: m.raw_text && !m.url ? "static" : "binary",
                pageSize: m.document_settings?.pageSize || "a4", marginSize: m.document_settings?.marginSize || "none",
                margins: m.document_settings?.margins || { top: "1in", bottom: "1in", left: "1in", right: "1in" }
            });
        } else {
            setEditingId(null);
            setFormData({
                title: "", description: "", type: "pdf", url: "", category: "", raw_text: "",
                uploadType: "url", file: null, contentCategory: "binary", pageSize: "a4", marginSize: "none",
                margins: { top: "1in", bottom: "1in", left: "1in", right: "1in" }
            });
        }
        setShowModal(true);
    };

    const filtered = materials.filter(m =>
        (filters.type === "all" || m.type === filters.type) &&
        (m.title.toLowerCase().includes(filters.search.toLowerCase()) || m.category.toLowerCase().includes(filters.search.toLowerCase()))
    ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (isLoading || !user) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

    const getTypeIcon = (t: string) => {
        if (t === 'video') return <Video className="w-4 h-4" />;
        if (t === 'link') return <LinkIcon className="w-4 h-4" />;
        return <FileText className="w-4 h-4" />;
    };
    const getTypeColor = (t: string) => t === 'video' ? "text-purple-500" : t === 'link' ? "text-blue-500" : "text-orange-500";

    return (
        <div className="min-h-screen bg-background pb-20 pt-24">
            <Navbar />
            <div className="container mx-auto px-4 max-w-5xl">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <p className="font-mono text-primary text-xs">{"// Admin"}</p>
                        <h1 className="text-xl font-bold">Materials</h1>
                    </div>
                    <Button onClick={() => openModal()} size="sm" className="bg-primary text-primary-foreground text-xs"><Plus className="w-4 h-4 mr-2" />Add</Button>
                </div>

                <div className="flex gap-4 mb-6 bg-muted/20 p-4 rounded-lg">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Search..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="pl-9 h-9 text-xs" />
                    </div>
                    <select className="h-9 px-3 bg-background border rounded text-xs" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                        <option value="all">All Types</option>
                        <option value="pdf">PDF</option><option value="video">Video</option><option value="document">Doc</option>
                    </select>
                </div>

                <div className="grid gap-2">
                    {filtered.map(m => (
                        <div key={m._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={cn("p-2 rounded bg-primary/10", getTypeColor(m.type))}>{getTypeIcon(m.type)}</div>
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm truncate">{m.title}</h3>
                                    <p className="text-xs text-muted-foreground truncate">{m.category} • {new Date(m.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                <Button variant="ghost" size="icon" onClick={() => openModal(m)} className="h-8 w-8"><Edit2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(m._id)} className="h-8 w-8 text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => m.url ? window.open(m.url) : setViewMaterial(m)} className="h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && <div className="text-center py-10 text-muted-foreground text-sm">No materials found.</div>}
                </div>
            </div>

            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className={cn("max-h-[95vh] overflow-y-auto", formData.contentCategory === 'static' ? "max-w-[95vw] w-full" : "max-w-md")}>
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Material</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-2">
                        <Input placeholder="Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        <Textarea placeholder="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="h-20" />

                        <div className="flex gap-2 p-1 bg-muted rounded-lg">
                            <button type="button" onClick={() => setFormData({ ...formData, contentCategory: 'binary' })} className={cn("flex-1 py-1.5 text-xs rounded-md transition-colors", formData.contentCategory === 'binary' ? "bg-background shadow text-primary font-medium" : "text-muted-foreground hover:bg-background/50")}>File/Link</button>
                            <button type="button" onClick={() => setFormData({ ...formData, contentCategory: 'static' })} className={cn("flex-1 py-1.5 text-xs rounded-md transition-colors", formData.contentCategory === 'static' ? "bg-background shadow text-primary font-medium" : "text-muted-foreground hover:bg-background/50")}>Document</button>
                        </div>

                        {formData.contentCategory === 'binary' ? (
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    {(['pdf', 'video', 'link'] as const).map(t => (
                                        <button key={t} type="button" onClick={() => setFormData({ ...formData, type: t })} className={cn("px-3 py-1 border rounded text-xs capitalize transition-colors", formData.type === t ? "bg-primary/10 border-primary text-primary" : "hover:bg-muted")}>{t}</button>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    {formData.uploadType === 'url' ? (
                                        <Input placeholder="https://..." value={formData.url} onChange={e => setFormData({ ...formData, url: e.target.value })} className="flex-1 text-xs" />
                                    ) : (
                                        <Input type="file" onChange={e => setFormData({ ...formData, file: e.target.files?.[0] || null })} className="flex-1 text-xs" />
                                    )}
                                    <Button variant="outline" onClick={() => setFormData({ ...formData, uploadType: formData.uploadType === 'url' ? 'file' : 'url' })} className="text-xs w-24 shrink-0">{formData.uploadType === 'url' ? "Upload File" : "Use URL"}</Button>
                                </div>
                            </div>
                        ) : (
                            <RichTextEditor
                                content={formData.raw_text}
                                onChange={c => setFormData({ ...formData, raw_text: c })}
                                isDocumentMode={true}
                                pageSize={formData.pageSize}
                                margins={formData.margins}
                                onPageSizeChange={s => setFormData({ ...formData, pageSize: s })}
                                onMarginsChange={m => setFormData({ ...formData, margins: m })}
                            />
                        )}
                        <Input placeholder="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Save"}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!viewMaterial} onOpenChange={() => setViewMaterial(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
                    <DialogHeader><DialogTitle>{viewMaterial?.title}</DialogTitle></DialogHeader>
                    <div className="prose prose-sm dark:prose-invert max-w-none text-left overflow-y-auto flex-1">
                        {viewMaterial?.raw_text ? (
                            <RichTextEditor
                                content={viewMaterial.raw_text}
                                readOnly={true}
                                onChange={() => { }}
                                isDocumentMode={true}
                                pageSize={viewMaterial.document_settings?.pageSize}
                                margins={viewMaterial.document_settings?.margins}
                            />
                        ) : (
                            <div className="py-20 text-center text-muted-foreground italic">No document content available.</div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMaterials;
