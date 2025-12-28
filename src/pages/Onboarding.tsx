import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GraduationCap, Heart, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Onboarding = () => {
    const { user, role: currentRole, loading: contextLoading } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // If user already has a role, redirect to dashboard/home
        if (!contextLoading && currentRole) {
            if (currentRole === 'student') navigate('/dashboard');
            else if (currentRole === 'donor') navigate('/donor-dashboard');
            else navigate('/');
        }
    }, [currentRole, contextLoading, navigate]);

    const handleRoleSelection = async (role: "student" | "donor") => {
        if (!user || !user.email) return;
        setLoading(true);

        try {
            // 1. Check if profile exists
            let { data: profileData, error: fetchError } = await supabase
                .from("profiles")
                .select("*")
                .eq("email", user.email)
                .maybeSingle();

            if (fetchError) throw fetchError;

            if (!profileData) {
                // 2. Create Profile if it doesn't exist
                // Use user.id which is the Supabase UUID
                const { data: newProfile, error: createError } = await supabase
                    .from("profiles")
                    .insert({
                        email: user.email,
                        full_name: user.user_metadata?.full_name || user.email.split("@")[0],
                        avatar_url: user.user_metadata?.avatar_url,
                        user_id: user.id,
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                profileData = newProfile;
            }

            // 3. Assign Role
            const { error: roleError } = await supabase.from("user_roles").insert({
                user_id: profileData.user_id,
                role: role,
            });

            if (roleError) {
                if (roleError.code === '23505') {
                    console.log("Role already assigned");
                } else {
                    throw roleError;
                }
            }

            toast({
                title: "Welcome to EduRelief!",
                description: `You have successfully joined as a ${role}.`,
            });

            window.location.href = role === "student" ? "/dashboard" : "/donor-dashboard";

        } catch (error: any) {
            console.error("Error saving role:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to save your role. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (contextLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full space-y-8 text-center"
            >
                <div className="space-y-4">
                    <Badge variant="outline" className="mb-4">
                        Welcome, {user?.user_metadata?.full_name?.split(" ")[0] || "User"}!
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                        How would you like to use EduRelief?
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                        Select your primary role to customize your experience.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
                    {/* Student Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer"
                        onClick={() => handleRoleSelection("student")}
                    >
                        <Card className="h-full border-2 hover:border-primary/50 transition-colors">
                            <CardContent className="pt-8 pb-8 px-6 space-y-6 flex flex-col items-center text-center h-full">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <GraduationCap className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">I am a Student</h3>
                                    <p className="text-muted-foreground">
                                        I want to create campaigns, raise funds for my education, and find resources.
                                    </p>
                                </div>
                                <div className="mt-auto pt-4">
                                    <Button variant="default" className="w-full" size="lg" disabled={loading}>
                                        Join as Student <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Donor Card */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="cursor-pointer"
                        onClick={() => handleRoleSelection("donor")}
                    >
                        <Card className="h-full border-2 hover:border-secondary/50 transition-colors">
                            <CardContent className="pt-8 pb-8 px-6 space-y-6 flex flex-col items-center text-center h-full">
                                <div className="w-20 h-20 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                                    <Heart className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">I am a Donor</h3>
                                    <p className="text-muted-foreground">
                                        I want to discover inspiring students, fund their dreams, and track my impact.
                                    </p>
                                </div>
                                <div className="mt-auto pt-4">
                                    <Button variant="secondary" className="w-full" size="lg" disabled={loading}>
                                        Join as Donor <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
};

export default Onboarding;
