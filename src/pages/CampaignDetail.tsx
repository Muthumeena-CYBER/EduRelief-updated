import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Heart,
  Share2,
  IndianRupee,
} from "lucide-react";
import { DonationModal } from "@/components/campaigns";

interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  funding_goal: number;
  amount_raised: number;
  fund_usage: string | null;
  status: string;
  created_at: string;
  student_id: string;
}

interface Profile {
  full_name: string;
  avatar_url: string | null;
}

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [studentProfile, setStudentProfile] = useState<Profile | null>(null);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isDonating, setIsDonating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data: campaignData, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (campaignError) throw campaignError;
      if (!campaignData) {
        navigate("/campaigns");
        return;
      }

      setCampaign(campaignData);

      // Fetch student profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", campaignData.student_id)
        .maybeSingle();

      if (profileData) {
        setStudentProfile(profileData);
      }

      // Fetch donor count
      const { count } = await supabase
        .from("donations")
        .select("*", { count: "exact", head: true })
        .eq("campaign_id", id);

      setDonorCount(count || 0);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      navigate("/campaigns");
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async (amount: number, message: string, isAnonymous: boolean) => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to donate to this campaign.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    setIsDonating(true);

    try {
      const { error } = await supabase.from("donations").insert({
        campaign_id: id,
        donor_id: user.id,
        amount,
        message: message || null,
        is_anonymous: isAnonymous,
      });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: `Your ₹${amount} donation has been processed successfully.`,
      });

      // Refresh campaign data
      fetchCampaign();
    } catch (error: any) {
      toast({
        title: "Donation failed",
        description: error.message || "Failed to process donation. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsDonating(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: `Support ${studentProfile?.full_name}'s education on EduRelief`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Campaign link has been copied to your clipboard.",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-wide">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-64" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) {
    return null;
  }

  const progress = (Number(campaign.amount_raised) / Number(campaign.funding_goal)) * 100;
  const daysLeft = Math.max(
    0,
    30 - Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24))
  );

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide">
          <Link
            to="/campaigns"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Campaigns
          </Link>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Badge className="mb-4">{campaign.category.replace("_", " ")}</Badge>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                  {campaign.title}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                    {studentProfile?.full_name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {studentProfile?.full_name || "Student"}
                    </p>
                    <p className="text-sm text-muted-foreground">Campaign Creator</p>
                  </div>
                </div>
              </motion.div>

              <Card>
                <CardHeader>
                  <CardTitle>About This Campaign</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {campaign.story}
                  </p>
                </CardContent>
              </Card>

              {campaign.fund_usage && (
                <Card>
                  <CardHeader>
                    <CardTitle>How Funds Will Be Used</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground whitespace-pre-wrap">
                      {campaign.fund_usage}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-3xl font-bold text-foreground">
                            ₹{Number(campaign.amount_raised).toLocaleString('en-IN')}
                          </span>
                          <span className="text-muted-foreground">
                            of ₹{Number(campaign.funding_goal).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-3 gap-4 text-center py-4 border-y border-border">
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {Math.round(progress)}%
                          </p>
                          <p className="text-xs text-muted-foreground">Funded</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{donorCount}</p>
                          <p className="text-xs text-muted-foreground">Donors</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">{daysLeft}</p>
                          <p className="text-xs text-muted-foreground">Days Left</p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleShare}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Share Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Donation Card */}
              {campaign.status === "active" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Make a Difference
                      </CardTitle>
                      <CardDescription>
                        Your contribution directly impacts {studentProfile?.full_name || 'this student'}'s future.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button
                        className="w-full text-lg h-14"
                        onClick={() => setIsModalOpen(true)}
                      >
                        <Heart className="h-5 w-5 mr-2 fill-current" />
                        Support Now
                      </Button>

                      <p className="text-xs text-center text-muted-foreground pt-2">
                        Tax-deductible receipt available after payment
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </section>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaignTitle={campaign.title}
        studentName={studentProfile?.full_name || "Student"}
        onDonate={handleDonate}
      />
    </Layout>
  );
};

export default CampaignDetail;
