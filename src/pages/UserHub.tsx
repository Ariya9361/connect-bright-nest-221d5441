import { useParams } from "react-router-dom";
import { LinkHub } from "@/components/hub/LinkHub";
import { mockProfile } from "@/data/mockProfile";

const UserHub = () => {
  const { username } = useParams<{ username: string }>();

  // For demo, we use mock data. In Phase 2, fetch from API
  // TODO: Replace with API call - GET /api/users/${username}
  const profile = username === mockProfile.username ? mockProfile : null;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 animate-fade-up">
          <div className="text-6xl">🔗</div>
          <h1 className="text-2xl font-bold">User not found</h1>
          <p className="text-muted-foreground">
            The link hub <span className="font-mono text-primary">@{username}</span> doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return <LinkHub profile={profile} />;
};

export default UserHub;
