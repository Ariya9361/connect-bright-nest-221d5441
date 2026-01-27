import { useParams, useNavigate } from "react-router-dom";
import { useProfileByUsername } from "@/hooks/useProfile";
import { useLinksByProfileId, useRecordClick } from "@/hooks/useLinks";
import { LinkHubLive } from "@/components/hub/LinkHubLive";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

const UserHub = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  
  const { data: profile, isLoading: profileLoading } = useProfileByUsername(username);
  const { data: links = [], isLoading: linksLoading } = useLinksByProfileId(profile?.id);
  const recordClick = useRecordClick();

  const handleLinkClick = (linkId: string, profileId: string) => {
    recordClick.mutate({ linkId, profileId });
  };

  // Loading state
  if (profileLoading || linksLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <main className="relative container max-w-md mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
            <div className="w-full space-y-3 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Not found state
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="text-6xl">🔗</div>
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground">
            The link hub <span className="font-mono text-primary">@{username}</span> doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Dashboard link - floating button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 right-4 z-50 opacity-50 hover:opacity-100"
        onClick={() => navigate(`/dashboard/${username}`)}
      >
        <Settings className="w-5 h-5" />
      </Button>
      
      <LinkHubLive
        profile={profile}
        links={links}
        onLinkClick={handleLinkClick}
      />
    </>
  );
};

export default UserHub;
