import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadState {
  isUploading: boolean;
  progress: number;
  previewUrl: string | null;
  error: string | null;
}

export const useAvatarUpload = () => {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    previewUrl: null,
    error: null,
  });

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return "Invalid file type. Please upload JPG, PNG, WebP, or GIF.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File too large. Maximum size is 5MB.";
    }
    return null;
  };

  const createPreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadAvatar = async (
    file: File,
    profileId: string
  ): Promise<string | null> => {
    // Verify the current user owns this profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== profileId) {
      toast({
        title: "Upload failed",
        description: "You can only update your own avatar.",
        variant: "destructive",
      });
      return null;
    }

    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setUploadState((prev) => ({ ...prev, error: validationError }));
      toast({
        title: "Upload failed",
        description: validationError,
        variant: "destructive",
      });
      return null;
    }

    try {
      // Create preview
      const previewUrl = await createPreview(file);
      setUploadState({
        isUploading: true,
        progress: 10,
        previewUrl,
        error: null,
      });

      // Generate unique filename
      const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${profileId}-${Date.now()}.${fileExt}`;
      const filePath = `${profileId}/${fileName}`;

      setUploadState((prev) => ({ ...prev, progress: 30 }));

      // Delete old avatars for this profile (cleanup)
      const { data: existingFiles } = await supabase.storage
        .from("avatars")
        .list(profileId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((f) => `${profileId}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToDelete);
      }

      setUploadState((prev) => ({ ...prev, progress: 50 }));

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      setUploadState((prev) => ({ ...prev, progress: 80 }));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      setUploadState({
        isUploading: false,
        progress: 100,
        previewUrl: publicUrl,
        error: null,
      });

      toast({
        title: "Avatar uploaded!",
        description: "Your profile picture has been updated.",
      });

      return publicUrl;
    } catch (error: any) {
      if (import.meta.env.DEV) {
        console.error("Avatar upload error:", error);
      }
      
      setUploadState({
        isUploading: false,
        progress: 0,
        previewUrl: null,
        error: "Failed to upload avatar",
      });

      toast({
        title: "Upload failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });

      return null;
    }
  };

  const clearPreview = () => {
    setUploadState({
      isUploading: false,
      progress: 0,
      previewUrl: null,
      error: null,
    });
  };

  return {
    uploadState,
    uploadAvatar,
    validateFile,
    createPreview,
    clearPreview,
  };
};
