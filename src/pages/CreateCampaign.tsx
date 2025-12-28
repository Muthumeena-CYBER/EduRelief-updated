import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ArrowLeft, BookOpen, IndianRupee, FileText } from "lucide-react";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(100),
  story: z.string().min(100, "Story must be at least 100 characters").max(5000),
  category: z.enum(["school", "college", "bootcamp", "competitive_exams", "devices", "other"]),
  funding_goal: z.number().min(100, "Goal must be at least ₹100").max(10000000),
  fund_usage: z.string().max(2000).optional(),
});

const categories = [
  { value: "school", label: "School" },
  { value: "college", label: "College / University" },
  { value: "bootcamp", label: "Bootcamp / Online Course" },
  { value: "competitive_exams", label: "Competitive Exams" },
  { value: "devices", label: "Devices & Equipment" },
  { value: "other", label: "Other" },
];

const CreateCampaign = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [category, setCategory] = useState("");
  const [fundingGoal, setFundingGoal] = useState("");
  const [fundUsage, setFundUsage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!loading && (!user || role !== "student")) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = campaignSchema.safeParse({
      title,
      story,
      category,
      funding_goal: parseFloat(fundingGoal) || 0,
      fund_usage: fundUsage || undefined,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("campaigns").insert({
        student_id: user?.id,
        title,
        story,
        category: category as any,
        funding_goal: parseFloat(fundingGoal),
        fund_usage: fundUsage || null,
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Campaign created!",
        description: "Your campaign is now live and ready to receive donations.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="section-padding">
        <div className="container-tight">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>

            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Create Your Campaign</CardTitle>
                <CardDescription>
                  Share your story and education goals. A compelling campaign helps donors connect with your journey.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Campaign Title
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Help Me Complete My Computer Science Degree"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={100}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive">{errors.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {title.length}/100 characters
                    </p>
                  </div>

                  {/* Story */}
                  <div className="space-y-2">
                    <Label htmlFor="story" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Your Story
                    </Label>
                    <Textarea
                      id="story"
                      placeholder="Share your background, educational goals, and why you need support. Be specific about your situation and aspirations..."
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={8}
                      maxLength={5000}
                    />
                    {errors.story && (
                      <p className="text-xs text-destructive">{errors.story}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {story.length}/5000 characters (minimum 100)
                    </p>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Education Category</Label>
                    <Select value={category} onValueChange={setCategory}>
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
                    {errors.category && (
                      <p className="text-xs text-destructive">{errors.category}</p>
                    )}
                  </div>

                  {/* Funding Goal */}
                  <div className="space-y-2">
                    <Label htmlFor="funding_goal" className="flex items-center gap-2">
                      <IndianRupee className="h-4 w-4" />
                      Funding Goal
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="funding_goal"
                        type="number"
                        placeholder="50000"
                        value={fundingGoal}
                        onChange={(e) => setFundingGoal(e.target.value)}
                        className="pl-8"
                        min={100}
                        max={10000000}
                      />
                    </div>
                    {errors.funding_goal && (
                      <p className="text-xs text-destructive">{errors.funding_goal}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Minimum ₹100, maximum ₹1,00,00,000
                    </p>
                  </div>

                  {/* Fund Usage */}
                  <div className="space-y-2">
                    <Label htmlFor="fund_usage">
                      How Will You Use the Funds? (Optional)
                    </Label>
                    <Textarea
                      id="fund_usage"
                      placeholder="e.g., $2,000 for tuition, $500 for textbooks, $500 for laptop..."
                      value={fundUsage}
                      onChange={(e) => setFundUsage(e.target.value)}
                      rows={4}
                      maxLength={2000}
                    />
                    <p className="text-xs text-muted-foreground">
                      Breaking down your funding needs builds trust with donors.
                    </p>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/dashboard")}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? "Creating..." : "Create Campaign"}
                    </Button>
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

export default CreateCampaign;
