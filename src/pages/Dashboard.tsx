import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLinksByProfileId } from "@/hooks/useLinks";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { LinkEditor } from "@/components/dashboard/LinkEditor";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useProfileByUserId } from "@/hooks/useProfile";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfileByUserId(user?.id);
  const { data: links = [], isLoading: linksLoading } = useLinksByProfileId(profile?.id);

  const handleCopyLink = () => {
    if (!profile) return;
    const url = `${window.location.origin}/u/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast({
      title: "Link copied!",
      description: "Public link copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-10 w-32" />
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-[400px]" />
            <Skeleton className="h-[400px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔗</div>
          <h1 className="text-2xl font-bold">Profile not found</h1>
          <p className="text-muted-foreground">
            No profile linked to your account yet.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6">
        <header className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <Check className="w-4 h-4 mr-2" />
              ) : (
                <Copy className="w-4 h-4 mr-2" />
              )}
              Copy Link
            </Button>
            <Button asChild size="sm">
              <Link to={`/u/${profile.username}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Hub
              </Link>
            </Button>
          </div>
        </header>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your link hub <span className="text-primary font-mono">@{profile.username}</span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <ProfileEditor profile={profile} />
            <AnalyticsCard profileId={profile.id} />
          </div>

          <div>
            {linksLoading ? (
              <Skeleton className="h-[500px]" />
            ) : (
              <LinkEditor profileId={profile.id} links={links} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
