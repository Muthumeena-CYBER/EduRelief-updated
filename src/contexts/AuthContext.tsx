import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AppRole = "student" | "donor";

interface AuthContextType {
  user: User | null;
  role: AppRole | null;
  profile: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthContextType["profile"]>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user);
      } else {
        setRole(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (authUser: User) => {
    // Only fetch if we have an email
    if (!authUser.email) {
      setLoading(false);
      return;
    }

    try {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", authUser.email)
        .maybeSingle();

      if (profileData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name,
          email: profileData.email,
          avatar_url: profileData.avatar_url,
          bio: profileData.bio,
        });

        // Use the profile ID to find the role
        // Note: The schema uses TEXT for user_id in user_roles now
        // But with Supabase Auth we ideally used the auth.uid(), but we changed schema to TEXT.
        // It's okay, auth.uid() is a UUID string, so it fits in TEXT.

        let userIdToQuery = profileData.user_id;

        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", userIdToQuery)
          .maybeSingle();

        if (roleData) {
          setRole(roleData.role as AppRole);
        }
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        profile,
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
