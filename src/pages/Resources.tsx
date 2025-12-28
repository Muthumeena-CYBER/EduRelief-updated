import { useState, useEffect } from "react";
import { Layout } from "@/components/layout";
import { FundingResourceCard } from "@/components/resources";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Search, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FundingResource {
  id: string;
  program_name: string;
  organization_name: string;
  description: string;
  funding_type: "isa" | "scholarship" | "grant" | "sponsored";
  eligibility: string;
  requirements: string;
  application_url: string;
}

const filterOptions = ["All", "ISA", "Scholarship", "Grant", "Sponsored"];

const Resources = () => {
  const [resources, setResources] = useState<FundingResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from("funding_resources")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setResources((data as FundingResource[]) || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.program_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.organization_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType =
      selectedType === "All" ||
      resource.funding_type.toLowerCase() === selectedType.toLowerCase();

    return matchesSearch && matchesType;
  });

  // Parse eligibility and requirements from strings to arrays
  const parseToArray = (text: string): string[] => {
    return text.split(/[,\n]/).map((item) => item.trim()).filter(Boolean);
  };

  return (
    <Layout>
      {/* Header */}
      <section className="bg-gradient-to-br from-secondary/10 via-background to-primary/5 py-16">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              Funding Resources
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Discover Education Funding
            </h1>
            <p className="text-lg text-muted-foreground">
              Explore verified ISAs, scholarships, and grants. Click "View Requirements" 
              on any card to see eligibility and apply on the official website.
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
                placeholder="Search programs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Type Filters */}
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((type) => (
                <Button
                  key={type}
                  variant={selectedType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type === "ISA" ? "Income Share Agreements" : type === "All" ? "All Types" : `${type}s`}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Resources List */}
      <section className="section-padding">
        <div className="container-wide">
          {loading ? (
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground mb-8">
                Showing {filteredResources.length} program{filteredResources.length !== 1 && "s"}
              </p>
              <div className="space-y-6">
                {filteredResources.map((resource) => (
                  <FundingResourceCard
                    key={resource.id}
                    id={resource.id}
                    programName={resource.program_name}
                    organizationName={resource.organization_name}
                    description={resource.description}
                    fundingType={resource.funding_type}
                    eligibility={parseToArray(resource.eligibility)}
                    requirements={parseToArray(resource.requirements)}
                    applicationUrl={resource.application_url}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No programs found
              </h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedType("All");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 bg-muted/30">
        <div className="container-tight text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            How We Curate Resources
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All programs listed on EduRelief are researched and verified. We redirect you to 
            official application pages—we never collect applications ourselves. Always verify 
            details on the provider's website before applying.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Resources;
