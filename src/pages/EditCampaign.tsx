import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Trash2, Pause, Play, IndianRupee } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Campaign {
  id: string;
  title: string;
  story: string;
  category: string;
  funding_goal: number;
  fund_usage: string | null;
  image_url: string | null;
  status: string;
  student_id: string;
}

const categories = [
  { value: "school", label: "School" },
  { value: "college", label: "College" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "competitive_exams", label: "Competitive Exams" },
  { value: "devices", label: "Devices & Equipment" },
  { value: "other", label: "Other" },
];

const EditCampaign = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    story: "",
    category: "",
    funding_goal: "",
    fund_usage: "",
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login");
      return;
    }
    if (!authLoading && role !== "student") {
      navigate("/donor-dashboard");
      return;
    }
  }, [user, role, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      fetchCampaign();
    }
  }, [id, user]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (data.student_id !== user?.id) {
        toast({
          title: "Unauthorized",
          description: "You can only edit your own campaigns.",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setCampaign(data);
      setFormData({
        title: data.title,
        story: data.story,
        category: data.category,
        funding_goal: String(data.funding_goal),
        fund_usage: data.fund_usage || "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load campaign",
        variant: "destructive",
      });
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({
          title: formData.title,
          story: formData.story,
          category: formData.category as any,
          funding_goal: parseFloat(formData.funding_goal),
          fund_usage: formData.fund_usage || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign updated",
        description: "Your changes have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update campaign",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async () => {
    if (!campaign) return;

    const newStatus = campaign.status === "active" ? "paused" : "active";
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus })
        .eq("id", campaign.id);

      if (error) throw error;

      setCampaign({ ...campaign, status: newStatus });
      toast({
        title: "Status updated",
        description: `Campaign is now ${newStatus}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const deleteCampaign = async () => {
    if (!campaign) return;

    try {
      const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", campaign.id);

      if (error) throw error;

      toast({
        title: "Campaign deleted",
        description: "Your campaign has been removed.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete campaign",
        variant: "destructive",
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="section-padding">
          <div className="container-wide max-w-2xl">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-muted rounded w-48" />
              <div className="h-64 bg-muted rounded-xl" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!campaign) return null;

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-wide max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground mb-2">Edit Campaign</h1>
            <p className="text-muted-foreground">
              Update your campaign details and settings.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Make changes to your campaign information.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Campaign Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Your campaign title"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding_goal">Funding Goal (₹)</Label>
                    <Input
                      id="funding_goal"
                      type="number"
                      min="100"
                      value={formData.funding_goal}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, funding_goal: e.target.value }))
                      }
                      placeholder="50000"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="story">Your Story</Label>
                    <Textarea
                      id="story"
                      value={formData.story}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, story: e.target.value }))
                      }
                      placeholder="Share your educational journey and why you need support..."
                      className="min-h-[150px]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fund_usage">How You'll Use the Funds</Label>
                    <Textarea
                      id="fund_usage"
                      value={formData.fund_usage}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, fund_usage: e.target.value }))
                      }
                      placeholder="Explain how you plan to use the donations..."
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button type="submit" disabled={saving} className="flex-1">
                      {saving ? (
                        "Saving..."
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={toggleStatus}
                    >
                      {campaign.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Campaign?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. All donations associated with
                            this campaign will remain in the system but the campaign
                            will be removed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={deleteCampaign}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default EditCampaign;
