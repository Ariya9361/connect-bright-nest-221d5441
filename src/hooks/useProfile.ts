import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
}

// Fetch profile by username
export const useProfileByUsername = (username: string | undefined) => {
  return useQuery({
    queryKey: ["profile", username],
    queryFn: async (): Promise<Profile | null> => {
      if (!username) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!username,
  });
};

// Fetch profile by user_id (auth user)
export const useProfileByUserId = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["profile", "user", userId],
    queryFn: async (): Promise<Profile | null> => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching profile:", error);
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
};

// Fetch all profiles (for demo/admin purposes)
export const useAllProfiles = () => {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async (): Promise<Profile[]> => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching profiles:", error);
        throw error;
      }

      return data || [];
    },
  });
};

// Update profile
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      updates,
    }: {
      profileId: string;
      updates: ProfileUpdate;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", profileId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Create new profile
export const useCreateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: {
      username: string;
      display_name: string;
      bio?: string;
      avatar_url?: string;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .insert(profile)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      toast({
        title: "Profile created",
        description: "Your new link hub is ready!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message?.includes("duplicate")
          ? "Username already taken"
          : "Failed to create profile",
        variant: "destructive",
      });
    },
  });
};
