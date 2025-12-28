import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { DocumentUpload } from "@/components/documents";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Plus,
  IndianRupee,
  Users,
  TrendingUp,
  BookOpen,
  ExternalLink,
  Edit,
} from "lucide-react";

interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  funding_goal: number;
  amount_raised: number;
  status: string;
  created_at: string;
}

interface FundingResource {
  id: string;
  program_name: string;
  organization_name: string;
  funding_type: string;
  application_url: string;
}

interface Donation {
  id: string;
  amount: number;
  message: string | null;
  donor_name: string;
  created_at: string;
}

const Dashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [resources, setResources] = useState<FundingResource[]>([]);
  const [recentDonations, setRecentDonations] = useState<Donation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (!loading && role !== "student") {
      navigate("/donor-dashboard");
      return;
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch user's campaigns
      const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("student_id", user?.id)
        .order("created_at", { ascending: false });

      if (campaignsData) {
        setCampaigns(campaignsData);
      }

      // Fetch recommended resources
      const { data: resourcesData } = await supabase
        .from("funding_resources")
        .select("*")
        .eq("is_active", true)
        .limit(3);

      if (resourcesData) {
        setResources(resourcesData);
      }

      // Fetch recent donations for user's campaigns
      const campaignIds = campaignsData?.map(c => c.id) || [];
      if (campaignIds.length > 0) {
        const { data: donationsData } = await supabase
          .from("donations")
          .select(`
            id,
            amount,
            message,
            created_at,
            donor_id,
            is_anonymous
          `)
          .in("campaign_id", campaignIds)
          .order("created_at", { ascending: false })
          .limit(5);

        if (donationsData) {
          const donorIds = donationsData.map(d => d.donor_id).filter(Boolean);
          const { data: donorProfiles } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .in("user_id", donorIds);

          const profileMap = new Map(donorProfiles?.map(p => [p.user_id, p.full_name]) || []);

          const formattedDonations = donationsData.map(d => ({
            ...d,
            donor_name: d.is_anonymous ? "Anonymous" : (profileMap.get(d.donor_id) || "Supporter")
          }));

          setRecentDonations(formattedDonations);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const totalRaised = campaigns.reduce((sum, c) => sum + Number(c.amount_raised), 0);
  const totalGoal = campaigns.reduce((sum, c) => sum + Number(c.funding_goal), 0);
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-wide">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-muted rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Welcome back, {profile?.full_name?.split(" ")[0]}!
              </h1>
              <p className="text-muted-foreground">
                Manage your campaigns and discover funding opportunities.
              </p>
            </div>
            <Button asChild>
              <Link to="/create-campaign">
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <IndianRupee className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">₹{totalRaised.toLocaleString('en-IN')}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{activeCampaigns}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{totalGoal > 0 ? Math.round((totalRaised / totalGoal) * 100) : 0}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Your Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground mb-4">No campaigns yet.</p>
                      <Button asChild><Link to="/create-campaign">Create Campaign</Link></Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-4 rounded-xl border">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-medium">{campaign.title}</h3>
                              <Badge variant="outline">{campaign.status}</Badge>
                            </div>
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/campaign/${campaign.id}/edit`}><Edit className="h-4 w-4" /></Link>
                            </Button>
                          </div>
                          <Progress value={(campaign.amount_raised / campaign.funding_goal) * 100} className="h-2" />
                          <div className="flex justify-between text-sm mt-1">
                            <span>₹{campaign.amount_raised.toLocaleString('en-IN')} raised</span>
                            <span>₹{campaign.funding_goal.toLocaleString('en-IN')} goal</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Supporters</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentDonations.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No donations yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              {donation.donor_name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{donation.donor_name}</p>
                              <p className="text-xs text-muted-foreground">{new Date(donation.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className="font-bold text-primary">+₹{donation.amount.toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-8">
              <DocumentUpload />
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {resources.map((resource) => (
                      <a key={resource.id} href={resource.application_url} target="_blank" rel="noopener" className="block p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                        <p className="text-sm font-medium">{resource.program_name}</p>
                        <p className="text-xs text-muted-foreground">{resource.organization_name}</p>
                      </a>
                    ))}
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to="/resources">View All <ExternalLink className="ml-2 h-4 w-4" /></Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
