import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useEffect } from "react";

export interface Link {
  id: string;
  profile_id: string;
  title: string;
  url: string;
  icon: string;
  clicks: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LinkCreate {
  profile_id: string;
  title: string;
  url: string;
  icon?: string;
  sort_order?: number;
}

export interface LinkUpdate {
  title?: string;
  url?: string;
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
}

// Fetch links by profile ID
export const useLinksByProfileId = (profileId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel(`links-${profileId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "links",
          filter: `profile_id=eq.${profileId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["links", profileId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, queryClient]);

  return useQuery({
    queryKey: ["links", profileId],
    queryFn: async (): Promise<Link[]> => {
      if (!profileId) return [];

      const { data, error } = await supabase
        .from("links")
        .select("*")
        .eq("profile_id", profileId)
        .order("sort_order", { ascending: true });

      if (error) {
        if (import.meta.env.DEV) console.error("Error fetching links:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!profileId,
  });
};

// Create new link
export const useCreateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (link: LinkCreate) => {
      if (!/^https?:\/\//i.test(link.url)) {
        throw new Error("Only http:// and https:// URLs are allowed.");
      }

      const { data: existingLinks } = await supabase
        .from("links")
        .select("sort_order")
        .eq("profile_id", link.profile_id)
        .order("sort_order", { ascending: false })
        .limit(1);

      const maxOrder = existingLinks?.[0]?.sort_order ?? 0;

      const { data, error } = await supabase
        .from("links")
        .insert({
          ...link,
          sort_order: link.sort_order ?? maxOrder + 1,
          icon: link.icon || "link",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", data.profile_id] });
      toast({
        title: "Link added",
        description: "Your new link has been created.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create link. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Update link
export const useUpdateLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      profileId,
      updates,
    }: {
      linkId: string;
      profileId: string;
      updates: LinkUpdate;
    }) => {
      if (updates.url && !/^https?:\/\//i.test(updates.url)) {
        throw new Error("Only http:// and https:// URLs are allowed.");
      }

      const { data, error } = await supabase
        .from("links")
        .update(updates)
        .eq("id", linkId)
        .select()
        .single();

      if (error) throw error;
      return { ...data, profileId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", data.profileId] });
      toast({
        title: "Link updated",
        description: "Your changes have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update link. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Delete link
export const useDeleteLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      profileId,
    }: {
      linkId: string;
      profileId: string;
    }) => {
      const { error } = await supabase.from("links").delete().eq("id", linkId);

      if (error) throw error;
      return { linkId, profileId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", data.profileId] });
      toast({
        title: "Link deleted",
        description: "The link has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete link. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Reorder links
export const useReorderLinks = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      profileId,
      linkIds,
    }: {
      profileId: string;
      linkIds: string[];
    }) => {
      const updates = linkIds.map((id, index) => ({
        id,
        sort_order: index + 1,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("links")
          .update({ sort_order: update.sort_order })
          .eq("id", update.id);

        if (error) throw error;
      }

      return { profileId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", data.profileId] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reorder links. Please try again.",
        variant: "destructive",
      });
    },
  });
};

// Record link click (analytics)
export const useRecordClick = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      linkId,
      profileId,
    }: {
      linkId: string;
      profileId: string;
    }) => {
      // Record in analytics table (trigger validates link-profile relationship)
      await supabase.from("link_analytics").insert({
        link_id: linkId,
        profile_id: profileId,
        user_agent: (navigator.userAgent || "").slice(0, 512),
        referrer: (document.referrer || "").slice(0, 512) || null,
      });

      return { linkId, profileId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["links", data.profileId] });
    },
    onError: () => {
      // Silent fail for click tracking
    },
  });
};
