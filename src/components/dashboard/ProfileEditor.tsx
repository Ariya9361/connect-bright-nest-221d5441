import { useState, useEffect } from "react";
import { Profile, useUpdateProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, User } from "lucide-react";

interface ProfileEditorProps {
  profile: Profile;
}

export const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [hasChanges, setHasChanges] = useState(false);

  const updateProfile = useUpdateProfile();

  useEffect(() => {
    setDisplayName(profile.display_name);
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url || "");
    setHasChanges(false);
  }, [profile]);

  useEffect(() => {
    const changed =
      displayName !== profile.display_name ||
      bio !== (profile.bio || "") ||
      avatarUrl !== (profile.avatar_url || "");
    setHasChanges(changed);
  }, [displayName, bio, avatarUrl, profile]);

  const handleSave = () => {
    updateProfile.mutate({
      profileId: profile.id,
      updates: {
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
      },
    });
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Preview */}
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20 avatar-ring">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback className="bg-secondary text-xl font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Label htmlFor="avatar" className="text-muted-foreground text-sm">
              Avatar URL
            </Label>
            <Input
              id="avatar"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.png"
              className="mt-1"
            />
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="displayName">Display Name</Label>
          <Input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A short bio about yourself..."
            rows={3}
          />
        </div>

        {/* Username (read-only) */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">Username</Label>
          <div className="flex items-center gap-2 p-2 bg-secondary/50 rounded-md">
            <span className="text-primary font-mono">@{profile.username}</span>
            <span className="text-xs text-muted-foreground">(cannot be changed)</span>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateProfile.isPending}
          className="w-full"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateProfile.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </CardContent>
    </Card>
  );
};
