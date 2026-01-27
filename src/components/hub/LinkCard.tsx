import { Link } from "@/types/hub";
import { 
  Github, 
  Linkedin, 
  Globe, 
  Twitter, 
  FileText, 
  ExternalLink,
  Mail,
  Youtube,
  Instagram,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkCardProps {
  link: Link;
  index: number;
  onLinkClick?: (linkId: string) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
  linkedin: Linkedin,
  globe: Globe,
  twitter: Twitter,
  "file-text": FileText,
  mail: Mail,
  youtube: Youtube,
  instagram: Instagram,
  link: LinkIcon,
};

export const LinkCard = ({ link, index, onLinkClick }: LinkCardProps) => {
  const Icon = iconMap[link.icon] || LinkIcon;

  const handleClick = () => {
    onLinkClick?.(link.id);
    window.open(link.url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "w-full glass-card link-card rounded-xl p-4",
        "flex items-center gap-4",
        "animate-fade-up opacity-0",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
      )}
      style={{ 
        animationDelay: `${0.1 + index * 0.1}s`,
        animationFillMode: 'forwards'
      }}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      
      <span className="flex-1 text-left font-medium text-foreground">
        {link.title}
      </span>
      
      <ExternalLink className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-primary" />
    </button>
  );
};
