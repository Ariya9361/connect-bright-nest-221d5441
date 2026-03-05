import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsSummary {
  totalClicks: number;
  totalLinks: number;
  topLinks: {
    id: string;
    title: string;
    clicks: number;
  }[];
  recentClicks: {
    link_id: string;
    clicked_at: string;
  }[];
}

// Fetch analytics for a profile
export const useProfileAnalytics = (profileId: string | undefined) => {
  return useQuery({
    queryKey: ["analytics", profileId],
    queryFn: async (): Promise<AnalyticsSummary | null> => {
      if (!profileId) return null;

      const { data: links, error: linksError } = await supabase
        .from("links")
        .select("id, title, clicks")
        .eq("profile_id", profileId)
        .order("clicks", { ascending: false });

      if (linksError) {
        if (import.meta.env.DEV) console.error("Error fetching links for analytics:", linksError);
        throw linksError;
      }

      const { data: recentClicks, error: analyticsError } = await supabase
        .from("link_analytics")
        .select("link_id, clicked_at")
        .eq("profile_id", profileId)
        .order("clicked_at", { ascending: false })
        .limit(50);

      if (analyticsError) {
        if (import.meta.env.DEV) console.error("Error fetching analytics:", analyticsError);
      }

      const totalClicks = links?.reduce((sum, link) => sum + (link.clicks || 0), 0) || 0;

      return {
        totalClicks,
        totalLinks: links?.length || 0,
        topLinks: links?.slice(0, 5) || [],
        recentClicks: recentClicks || [],
      };
    },
    enabled: !!profileId,
  });
};

// Hook for future rule engine integration
export const useRuleEngineHooks = (profileId: string | undefined) => {
  const getTimeBasedPriority = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return "morning";
    if (hour >= 12 && hour < 18) return "afternoon";
    if (hour >= 18 && hour < 24) return "evening";
    return "night";
  };

  const getClickBasedOrder = (links: { id: string; clicks: number }[]) => {
    return [...links].sort((a, b) => b.clicks - a.clicks).map((l) => l.id);
  };

  return {
    getTimeBasedPriority,
    getClickBasedOrder,
    currentTimePeriod: getTimeBasedPriority(),
  };
};
