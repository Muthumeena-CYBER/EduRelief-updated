import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DocumentUploadProps {
  campaignId?: string;
}

type DocumentType = "student_id" | "admission_letter" | "fee_receipt";

interface UploadStatus {
  type: "idle" | "uploading" | "success" | "error";
  message?: string;
}

const DOCUMENT_TYPES = [
  { value: "student_id", label: "Student ID" },
  { value: "admission_letter", label: "Admission Letter" },
  { value: "fee_receipt", label: "Fee Receipt / Fee Structure" }
] as const;

const ACCEPTED_FILE_TYPES = ".pdf,.jpg,.jpeg,.png";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const DocumentUpload = ({ campaignId }: DocumentUploadProps) => {
  const { user } = useAuth();
  const [documentType, setDocumentType] = useState<DocumentType | "">("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ type: "idle" });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setUploadStatus({
        type: "error",
        message: "Invalid file type. Only PDF, JPG, and PNG files are allowed."
      });
      event.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadStatus({
        type: "error",
        message: "File size exceeds 5MB limit."
      });
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
    setUploadStatus({ type: "idle" });
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentType) {
      setUploadStatus({
        type: "error",
        message: "Please select a document type and file."
      });
      return;
    }

    if (!user) {
      setUploadStatus({
        type: "error",
        message: "You must be logged in to upload documents."
      });
      return;
    }

    setUploadStatus({ type: "uploading", message: "Uploading document..." });

    try {
      const formData = new FormData();
      formData.append("document", selectedFile);
      formData.append("documentType", documentType);
      formData.append("userId", user.id);
      if (campaignId) {
        formData.append("campaignId", campaignId);
      }

      const response = await fetch("http://localhost:3001/api/documents/upload", {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUploadStatus({
          type: "success",
          message: "Document uploaded successfully!"
        });
        
        // Reset form
        setSelectedFile(null);
        setDocumentType("");
        
        // Reset file input
        const fileInput = document.getElementById("document-file") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      } else {
        setUploadStatus({
          type: "error",
          message: data.message || "Failed to upload document."
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus({
        type: "error",
        message: "Network error. Please make sure the backend server is running."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Verification Documents
        </CardTitle>
        <CardDescription>
          Upload one mandatory document for campaign verification (Student ID, Admission Letter, or Fee Receipt)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Document Type Dropdown */}
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type*</Label>
          <Select
            value={documentType}
            onValueChange={(value) => setDocumentType(value as DocumentType)}
          >
            <SelectTrigger id="document-type">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {DOCUMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* File Input */}
        <div className="space-y-2">
          <Label htmlFor="document-file">Upload Document*</Label>
          <div className="flex items-center gap-2">
            <input
              id="document-file"
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              onChange={handleFileChange}
              aria-label="Upload document file"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Accepted formats: PDF, JPG, PNG (Max 5MB)
          </p>
        </div>

        {/* Selected File Display */}
        {selectedFile && (
          <div className="p-3 bg-muted/50 rounded-lg flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm flex-1">{selectedFile.name}</span>
            <span className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </span>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !documentType || uploadStatus.type === "uploading"}
          className="w-full"
        >
          {uploadStatus.type === "uploading" ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Document
            </>
          )}
        </Button>

        {/* Status Messages */}
        {uploadStatus.type === "success" && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {uploadStatus.message}
            </AlertDescription>
          </Alert>
        )}

        {uploadStatus.type === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadStatus.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
