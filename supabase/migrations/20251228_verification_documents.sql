-- Create verification_documents table
CREATE TABLE IF NOT EXISTS verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('student_id', 'admission_letter', 'fee_receipt')),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  verified BOOLEAN DEFAULT FALSE,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_verification_documents_user_id ON verification_documents(user_id);
CREATE INDEX idx_verification_documents_campaign_id ON verification_documents(campaign_id);
CREATE INDEX idx_verification_documents_document_type ON verification_documents(document_type);

-- Enable Row Level Security
ALTER TABLE verification_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_documents table

-- Users can view their own documents
CREATE POLICY "Users can view own documents"
  ON verification_documents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own documents
CREATE POLICY "Users can insert own documents"
  ON verification_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own documents (e.g., replace a document)
CREATE POLICY "Users can update own documents"
  ON verification_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
  ON verification_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Admin policy (if you have an admin role)
-- CREATE POLICY "Admins can view all documents"
--   ON verification_documents
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE profiles.user_id = auth.uid()
--       AND profiles.role = 'admin'
--     )
--   );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_verification_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_verification_documents_updated_at
  BEFORE UPDATE ON verification_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_verification_documents_updated_at();

-- Add comment to table
COMMENT ON TABLE verification_documents IS 'Stores verification documents uploaded by students for campaign verification';
COMMENT ON COLUMN verification_documents.document_type IS 'Type of document: student_id, admission_letter, or fee_receipt';
COMMENT ON COLUMN verification_documents.verified IS 'Whether the document has been verified by an admin';
