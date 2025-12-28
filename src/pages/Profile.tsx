import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout";

const Profile = () => {
  const { user, profile } = useAuth();

  if (!user) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground px-4 py-8">
        <div className="max-w-3xl mx-auto bg-card border border-border rounded-2xl shadow-xl p-8 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-border text-2xl font-bold">
              {(profile?.full_name || user.email || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground font-black">Profile</p>
              <h1 className="text-2xl font-black">{profile?.full_name || user.user_metadata?.full_name || user.email}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="text-sm text-foreground">
            <h2 className="text-lg font-semibold mt-4 mb-2">Account Details</h2>
            <div className="grid gap-2">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Joined:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
