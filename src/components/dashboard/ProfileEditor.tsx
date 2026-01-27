import { useState, useEffect, useRef } from "react";
import { Profile, useUpdateProfile } from "@/hooks/useProfile";
import { useAvatarUpload } from "@/hooks/useAvatarUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Save, User, Camera, Upload, Loader2 } from "lucide-react";

interface ProfileEditorProps {
  profile: Profile;
}

export const ProfileEditor = ({ profile }: ProfileEditorProps) => {
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || "");
  const [hasChanges, setHasChanges] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateProfile = useUpdateProfile();
  const { uploadState, uploadAvatar, clearPreview } = useAvatarUpload();

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

  const handleAvatarClick = () => {
    if (!uploadState.isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newUrl = await uploadAvatar(file, profile.id);
    if (newUrl) {
      setAvatarUrl(newUrl);
      // Auto-save after upload
      updateProfile.mutate({
        profileId: profile.id,
        updates: {
          avatar_url: newUrl,
        },
      });
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Use preview URL during upload, otherwise use the actual avatar URL
  const displayAvatarUrl = uploadState.previewUrl || avatarUrl;

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-primary" />
          Edit Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div
              className={`relative cursor-pointer transition-transform hover:scale-105 ${
                uploadState.isUploading ? "opacity-70" : ""
              }`}
              onClick={handleAvatarClick}
            >
              <Avatar className="w-24 h-24 avatar-ring">
                <AvatarImage 
                  src={displayAvatarUrl} 
                  alt={displayName}
                  onError={(e) => {
                    // Handle broken image
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
                <AvatarFallback className="bg-secondary text-2xl font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                {uploadState.isUploading ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : (
                  <Camera className="w-8 h-8 text-white" />
                )}
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileSelect}
              disabled={uploadState.isUploading}
            />
          </div>

          {/* Upload progress */}
          {uploadState.isUploading && (
            <div className="w-full max-w-xs space-y-2">
              <Progress value={uploadState.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Uploading... {uploadState.progress}%
              </p>
            </div>
          )}

          {/* Upload hint */}
          <p className="text-xs text-muted-foreground text-center">
            Click avatar to upload • JPG, PNG, WebP, GIF • Max 5MB
          </p>

          {/* Error display */}
          {uploadState.error && (
            <p className="text-xs text-destructive text-center">
              {uploadState.error}
            </p>
          )}
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
          disabled={!hasChanges || updateProfile.isPending || uploadState.isUploading}
          className="w-full"
        >
          {uploadState.isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {updateProfile.isPending ? "Saving..." : "Save Changes"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
