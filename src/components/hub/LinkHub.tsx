import { Profile } from "@/types/hub";
import { ProfileHeader } from "./ProfileHeader";
import { LinkCard } from "./LinkCard";
import { CopyLinkButton } from "./CopyLinkButton";

interface LinkHubProps {
  profile: Profile;
}

export const LinkHub = ({ profile }: LinkHubProps) => {
  const handleLinkClick = (linkId: string) => {
    // Future: Send analytics to backend
    console.log(`Link clicked: ${linkId}`);
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
          <ProfileHeader profile={profile} />
          
          <div className="flex justify-center animate-fade-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
            <CopyLinkButton username={profile.username} />
          </div>

          <nav className="flex flex-col gap-3">
            {profile.links
              .sort((a, b) => a.order - b.order)
              .map((link, index) => (
                <LinkCard
                  key={link.id}
                  link={link}
                  index={index}
                  onLinkClick={handleLinkClick}
                />
              ))}
          </nav>

          <footer className="text-center pt-8 animate-fade-up opacity-0" style={{ animationDelay: '0.8s', animationFillMode: 'forwards' }}>
            <p className="text-xs text-muted-foreground/60 font-mono">
              Powered by <span className="text-primary/80">SmartLink</span>
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};
