export interface Link {
  id: string;
  title: string;
  url: string;
  icon: string;
  clicks: number;
  order: number;
}

export interface Profile {
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  links: Link[];
}

export interface Analytics {
  totalVisits: number;
  totalClicks: number;
  linkStats: {
    linkId: string;
    clicks: number;
    lastClicked?: Date;
  }[];
}
