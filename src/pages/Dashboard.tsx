import { useNavigate, useParams, Link } from "react-router-dom";
import { useProfileByUsername } from "@/hooks/useProfile";
import { useLinksByProfileId } from "@/hooks/useLinks";
import { ProfileEditor } from "@/components/dashboard/ProfileEditor";
import { LinkEditor } from "@/components/dashboard/LinkEditor";
import { AnalyticsCard } from "@/components/dashboard/AnalyticsCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username);
  const { data: links = [], isLoading: linksLoading } = useLinksByProfileId(profile?.id);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/u/${username}`;
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
            The profile <span className="font-mono text-primary">@{username}</span> doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-4xl mx-auto p-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
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
              <Link to={`/u/${username}`} target="_blank">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Public Hub
              </Link>
            </Button>
          </div>
        </header>

        {/* Dashboard Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your link hub <span className="text-primary font-mono">@{username}</span>
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <ProfileEditor profile={profile} />
            <AnalyticsCard profileId={profile.id} />
          </div>

          {/* Right Column */}
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
