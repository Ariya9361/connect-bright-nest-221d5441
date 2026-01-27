import { Profile } from "@/types/hub";

export const mockProfile: Profile = {
  username: "arya",
  displayName: "Arya Sharma",
  bio: "CS Student • Builder • Hackathon Enthusiast 🚀",
  avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=arya&backgroundColor=0a0a0a",
  links: [
    {
      id: "1",
      title: "GitHub",
      url: "https://github.com",
      icon: "github",
      clicks: 142,
      order: 1,
    },
    {
      id: "2",
      title: "LinkedIn",
      url: "https://linkedin.com",
      icon: "linkedin",
      clicks: 89,
      order: 2,
    },
    {
      id: "3",
      title: "Portfolio",
      url: "https://portfolio.dev",
      icon: "globe",
      clicks: 234,
      order: 3,
    },
    {
      id: "4",
      title: "Twitter / X",
      url: "https://x.com",
      icon: "twitter",
      clicks: 67,
      order: 4,
    },
    {
      id: "5",
      title: "Resume",
      url: "https://resume.io",
      icon: "file-text",
      clicks: 178,
      order: 5,
    },
  ],
};
