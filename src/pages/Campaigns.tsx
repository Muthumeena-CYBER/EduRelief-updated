import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { CampaignCard } from "@/components/campaigns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  funding_goal: number;
  amount_raised: number;
  created_at: string;
  student_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

const categories = ["All", "college", "school", "bootcamp", "competitive_exams", "devices", "other"];

const categoryLabels: Record<string, string> = {
  All: "All",
  college: "College",
  school: "School",
  bootcamp: "Bootcamp",
  competitive_exams: "Competitive Exams",
  devices: "Devices",
  other: "Other",
};

const Campaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select(`
          id,
          title,
          story,
          category,
          funding_goal,
          amount_raised,
          created_at,
          student_id
        `)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for all campaigns
      if (data && data.length > 0) {
        const studentIds = [...new Set(data.map((c) => c.student_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", studentIds);

        const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

        const campaignsWithProfiles = data.map((campaign) => ({
          ...campaign,
          profiles: profileMap.get(campaign.student_id) || null,
        }));

        setCampaigns(campaignsWithProfiles);
      } else {
        setCampaigns([]);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (campaign.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "All" || campaign.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "funded":
          return (
            Number(b.amount_raised) / Number(b.funding_goal) -
            Number(a.amount_raised) / Number(a.funding_goal)
          );
        case "goal-low":
          return Number(a.funding_goal) - Number(b.funding_goal);
        case "goal-high":
          return Number(b.funding_goal) - Number(a.funding_goal);
        case "ending":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getDaysLeft = (createdAt: string) => {
    return Math.max(
      0,
      30 - Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24))
    );
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/5 py-16">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <Badge variant="outline" className="mb-4">
              Browse Campaigns
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Support a Student's Journey
            </h1>
            <p className="text-lg text-muted-foreground">
              Every donation brings a student closer to their educational dreams. 
              Find a campaign that resonates with you and make a difference today.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 border-b border-border sticky top-16 bg-background/95 backdrop-blur-sm z-40">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {categoryLabels[category]}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Most Recent</SelectItem>
                  <SelectItem value="funded">Most Funded</SelectItem>
                  <SelectItem value="ending">Ending Soon</SelectItem>
                  <SelectItem value="goal-low">Goal: Low to High</SelectItem>
                  <SelectItem value="goal-high">Goal: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Campaign Grid */}
      <section className="section-padding">
        <div className="container-wide">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                Showing {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 && "s"}
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCampaigns.map((campaign) => (
                  <CampaignCard
                    key={campaign.id}
                    id={campaign.id}
                    title={campaign.title}
                    studentName={campaign.profiles?.full_name || "Student"}
                    story={campaign.story}
                    category={categoryLabels[campaign.category] || campaign.category}
                    goalAmount={Number(campaign.funding_goal)}
                    raisedAmount={Number(campaign.amount_raised)}
                    donorCount={0}
                    daysLeft={getDaysLeft(campaign.created_at)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No campaigns found
              </h3>
              <p className="text-muted-foreground mb-6">
                {campaigns.length === 0
                  ? "No active campaigns at the moment. Check back soon!"
                  : "Try adjusting your search or filters"}
              </p>
              {campaigns.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Campaigns;
