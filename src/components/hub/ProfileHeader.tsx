import { Profile } from "@/types/hub";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileHeaderProps {
  profile: Profile;
}

export const ProfileHeader = ({ profile }: ProfileHeaderProps) => {
  const initials = profile.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="relative">
        <div className="absolute -inset-1 bg-primary/20 rounded-full blur-xl" />
        <Avatar className="w-24 h-24 avatar-ring relative">
          <AvatarImage src={profile.avatarUrl} alt={profile.displayName} />
          <AvatarFallback className="bg-secondary text-2xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{profile.displayName}</h1>
        <p className="text-muted-foreground text-sm max-w-xs">{profile.bio}</p>
        <p className="text-primary/80 text-xs font-mono">@{profile.username}</p>
      </div>
    </div>
  );
};
