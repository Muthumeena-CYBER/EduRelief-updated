import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Heart, Users, Calendar, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

export interface CampaignCardProps {
  id: string;
  title: string;
  studentName: string;
  story: string;
  category: string;
  goalAmount: number;
  raisedAmount: number;
  donorCount: number;
  daysLeft: number;
  imageUrl?: string;
}

export function CampaignCard({
  id,
  title,
  studentName,
  story,
  category,
  goalAmount,
  raisedAmount,
  donorCount,
  daysLeft,
  imageUrl,
}: CampaignCardProps) {
  const progress = Math.min((raisedAmount / goalAmount) * 100, 100);
  const formattedGoal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(goalAmount);
  const formattedRaised = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(raisedAmount);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="interactive" className="overflow-hidden h-full flex flex-col">
        {/* Image */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 to-secondary/20">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-20">🎓</div>
            </div>
          )}
          <Badge variant="category" className="absolute top-3 left-3">
            {category}
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg line-clamp-2 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">by {studentName}</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {story}
          </p>

          {/* Progress */}
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">
                {formattedRaised}
              </span>
              <span className="text-muted-foreground">
                of {formattedGoal}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{donorCount} donors</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{daysLeft} days left</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-4 border-t border-border/50">
          <Button asChild className="w-full gap-2">
            <Link to={`/campaign/${id}`}>
              <Heart className="h-4 w-4" />
              Support Now
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
