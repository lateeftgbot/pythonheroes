import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BookOpen, Plus, FileText, Video, Link as LinkIcon, Trash2, Edit2, ExternalLink, Download, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Material {
    _id: string;
    title: string;
    description: string;
    type: 'pdf' | 'video' | 'link' | 'document';
    url: string;
    category: string;
    created_by: string;
    created_at: string;
    is_published: boolean;
}

const AdminMaterials = () => {
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [materials, setMaterials] = useState<Material[]>([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);

    // Form state
    const [formTitle, setFormTitle] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formType, setFormType] = useState<'pdf' | 'video' | 'link' | 'document'>('pdf');
    const [formUrl, setFormUrl] = useState("");
    const [formCategory, setFormCategory] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                navigate("/signin", { replace: true });
            } else if (user.role !== 'admin') {
                toast.error("Access denied. Admin only.");
                navigate("/", { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    const fetchMaterials = async () => {
        try {
            const response = await fetch("/api/learning/materials", {
                headers: {
                    "X-Admin-Email": user?.email || ""
                }
            });
            if (response.ok) {
                const data = await response.json();
                setMaterials(data);
            }
        } catch (error) {
            console.error("Failed to fetch materials:", error);
            toast.error("Failed to load materials");
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchMaterials();
        }
    }, [user]);

    const resetForm = () => {
        setFormTitle("");
        setFormDescription("");
        setFormType("pdf");
        setFormUrl("");
        setFormCategory("");
        setEditingMaterial(null);
    };

    const handleOpenAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };

    const handleOpenEditModal = (material: Material) => {
        setFormTitle(material.title);
        setFormDescription(material.description);
        setFormType(material.type);
        setFormUrl(material.url);
        setFormCategory(material.category);
        setEditingMaterial(material);
        setShowAddModal(true);
    };

    const handleSubmit = async () => {
        if (!formTitle.trim() || !formUrl.trim()) {
            toast.error("Title and URL are required");
            return;
        }

        setIsSubmitting(true);

        try {
            const payload = {
                title: formTitle.trim(),
                description: formDescription.trim(),
                type: formType,
                url: formUrl.trim(),
                category: formCategory.trim() || "General",
                created_by: user?.email
            };

            const url = editingMaterial
                ? `/api/learning/materials/${editingMaterial._id}`
                : "/api/learning/materials";

            const response = await fetch(url, {
                method: editingMaterial ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Admin-Email": user?.email || ""
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                toast.success(editingMaterial ? "Material updated!" : "Material added!");
                setShowAddModal(false);
                resetForm();
                fetchMaterials();
            } else {
                const errorData = await response.json();
                toast.error(errorData.error || "Failed to save material");
            }
        } catch (error) {
            toast.error("Failed to save material");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (materialId: string) => {
        if (!confirm("Are you sure you want to delete this material?")) return;

        try {
            const response = await fetch(`/api/learning/materials/${materialId}`, {
                method: "DELETE",
                headers: {
                    "X-Admin-Email": user?.email || ""
                }
            });

            if (response.ok) {
                toast.success("Material deleted!");
                fetchMaterials();
            } else {
                toast.error("Failed to delete material");
            }
        } catch (error) {
            toast.error("Failed to delete material");
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'pdf':
            case 'document':
                return <FileText className="w-5 h-5" />;
            case 'video':
                return <Video className="w-5 h-5" />;
            case 'link':
                return <LinkIcon className="w-5 h-5" />;
            default:
                return <FileText className="w-5 h-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'pdf':
                return "text-red-500 bg-red-500/10 border-red-500/20";
            case 'video':
                return "text-purple-500 bg-purple-500/10 border-purple-500/20";
            case 'link':
                return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case 'document':
                return "text-orange-500 bg-orange-500/10 border-orange-500/20";
            default:
                return "text-primary bg-primary/10 border-primary/20";
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Navbar />

            <main className="flex-1 pt-24 pb-16">
                <div className="container mx-auto px-4 max-w-6xl">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4 px-2">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => navigate("/admin")}
                                className="text-muted-foreground hover:text-primary"
                            >
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <p className="font-mono text-primary text-xs sm:text-sm">{"// Content Management"}</p>
                                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Manage Materials</h1>
                            </div>
                        </div>

                        <Button
                            onClick={handleOpenAddModal}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-mono shadow-lg shadow-primary/20"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Material
                        </Button>
                    </div>

                    {isLoadingMaterials ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary" />
                        </div>
                    ) : materials.length === 0 ? (
                        <div className="glass-card rounded-xl p-12 text-center border border-dashed border-border/50">
                            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">No Materials Found</h3>
                            <p className="text-muted-foreground font-mono text-sm max-w-md mx-auto">
                                {"// You haven't added any learning materials yet. Click 'Add Material' to get started."}
                            </p>
                        </div>
                    ) : (
                        <div className="glass-card rounded-2xl overflow-hidden border border-border shadow-xl bg-white/5">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-muted/50 border-b border-border">
                                        <tr>
                                            <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">Material</th>
                                            <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">Type</th>
                                            <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">Category</th>
                                            <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground">Created At</th>
                                            <th className="p-5 font-mono text-xs uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {materials.map((material) => (
                                            <tr key={material._id} className="group hover:bg-primary/[0.03] transition-colors">
                                                <td className="p-5">
                                                    <div>
                                                        <p className="font-semibold text-foreground line-clamp-1">{material.title}</p>
                                                        <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{material.description || "No description"}</p>
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-[10px] font-mono uppercase ${getTypeColor(material.type)}`}>
                                                        {getTypeIcon(material.type)}
                                                        {material.type}
                                                    </div>
                                                </td>
                                                <td className="p-5">
                                                    <span className="text-xs font-mono text-primary/80">{material.category}</span>
                                                </td>
                                                <td className="p-5">
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {new Date(material.created_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="p-5 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-8 h-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                                                            onClick={() => handleOpenEditModal(material)}
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-8 h-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(material._id)}
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                        <a
                                                            href={material.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                                                            title="Test Link"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Add/Edit Modal */}
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogContent className="bg-background border-border text-foreground max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {editingMaterial ? (
                                <Edit2 className="w-5 h-5 text-primary" />
                            ) : (
                                <Plus className="w-5 h-5 text-primary" />
                            )}
                            {editingMaterial ? "Edit Material" : "Add New Material"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Title *</Label>
                            <Input
                                value={formTitle}
                                onChange={(e) => setFormTitle(e.target.value)}
                                placeholder="e.g. Python Basics - Week 1"
                                className="bg-muted/30 border-border"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Description</Label>
                            <Textarea
                                value={formDescription}
                                onChange={(e) => setFormDescription(e.target.value)}
                                placeholder="Brief description of the material..."
                                className="bg-muted/30 border-border min-h-[80px]"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Type</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {(['pdf', 'video', 'link', 'document'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => setFormType(type)}
                                        className={`px-3 py-2 rounded-lg text-xs font-mono border capitalize transition-all ${formType === type
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">URL *</Label>
                            <Input
                                value={formUrl}
                                onChange={(e) => setFormUrl(e.target.value)}
                                placeholder="https://... or /uploads/..."
                                className="bg-muted/30 border-border font-mono text-xs"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground uppercase tracking-widest">Category</Label>
                            <Input
                                value={formCategory}
                                onChange={(e) => setFormCategory(e.target.value)}
                                placeholder="e.g. Python Fundamentals"
                                className="bg-muted/30 border-border"
                            />
                        </div>
                    </div>

                    <DialogFooter className="gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setShowAddModal(false);
                                resetForm();
                            }}
                            className="font-mono text-xs"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !formTitle.trim() || !formUrl.trim()}
                            className="bg-primary hover:bg-primary/90 font-mono text-xs shadow-lg shadow-primary/10"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                editingMaterial ? "Save Changes" : "Post Material"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminMaterials;
