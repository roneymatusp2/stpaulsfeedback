import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Linkedin, Twitter, Youtube } from "lucide-react";
import stPaulsLogo from "@/assets/st-pauls-logo.png";

const Footer = () => {
  const footerLinks = {
    platform: {
      title: "Platform",
      links: [
        { name: "Features", href: "#features" },
        { name: "Faculty Login", href: "/login" },
        { name: "Support", href: "/support" },
        { name: "Training Resources", href: "/training" },
        { name: "Platform Guide", href: "/guide" }
      ]
    },
    resources: {
      title: "Resources",
      links: [
        { name: "Best Practices", href: "/best-practices" },
        { name: "Faculty Handbook", href: "/handbook" },
        { name: "Professional Development", href: "/development" },
        { name: "Research & Innovation", href: "/research" },
        { name: "Community Forum", href: "/forum" }
      ]
    },
    school: {
      title: "Our School",
      links: [
        { name: "About St. Paul's", href: "https://www.stpauls.br" },
        { name: "Academic Departments", href: "/departments" },
        { name: "Faculty Directory", href: "/faculty" },
        { name: "School Leadership", href: "/leadership" },
        { name: "Contact Us", href: "/contact" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { name: "Help Centre", href: "/help" },
        { name: "Technical Support", href: "/tech-support" },
        { name: "Platform Updates", href: "/updates" },
        { name: "Feedback", href: "/feedback" },
        { name: "IT Services", href: "/it-services" }
      ]
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-4">
          <div className="flex items-center space-x-2 mb-6">
            <img 
              src={stPaulsLogo} 
              alt="St. Paul's School Logo" 
              className="h-12 w-auto"
            />
            <div>
              <span className="text-2xl font-bold">St. Paul's Feedback</span>
              <div className="text-sm text-secondary-foreground/80">Internal Teacher Development Platform</div>
            </div>
          </div>
          <p className="text-secondary-foreground/80 leading-relaxed mb-6">
            Supporting continuous professional development and collaborative learning 
            for all faculty members at St. Paul's School, São Paulo.
          </p>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-primary" />
                <span className="text-sm">feedback@stpauls.br</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-primary" />
                <span className="text-sm">+55 (11) 3087-3399</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="text-sm">Jardim Paulistano, São Paulo</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {Object.values(footerLinks).map((section, index) => (
                <div key={index}>
                  <h3 className="font-semibold text-white mb-4">{section.title}</h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="text-sm text-secondary-foreground/80 hover:text-white transition-colors"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter section removed */}

        <Separator className="bg-secondary-foreground/20 mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-sm text-secondary-foreground/60 mb-4 md:mb-0">
            © 2024 St. Paul's School, São Paulo. All rights reserved. | Internal Faculty Platform
          </div>
          
          {/* Social Links */}
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Linkedin className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Twitter className="h-4 w-4" />
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-secondary-foreground/10 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;