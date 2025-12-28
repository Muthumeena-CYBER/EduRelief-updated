import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import {
  Heart,
  IndianRupee,
  Users,
  TrendingUp,
  ExternalLink,
  Download,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface Donation {
  id: string;
  amount: number;
  message: string | null;
  is_anonymous: boolean;
  created_at: string;
  studentName?: string;
  campaigns: {
    id: string;
    title: string;
    student_id: string;
    status: string;
  } | null;
  profiles: {
    full_name: string;
  } | null;
}

const DonorDashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const navigate = useNavigate();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
      return;
    }
    if (!loading && role !== "donor") {
      navigate("/dashboard");
      return;
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDonations();
    }
  }, [user]);

  const fetchDonations = async () => {
    try {
      const { data } = await supabase
        .from("donations")
        .select(`
          id,
          amount,
          message,
          is_anonymous,
          created_at,
          campaigns (
            id,
            title,
            student_id,
            status
          )
        `)
        .eq("donor_id", user?.id)
        .order("created_at", { ascending: false });

      if (data) {
        // Fetch student names for receipts
        const studentIds = [...new Set((data as any[]).map(d => d.campaigns?.student_id).filter(Boolean))];
        const { data: studentProfiles } = await supabase
          .from("profiles")
          .select("user_id, full_name")
          .in("user_id", studentIds);

        const profileMap = new Map(studentProfiles?.map(p => [p.user_id, p.full_name]) || []);

        const donationsWithProfiles = (data as any[]).map(d => ({
          ...d,
          studentName: profileMap.get(d.campaigns?.student_id) || "Student"
        }));
        setDonations(donationsWithProfiles);
      }
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const downloadReceipt = async (donation: any) => {
    const receiptId = `receipt-${donation.id}`;
    const receiptElement = document.getElementById(receiptId);
    if (!receiptElement) return;

    try {
      const canvas = await html2canvas(receiptElement, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EduRelief_Receipt_${donation.id.slice(0, 8)}.pdf`);
    } catch (error) {
      console.error("Receipt generation failed:", error);
    }
  };

  const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  const campaignsSupported = new Set(donations.map((d) => d.campaigns?.id)).size;

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
          {/* Header */}
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
                Track your impact and discover more students to support.
              </p>
            </div>
            <Button asChild>
              <Link to="/campaigns">
                <Heart className="h-4 w-4 mr-2" />
                Find Campaigns
              </Link>
            </Button>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <IndianRupee className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Donated</p>
                      <p className="text-2xl font-bold text-foreground">
                        ₹{totalDonated.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Students Supported</p>
                      <p className="text-2xl font-bold text-foreground">{campaignsSupported}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Donations</p>
                      <p className="text-2xl font-bold text-foreground">{donations.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Donation History */}
          <Card>
            <CardHeader>
              <CardTitle>Donation History</CardTitle>
              <CardDescription>
                {donations.length === 0
                  ? "You haven't made any donations yet."
                  : `You've made ${donations.length} donation${donations.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">💝</div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Make Your First Impact
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Browse campaigns and support a student's educational journey.
                  </p>
                  <Button asChild>
                    <Link to="/campaigns">Browse Campaigns</Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Campaign
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {donations.map((donation: any) => (
                        <tr
                          key={donation.id}
                          className="border-b border-border hover:bg-muted/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm text-foreground">
                            {new Date(donation.created_at).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex flex-col">
                              {donation.campaigns ? (
                                <Link
                                  to={`/campaign/${donation.campaigns.id}`}
                                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                                  key={donation.id}>
                                  {donation.campaigns.title}
                                </Link>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  Campaign removed
                                </span>
                              )}
                              <span className="text-[10px] text-muted-foreground">Student: {donation.studentName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-foreground">
                            ₹{Number(donation.amount).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant={
                                donation.campaigns?.status === "active"
                                  ? "default"
                                  : donation.campaigns?.status === "completed"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {donation.campaigns?.status || "N/A"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="ghost" size="sm" className="h-8 gap-2" onClick={() => downloadReceipt(donation)}>
                              <Download className="h-3.5 w-3.5" />
                              Receipt
                            </Button>

                            {/* Hidden Receipt Template */}
                            <div id={`receipt-${donation.id}`} className="p-12 bg-white text-left border rounded-lg" style={{ width: '800px', position: 'absolute', left: '-9999px', color: '#000' }}>
                              <div className="flex justify-between items-start border-b-4 border-primary pb-8 mb-8">
                                <div>
                                  <h1 className="text-4xl font-black text-primary mb-2">EDURELIEF</h1>
                                  <p className="text-gray-600 font-medium">OFFICIAL DONATION RECEIPT</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-2xl"># {donation.id.slice(0, 8).toUpperCase()}</p>
                                  <p className="text-gray-500">Date: {new Date(donation.created_at).toLocaleDateString()}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-12 mb-12">
                                <div>
                                  <h3 className="font-bold text-primary uppercase text-sm border-b mb-4 pb-1">Charity Information</h3>
                                  <p className="font-bold text-xl">EduRelief Foundation</p>
                                  <p className="text-gray-700">123 Education Way, Tech City</p>
                                  <p className="text-gray-700">Charity Reg: ER-99283-X</p>
                                </div>
                                <div>
                                  <h3 className="font-bold text-primary uppercase text-sm border-b mb-4 pb-1">Donor Information</h3>
                                  <p className="font-bold text-xl">{profile?.full_name}</p>
                                  <p className="text-gray-700">{profile?.email}</p>
                                </div>
                              </div>

                              <div className="bg-gray-50 p-8 rounded-2xl border mb-12">
                                <h3 className="font-bold text-primary uppercase text-sm mb-6">Support Summary</h3>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600 font-medium">Campaign Name</span>
                                    <span className="font-bold text-gray-900">{donation.campaigns?.title}</span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600 font-medium">Student Name</span>
                                    <span className="font-bold text-gray-900">{donation.studentName}</span>
                                  </div>
                                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                                    <span className="text-gray-600 font-medium">Payment Method</span>
                                    <span className="font-bold text-gray-900 text-green-600">UPI/QR Verified</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-8">
                                    <span className="text-2xl font-black text-gray-900 uppercase">Donation Total</span>
                                    <span className="text-4xl font-black text-primary">₹{Number(donation.amount).toLocaleString('en-IN')}</span>
                                  </div>
                                </div>
                              </div>

                              <div className="text-center pt-12 border-t border-dashed">
                                <p className="text-gray-600 mb-4 px-12">This receipt is officially issued for tax concession purposes under educational support grants. Thank you for making a difference.</p>
                                <div className="flex justify-center gap-2 items-center">
                                  <div className="h-1 w-12 bg-primary"></div>
                                  <p className="font-bold text-primary text-xl">GRATITUDE</p>
                                  <div className="h-1 w-12 bg-primary"></div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default DonorDashboard;
