import { useState } from "react";
import { motion } from "framer-motion";
import { Code2, MonitorPlay, MessageSquareText, Lightbulb, ChevronRight, Zap } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { AnimatedSection } from "@/components/AnimatedSection";
import { PremiumButton } from "@/components/ui/PremiumButton";
import { ServiceModal, type ServiceType } from "@/components/ServiceModal";

const services = [
  {
    id: "webdev" as const,
    title: "Web Development",
    description: "Custom, high-performance web applications tailored to your specific business requirements.",
    icon: MonitorPlay,
    price: "Custom Quote",
    color: "from-cyan-500 to-blue-500",
    shadow: "group-hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
  },
  {
    id: "consultation" as const,
    title: "Consultation Service",
    description: "Expert guidance for DSA, placement prep, interview strategy, and career growth.",
    icon: MessageSquareText,
    price: "₹500 / hr",
    color: "from-purple-500 to-pink-500",
    shadow: "group-hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]"
  },
  {
    id: "csfunda" as const,
    title: "CS Fundamentals",
    description: "Master OS, Computer Networks, and DBMS. Each session is 1 hour. Package-based pricing.",
    icon: Code2,
    price: "₹2000 / 4 sessions",
    color: "from-orange-500 to-red-500",
    shadow: "group-hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]"
  },
  {
    id: "project" as const,
    title: "Project Guidance & Resume Review",
    description: "Hands-on project mentorship and professional resume review to make you stand out.",
    icon: Lightbulb,
    price: "₹300 / session (1 hr)",
    color: "from-green-500 to-emerald-500",
    shadow: "group-hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]"
  }
];

export default function Home() {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);

  const scrollTo = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Orbs */}
      <div className="bg-blob bg-primary w-[500px] h-[500px] top-[-200px] left-[-100px]" />
      <div className="bg-blob bg-secondary w-[600px] h-[600px] top-[40%] right-[-200px]" style={{ animationDelay: '-5s' }} />
      <div className="bg-blob bg-accent w-[400px] h-[400px] bottom-[-100px] left-[20%]" style={{ animationDelay: '-10s' }} />

      <Navigation />

      <main>
        {/* HERO SECTION */}
        <section id="home" className="relative pt-32 pb-20 md:pt-48 md:pb-32 flex items-center justify-center min-h-[90vh]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-primary/20 text-primary mb-8">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium tracking-wide uppercase">Expert Mentorship by TechieSteve</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight mb-6 leading-[1.1]">
                Accelerate Your <br />
                <span className="gradient-text text-glow">Engineering Career.</span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                Learn faster, build better projects, and unlock elite-level software engineering skills with personalized technical coaching.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <PremiumButton size="lg" onClick={() => scrollTo("#services")}>
                  Explore Services
                </PremiumButton>
                <PremiumButton variant="outline" size="lg" onClick={() => scrollTo("#contact")}>
                  Contact Now
                </PremiumButton>
              </div>
            </motion.div>
          </div>
        </section>

        {/* SERVICES SECTION */}
        <AnimatedSection id="services">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-4">Premium Services</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Select a track below to start your journey.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, rotateX: 2, rotateY: -2 }}
                onClick={() => setSelectedService(service.id)}
                className={`group cursor-pointer glass-card rounded-2xl p-8 transition-all duration-300 ${service.shadow}`}
                style={{ perspective: "1000px" }}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.color} p-[1px] mb-6`}>
                  <div className="w-full h-full bg-background rounded-[11px] flex items-center justify-center">
                    <service.icon className="w-6 h-6 text-foreground" />
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-3 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-muted-foreground mb-6 line-clamp-2">{service.description}</p>
                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <span className="font-semibold text-foreground/90">{service.price}</span>
                  <span className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                    Request <ChevronRight className="w-4 h-4 ml-1" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedSection>

        {/* PRICING SUMMARY SECTION */}
        <AnimatedSection id="pricing" className="bg-white/[0.02] border-y border-white/5 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-12">Transparent Pricing</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {services.map((s) => (
                <div key={s.id} className="p-6 rounded-2xl border border-white/10 bg-background/50 backdrop-blur-sm flex flex-col justify-center">
                  <h4 className="text-sm text-muted-foreground font-medium mb-2">{s.title}</h4>
                  <p className="text-xl font-display font-bold text-foreground">{s.price}</p>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* CONTACT SECTION */}
        <AnimatedSection id="contact" className="min-h-[60vh] flex flex-col justify-center items-center text-center">
          <div className="glass-card p-12 rounded-3xl max-w-3xl w-full mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to level up?</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-xl mx-auto">
                Don't wait. Select a service that fits your goals and let's start building your future today.
              </p>
              <PremiumButton size="lg" variant="secondary" onClick={() => scrollTo("#services")}>
                View Services & Book
              </PremiumButton>
            </div>
          </div>
        </AnimatedSection>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-background/50 backdrop-blur-lg py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-display font-bold text-xs text-background">
                  B
                </div>
                <span className="font-display font-bold text-lg">ByteMentorX</span>
              </div>
              <p className="text-sm text-muted-foreground">Build Faster. Learn Smarter. Get Ahead.</p>
            </div>
            
          </div>
        </div>
      </footer>

      {/* MODAL MANAGER */}
      {selectedService && (
        <ServiceModal 
          service={selectedService} 
          onClose={() => setSelectedService(null)} 
        />
      )}
    </div>
  );
}
