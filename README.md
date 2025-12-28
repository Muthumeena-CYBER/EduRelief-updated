# EduRelief - Empowering Education

EduRelief is a decentralized crowdfunding platform designed to empower students to pursue their educational dreams through community support. We bridge the gap between ambitious students and generous donors.

## Features

- **Student Dashboard**: Manage campaigns, track funding progress, and share your story.
- **Donor Impact**: Discover verified student campaigns and support them directly.
- **Transparent Funding**: Every donation is tracked and verified.
- **Official Receipts**: Donors receive official PDF receipts for their contributions.
- **Curated Resources**: A dedicated section for finding scholarships, grants, and ISA programs.

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn-ui
- **Backend**: Supabase (Database & Authentication)
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js & npm installed

### Local Development

1. **Clone the repository**
   ```sh
   git clone <your-repo-url>
   cd funding-futures
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```sh
   npm run dev
   ```

## Deployment

The application can be deployed to any static hosting provider like Vercel, Netlify, or AWS Amplify. Ensure that the environment variables are configured in your deployment settings.

## License

This project is licensed under the MIT License.
