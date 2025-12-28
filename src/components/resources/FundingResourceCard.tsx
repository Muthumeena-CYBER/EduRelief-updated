import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export interface FundingResourceCardProps {
  id: string;
  programName: string;
  organizationName: string;
  description: string;
  fundingType: "isa" | "scholarship" | "grant" | "sponsored";
  eligibility: string[];
  requirements: string[];
  notes?: string;
  applicationUrl: string;
}

export function FundingResourceCard({
  programName,
  organizationName,
  description,
  fundingType,
  eligibility,
  requirements,
  notes,
  applicationUrl,
}: FundingResourceCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getBadgeVariant = () => {
    switch (fundingType) {
      case "isa":
        return "isa";
      case "scholarship":
        return "scholarship";
      case "grant":
        return "grant";
      default:
        return "default";
    }
  };

  const getFundingTypeLabel = () => {
    switch (fundingType) {
      case "isa":
        return "Income Share Agreement";
      case "scholarship":
        return "Scholarship";
      case "grant":
        return "Grant";
      case "sponsored":
        return "Sponsored Program";
      default:
        return fundingType;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="elevated" className="overflow-hidden">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={getBadgeVariant()}>
                    {getFundingTypeLabel()}
                  </Badge>
                </div>
                <CardTitle className="text-xl">{programName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  by {organizationName}
                </p>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 shrink-0">
                  View Requirements
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </Button>
              </CollapsibleTrigger>
            </div>
            <p className="text-sm text-muted-foreground mt-2">{description}</p>
          </CardHeader>

          <AnimatePresence>
            {isOpen && (
              <CollapsibleContent forceMount asChild>
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <CardContent className="border-t border-border/50 pt-6 space-y-6">
                    {/* Eligibility */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">
                        Eligibility Criteria
                      </h4>
                      <ul className="space-y-2">
                        {eligibility.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className="font-semibold text-sm mb-3 text-foreground">
                        Requirements
                      </h4>
                      <ul className="space-y-2">
                        {requirements.map((item, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-2 text-sm text-muted-foreground"
                          >
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Notes */}
                    {notes && (
                      <div className="bg-accent/10 rounded-xl p-4">
                        <h4 className="font-semibold text-sm mb-2 text-foreground">
                          Important Notes
                        </h4>
                        <p className="text-sm text-muted-foreground">{notes}</p>
                      </div>
                    )}

                    {/* Apply Button */}
                    <Button
                      asChild
                      size="lg"
                      className="w-full sm:w-auto gap-2"
                    >
                      <a
                        href={applicationUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Apply on Official Website
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </CardContent>
                </motion.div>
              </CollapsibleContent>
            )}
          </AnimatePresence>
        </Collapsible>
      </Card>
    </motion.div>
  );
}
