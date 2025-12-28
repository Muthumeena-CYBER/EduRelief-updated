import { Link } from "react-router-dom";
import { GraduationCap, Heart, Mail, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <GraduationCap className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold">
                Edu<span className="text-primary">Relief</span>
              </span>
            </Link>
            <p className="text-background/70 text-sm leading-relaxed">
              Empowering students through transparent crowdfunding and verified education opportunities.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="#"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
              >
                <Linkedin className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-background/10 hover:bg-background/20 transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/campaigns"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Browse Campaigns
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Funding Resources
                </Link>
              </li>
              <li>
                <Link
                  to="/how-it-works"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Start a Campaign
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  ISA Programs
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Scholarships
                </Link>
              </li>
              <li>
                <Link
                  to="/resources"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  Grants
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-sm text-background/70 hover:text-background transition-colors"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@edurelief.org"
                  className="text-sm text-background/70 hover:text-background transition-colors flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  hello@edurelief.org
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} EduRelief. All rights reserved.
          </p>
          <p className="text-sm text-background/50 flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for students everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
