"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Copy, Check } from "lucide-react";
import { shareRecipeBinder } from "@/app/actions/share";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  binderId: string;
}

export function ShareButton({ binderId }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    setIsLoading(true);
    try {
      const result = await shareRecipeBinder(binderId);
      if (result.success) {
        setShareLink(result.shareLink);
      }
    } catch (error) {
      console.error("Failed to share recipe binder", error);
      toast({
        title: "Share Failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Share link has been copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Recipe Binder</DialogTitle>
          <DialogDescription>
            Share this recipe binder with others. Note: Viewers need to log in to access the content.
          </DialogDescription>
        </DialogHeader>
        {shareLink && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <p className="text-sm break-all flex-1">{shareLink}</p>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopy}
                disabled={copied}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button onClick={handleShare} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Share Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 