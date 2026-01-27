import { useProfileAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Link2, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalyticsCardProps {
  profileId: string;
}

export const AnalyticsCard = ({ profileId }: AnalyticsCardProps) => {
  const { data: analytics, isLoading } = useProfileAnalytics(profileId);

  if (isLoading) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Total Clicks</span>
            </div>
            <p className="text-2xl font-bold text-primary">{analytics.totalClicks}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Link2 className="w-4 h-4" />
              <span className="text-xs">Active Links</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalLinks}</p>
          </div>
        </div>

        {/* Top Performing Links */}
        {analytics.topLinks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Performing Links
            </h4>
            <div className="space-y-2">
              {analytics.topLinks.map((link, index) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-2 rounded bg-secondary/20"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-primary font-mono">#{index + 1}</span>
                    <span className="text-sm truncate max-w-[150px]">{link.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {link.clicks} clicks
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {analytics.recentClicks.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent Activity
            </h4>
            <p className="text-xs text-muted-foreground">
              {analytics.recentClicks.length} clicks in the last period
            </p>
          </div>
        )}

        {/* Placeholder for Rule Engine */}
        <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
          <p className="text-xs text-primary/70 text-center">
            🚀 Rule Engine ready for Phase 2
            <br />
            <span className="text-muted-foreground">Time-based & click-based rules</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
