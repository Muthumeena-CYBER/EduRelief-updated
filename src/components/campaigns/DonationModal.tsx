import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { IndianRupee, Download, CheckCircle2, Clock } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface DonationModalProps {
    isOpen: boolean;
    onClose: () => void;
    campaignTitle: string;
    studentName: string;
    onDonate: (amount: number, message: string, isAnonymous: boolean) => Promise<void>;
}

export function DonationModal({
    isOpen,
    onClose,
    campaignTitle,
    studentName,
    onDonate
}: DonationModalProps) {
    const [step, setStep] = useState<"details" | "payment" | "success">("details");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [donorName, setDonorName] = useState("");
    const [company, setCompany] = useState("");
    const [timeLeft, setTimeLeft] = useState(60);
    const [isProcessing, setIsProcessing] = useState(false);
    const [receiptNumber] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (step === "payment" && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            onClose();
            setStep("details");
            setTimeLeft(60);
        }
        return () => clearInterval(timer);
    }, [step, timeLeft, onClose]);

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(amount) > 0) {
            setStep("payment");
            setTimeLeft(60);
        }
    };

    const handlePaymentConfirm = async () => {
        setIsProcessing(true);
        try {
            await onDonate(parseFloat(amount), message, isAnonymous);
            setStep("success");
        } catch (error) {
            console.error("Donation error:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    const downloadReceipt = async () => {
        const receiptElement = document.getElementById("donation-receipt");
        if (!receiptElement) return;

        const canvas = await html2canvas(receiptElement, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`EduRelief_Receipt_${receiptNumber}.pdf`);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                {step === "details" && (
                    <form onSubmit={handleDetailsSubmit} className="space-y-6">
                        <DialogHeader>
                            <DialogTitle>Support {studentName}</DialogTitle>
                            <DialogDescription>
                                Enter your donation details to support "{campaignTitle}"
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount">Donation Amount (₹)</Label>
                                <div className="relative">
                                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        required
                                        placeholder="Enter amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="pl-9"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="donorName">Full Name (for receipt)</Label>
                                <Input
                                    id="donorName"
                                    required
                                    placeholder="Your full name"
                                    value={donorName}
                                    onChange={(e) => setDonorName(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="company">Company (Optional)</Label>
                                <Input
                                    id="company"
                                    placeholder="Your company name"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="message">Encouraging Message (Optional)</Label>
                                <Input
                                    id="message"
                                    placeholder="Write a message to the student..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-2 pt-2">
                                <Checkbox
                                    id="anonymous"
                                    checked={isAnonymous}
                                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                                />
                                <Label htmlFor="anonymous" className="text-sm font-normal">
                                    Make this donation anonymous on the public page
                                </Label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full">
                            Continue to Payment
                        </Button>
                    </form>
                )}

                {step === "payment" && (
                    <div className="space-y-6 text-center">
                        <DialogHeader>
                            <DialogTitle>Scan to Pay</DialogTitle>
                            <DialogDescription>
                                Complete your payment of ₹{amount} within the next minute
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex flex-col items-center justify-center p-6 bg-muted rounded-xl relative overflow-hidden">
                            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                <img
                                    src="/official-qr.png"
                                    alt="EduRelief Official QR Code"
                                    className="w-48 h-48 object-contain"
                                />
                            </div>

                            <div className="flex items-center gap-2 text-primary font-medium">
                                <Clock className="h-4 w-4" />
                                <span>00:{timeLeft.toString().padStart(2, '0')}</span>
                            </div>
                        </div>

                        <div className="text-sm text-muted-foreground bg-primary/5 p-4 rounded-lg">
                            <p>Once you've scanned and completed the payment in your app, click the button below to confirm.</p>
                        </div>

                        <Button
                            onClick={handlePaymentConfirm}
                            className="w-full"
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Verifying..." : "I have completed the payment"}
                        </Button>
                    </div>
                )}

                {step === "success" && (
                    <div className="space-y-6 text-center">
                        <div className="flex justify-center">
                            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                <CheckCircle2 className="h-12 w-12" />
                            </div>
                        </div>

                        <DialogHeader>
                            <DialogTitle className="text-2xl">Thank You!</DialogTitle>
                            <DialogDescription>
                                Your donation of ₹{amount} to {studentName} was successful.
                            </DialogDescription>
                        </DialogHeader>

                        {/* Hidden Receipt Template for PDF Generation */}
                        <div id="donation-receipt" className="p-8 bg-white text-left border rounded-lg shadow-sm" style={{ width: '800px', position: 'absolute', left: '-9999px' }}>
                            <div className="flex justify-between items-start border-b-2 pb-6 mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-primary mb-1">EDURELIEF RECEIPT</h1>
                                    <p className="text-muted-foreground">Empowering futures through education</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-xl">RECEIPT NO: #{receiptNumber}</p>
                                    <p className="text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 mb-8">
                                <div>
                                    <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Charity Details</h3>
                                    <p className="font-bold">EduRelief Foundation</p>
                                    <p className="text-sm">123 Education Way, Tech City</p>
                                    <p className="text-sm">Charity Reg No: ER-99283-X</p>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-500 uppercase text-xs mb-2">Donated By</h3>
                                    <p className="font-bold">{donorName}</p>
                                    {company && <p className="text-sm">{company}</p>}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg mb-8">
                                <h3 className="font-bold text-gray-500 uppercase text-xs mb-4">Donation Information</h3>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span>Campaign Supported</span>
                                    <span className="font-medium">{campaignTitle}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b">
                                    <span>Student Name</span>
                                    <span className="font-medium">{studentName}</span>
                                </div>
                                <div className="flex justify-between items-center py-4 text-xl">
                                    <span className="font-bold">Total Amount</span>
                                    <span className="font-bold text-primary">₹{parseFloat(amount).toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            <div className="text-center text-sm text-muted-foreground">
                                <p className="mb-2">This is a tax-deductible donation receipt.</p>
                                <p className="font-medium text-gray-900 italic">Thank you for your generous contribution!</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button onClick={downloadReceipt} variant="outline" className="w-full gap-2">
                                <Download className="h-4 w-4" />
                                Download PDF Receipt
                            </Button>
                            <Button onClick={() => { onClose(); setStep("details"); }} className="w-full">
                                Back to Campaign
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
