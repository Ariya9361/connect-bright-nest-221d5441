import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyLinkButtonProps {
  username: string;
}

export const CopyLinkButton = ({ username }: CopyLinkButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}/u/${username}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="gap-2 border-border/50 bg-secondary/30 hover:bg-secondary/50 hover:border-primary/30 transition-all"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-primary" />
          <span className="text-primary">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" />
          <span>Copy Link</span>
        </>
      )}
    </Button>
  );
};
