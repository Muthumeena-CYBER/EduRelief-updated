import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CampaignCard } from "@/components/campaigns";
import {
  GraduationCap,
  Heart,
  Search,
  Shield,
  ArrowRight,
  Users,
  Sparkles,
  TrendingUp,
  BookOpen,
  IndianRupee,
  CheckCircle,
} from "lucide-react";


// Sample featured campaigns data
const featuredCampaigns = [
  {
    id: "1",
    title: "Help Maria Complete Her Computer Science Degree",
    studentName: "Maria Santos",
    story: "First-generation college student pursuing her dream of becoming a software engineer. Need support for final year tuition and books.",
    category: "College",
    goalAmount: 800000,
    raisedAmount: 520000,
    donorCount: 47,
    daysLeft: 23,
  },
  {
    id: "2",
    title: "Support James's Medical School Journey",
    studentName: "James Chen",
    story: "Aspiring doctor from a low-income family. Your support will help cover exam fees and study materials for MCAT preparation.",
    category: "Medical School",
    goalAmount: 500000,
    raisedAmount: 380000,
    donorCount: 32,
    daysLeft: 15,
  },
  {
    id: "3",
    title: "Emily's Coding Bootcamp Fund",
    studentName: "Emily Rodriguez",
    story: "Single mom transitioning to tech career. Need help with bootcamp tuition to build a better future for my family.",
    category: "Bootcamp",
    goalAmount: 1200000,
    raisedAmount: 960000,
    donorCount: 89,
    daysLeft: 8,
  },
];

const stats = [
  { value: "₹20 Cr+", label: "Funds Raised", icon: IndianRupee },
  { value: "1,200+", label: "Students Helped", icon: GraduationCap },
  { value: "15,000+", label: "Donors", icon: Heart },
  { value: "95%", label: "Success Rate", icon: TrendingUp },
];

const howItWorks = [
  {
    step: 1,
    title: "Create Your Campaign",
    description: "Share your story, education goals, and funding needs. Upload documents to build trust.",
    icon: BookOpen,
  },
  {
    step: 2,
    title: "Get Discovered",
    description: "Your campaign is shared with our community of generous donors who believe in education.",
    icon: Search,
  },
  {
    step: 3,
    title: "Receive Support",
    description: "Donors contribute to your education fund. Track progress and thank your supporters.",
    icon: Heart,
  },
  {
    step: 4,
    title: "Achieve Your Goals",
    description: "Use the funds for your education. Share updates and inspire others on their journey.",
    icon: GraduationCap,
  },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-accent/20 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/30 via-transparent to-transparent" />

        <div className="relative container-wide py-20 md:py-32">
          <div className="max-w-2xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary-foreground border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Education-Focused Crowdfunding
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight">
                Fund Your Dreams,{" "}
                <span className="text-accent">Transform Lives</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-lg md:text-xl text-primary-foreground/80 leading-relaxed"
            >
              EduRelief connects students with donors who believe in the power of education.
              Raise funds for school, college, bootcamps, or discover scholarships and ISA programs.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Button size="xl" variant="hero" asChild>
                <Link to="/register">
                  Start Your Campaign
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/campaigns">
                  Support a Student
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-center gap-6 pt-4"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-primary/30 border-2 border-primary-foreground/20 flex items-center justify-center text-xs text-primary-foreground font-medium"
                  >
                    {["M", "J", "E", "S"][i - 1]}
                  </div>
                ))}
              </div>
              <p className="text-sm text-primary-foreground/70">
                <span className="font-semibold text-primary-foreground">1,200+</span> students funded this year
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card border-y border-border/50">
        <div className="container-wide">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16"
          >
            <Badge variant="outline" className="mb-4">
              Simple Process
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How EduRelief Works
            </h2>
            <p className="text-muted-foreground text-lg">
              Whether you're a student seeking support or a donor wanting to make a difference,
              our platform makes it simple and transparent.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card variant="gradient" className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {item.step}
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12"
          >
            <div>
              <Badge variant="outline" className="mb-4">
                Featured Campaigns
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                Students Who Need Your Support
              </h2>
            </div>
            <Button variant="outline" asChild>
              <Link to="/campaigns">
                View All Campaigns
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredCampaigns.map((campaign) => (
              <CampaignCard key={campaign.id} {...campaign} />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Badge variant="outline" className="mb-4">
                Why EduRelief
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                A Platform Built on Trust & Transparency
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We're not just another crowdfunding site. EduRelief is dedicated exclusively to education,
                ensuring every donation goes toward helping students achieve their academic dreams.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Shield,
                    title: "Verified Campaigns",
                    description: "Every campaign is reviewed for authenticity before going live.",
                  },
                  {
                    icon: Users,
                    title: "Education-Only Focus",
                    description: "100% dedicated to educational funding, nothing else.",
                  },
                  {
                    icon: CheckCircle,
                    title: "Transparent Tracking",
                    description: "See exactly where your donation goes with detailed updates.",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card variant="gradient" className="p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/10 rounded-full blur-3xl" />

                <div className="relative space-y-6">
                  <div className="text-center">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      Discover Funding Resources
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Beyond crowdfunding, explore ISAs, scholarships, and grants all in one place.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <Badge variant="isa">ISA</Badge>
                      <span className="text-sm font-medium">Income Share Agreements</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <Badge variant="scholarship">Scholarship</Badge>
                      <span className="text-sm font-medium">Merit & Need-Based Awards</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-background/50">
                      <Badge variant="grant">Grant</Badge>
                      <span className="text-sm font-medium">Government & Private Grants</span>
                    </div>
                  </div>

                  <Button variant="secondary" className="w-full" asChild>
                    <Link to="/resources">
                      Explore Resources
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
        <div className="container-wide text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Make a Difference?
            </h2>
            <p className="text-primary-foreground/80 text-lg">
              Whether you're a student seeking support or a donor wanting to invest in the future,
              EduRelief is here to connect you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="xl" variant="hero-outline" asChild>
                <Link to="/register">
                  I'm a Student
                </Link>
              </Button>
              <Button
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                asChild
              >
                <Link to="/register">
                  I'm a Donor
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
