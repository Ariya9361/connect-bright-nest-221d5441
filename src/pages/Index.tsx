import { Link } from "react-router-dom";
import { ArrowRight, Zap, BarChart3, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <main className="relative container max-w-2xl mx-auto px-4 py-20">
        <div className="flex flex-col items-center text-center gap-8">
          {/* Logo / Brand */}
          <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-card/50 backdrop-blur-sm">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-mono text-muted-foreground">smartlink.hub</span>
            </div>
          </div>

          {/* Hero */}
          <div className="space-y-4 animate-fade-up opacity-0 stagger-1" style={{ animationFillMode: 'forwards' }}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Your links,{" "}
              <span className="text-primary">smarter</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              One link to share everything. Beautiful, fast, and intelligent.
            </p>
          </div>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up opacity-0 stagger-2" style={{ animationFillMode: 'forwards' }}>
            <Button asChild size="lg" className="gap-2 glow-effect">
              <Link to="/u/arya">
                View Demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full animate-fade-up opacity-0 stagger-3" style={{ animationFillMode: 'forwards' }}>
            <FeatureCard
              icon={Link2}
              title="One Link"
              description="Share all your important links with a single URL"
            />
            <FeatureCard
              icon={Zap}
              title="Smart Rules"
              description="Auto-organize based on time and performance"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analytics"
              description="Track clicks and optimize your links"
            />
          </div>

          {/* Demo link */}
          <div className="mt-8 animate-fade-up opacity-0 stagger-4" style={{ animationFillMode: 'forwards' }}>
            <p className="text-sm text-muted-foreground">
              Try the demo:{" "}
              <Link 
                to="/u/arya" 
                className="font-mono text-primary hover:underline underline-offset-4"
              >
                /u/arya
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => (
  <div className="glass-card rounded-xl p-5 text-left transition-all hover:border-primary/30">
    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-secondary/50 mb-3">
      <Icon className="w-5 h-5 text-primary" />
    </div>
    <h3 className="font-semibold mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground">{description}</p>
  </div>
);

export default Index;
