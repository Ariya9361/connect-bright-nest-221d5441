import { useState } from "react";
import { Link, useCreateLink, useUpdateLink, useDeleteLink, useReorderLinks } from "@/hooks/useLinks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Link2,
  Plus,
  Pencil,
  Trash2,
  GripVertical,
  ExternalLink,
  Github,
  Linkedin,
  Globe,
  Twitter,
  FileText,
  Mail,
  Youtube,
  Instagram,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_OPTIONS = [
  { value: "link", label: "Link", icon: Link2 },
  { value: "github", label: "GitHub", icon: Github },
  { value: "linkedin", label: "LinkedIn", icon: Linkedin },
  { value: "globe", label: "Website", icon: Globe },
  { value: "twitter", label: "Twitter/X", icon: Twitter },
  { value: "file-text", label: "Document", icon: FileText },
  { value: "mail", label: "Email", icon: Mail },
  { value: "youtube", label: "YouTube", icon: Youtube },
  { value: "instagram", label: "Instagram", icon: Instagram },
];

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  link: Link2,
  github: Github,
  linkedin: Linkedin,
  globe: Globe,
  twitter: Twitter,
  "file-text": FileText,
  mail: Mail,
  youtube: Youtube,
  instagram: Instagram,
};

interface LinkEditorProps {
  profileId: string;
  links: Link[];
}

export const LinkEditor = ({ profileId, links }: LinkEditorProps) => {
  const [editingLink, setEditingLink] = useState<Link | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const createLink = useCreateLink();
  const updateLink = useUpdateLink();
  const deleteLink = useDeleteLink();
  const reorderLinks = useReorderLinks();

  const handleAddLink = (data: { title: string; url: string; icon: string }) => {
    createLink.mutate({
      profile_id: profileId,
      title: data.title,
      url: data.url,
      icon: data.icon,
    });
    setIsAddDialogOpen(false);
  };

  const handleUpdateLink = (data: { title: string; url: string; icon: string }) => {
    if (!editingLink) return;
    updateLink.mutate({
      linkId: editingLink.id,
      profileId,
      updates: {
        title: data.title,
        url: data.url,
        icon: data.icon,
      },
    });
    setEditingLink(null);
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      deleteLink.mutate({ linkId, profileId });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newLinks = [...links];
    const draggedLink = newLinks[draggedIndex];
    newLinks.splice(draggedIndex, 1);
    newLinks.splice(index, 0, draggedLink);

    // Optimistically update the order
    const newOrder = newLinks.map((l) => l.id);
    reorderLinks.mutate({ profileId, linkIds: newOrder });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <Card className="glass-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-primary" />
          Manage Links
        </CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="w-4 h-4" />
              Add Link
            </Button>
          </DialogTrigger>
          <DialogContent>
            <LinkForm
              onSubmit={handleAddLink}
              onCancel={() => setIsAddDialogOpen(false)}
              isLoading={createLink.isPending}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {links.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No links yet. Add your first link!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {links.map((link, index) => {
              const Icon = iconMap[link.icon] || Link2;
              return (
                <div
                  key={link.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50",
                    "cursor-grab active:cursor-grabbing transition-all",
                    draggedIndex === index && "opacity-50 scale-95"
                  )}
                >
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <div className="w-8 h-8 rounded-md bg-secondary/50 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{link.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {link.clicks} clicks
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(link.url, "_blank")}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingLink(link)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <LinkForm
                          initialData={link}
                          onSubmit={handleUpdateLink}
                          onCancel={() => setEditingLink(null)}
                          isLoading={updateLink.isPending}
                        />
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeleteLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Link Form Component
interface LinkFormProps {
  initialData?: Link;
  onSubmit: (data: { title: string; url: string; icon: string }) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const LinkForm = ({ initialData, onSubmit, onCancel, isLoading }: LinkFormProps) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [url, setUrl] = useState(initialData?.url || "");
  const [icon, setIcon] = useState(initialData?.icon || "link");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !url.trim()) return;
    onSubmit({ title, url, icon });
  };

  return (
    <form onSubmit={handleSubmit}>
      <DialogHeader>
        <DialogTitle>{initialData ? "Edit Link" : "Add New Link"}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Website"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="url">URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            type="url"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="icon">Icon</Label>
          <Select value={icon} onValueChange={setIcon}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICON_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : initialData ? "Update" : "Add Link"}
        </Button>
      </DialogFooter>
    </form>
  );
};
