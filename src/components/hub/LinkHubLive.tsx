import { Profile } from "@/hooks/useProfile";
import { Link } from "@/hooks/useLinks";
import { ProfileHeader } from "./ProfileHeader";
import { LinkCardLive } from "./LinkCardLive";
import { CopyLinkButton } from "./CopyLinkButton";

interface LinkHubLiveProps {
  profile: Profile;
  links: Link[];
  onLinkClick?: (linkId: string, profileId: string) => void;
}

export const LinkHubLive = ({ profile, links, onLinkClick }: LinkHubLiveProps) => {
  // Convert to the format expected by ProfileHeader
  const profileData = {
    username: profile.username,
    displayName: profile.display_name,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    links: links.map((l) => ({
      id: l.id,
      title: l.title,
      url: l.url,
      icon: l.icon,
      clicks: l.clicks,
      order: l.sort_order,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle gradient background */}
      <div className="fixed inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

      {/* Grid pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative container max-w-md mx-auto px-4 py-12">
        <div className="flex flex-col gap-8">
          <ProfileHeader profile={profileData} />

          <div
            className="flex justify-center animate-fade-up opacity-0 stagger-2"
            style={{ animationFillMode: "forwards" }}
          >
            <CopyLinkButton username={profile.username} />
          </div>

          <nav className="flex flex-col gap-3">
            {links
              .filter((link) => link.is_active)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((link, index) => (
                <LinkCardLive
                  key={link.id}
                  link={link}
                  index={index}
                  onLinkClick={() => onLinkClick?.(link.id, profile.id)}
                />
              ))}
          </nav>

          <footer
            className="text-center pt-8 animate-fade-up opacity-0"
            style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          >
            <p className="text-xs text-muted-foreground/60 font-mono">
              Powered by <span className="text-primary/80">SmartLink</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};
