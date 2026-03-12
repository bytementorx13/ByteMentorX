import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { WebDevForm, ConsultationForm, CSFundaForm, ProjectForm } from "./forms/ServiceForms";
import { PremiumButton } from "./ui/PremiumButton";

export type ServiceType = "webdev" | "consultation" | "csfunda" | "project" | null;

interface ServiceModalProps {
  service: ServiceType;
  onClose: () => void;
}

const serviceTitles = {
  webdev: "Web Development Service",
  consultation: "Consultation Service",
  csfunda: "CS Fundamentals Teaching",
  project: "Project Guidance & Resume Review",
};

export function ServiceModal({ service, onClose }: ServiceModalProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  if (!service) return null;

  const handleSuccess = () => {
    setIsSuccess(true);
  };

  const resetAndClose = () => {
    setIsSuccess(false);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-2xl shadow-2xl z-10"
        >
          <div className="sticky top-0 z-20 flex justify-between items-center p-6 border-b border-white/10 bg-background/50 backdrop-blur-xl">
            <h2 className="text-2xl font-display font-bold text-foreground">
              {isSuccess ? "Request Received" : serviceTitles[service]}
            </h2>
            <button
              onClick={resetAndClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-2xl font-display font-bold mb-4">Awesome!</h3>
                <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
                  Your request has been submitted successfully. TechieSteve will contact you soon to schedule a Google Meet.
                </p>
                <PremiumButton onClick={resetAndClose}>
                  Done
                </PremiumButton>
              </motion.div>
            ) : (
              <div className="pb-8">
                {service === "webdev" && <WebDevForm serviceType="webdev" onSuccess={handleSuccess} />}
                {service === "consultation" && <ConsultationForm serviceType="consultation" onSuccess={handleSuccess} />}
                {service === "csfunda" && <CSFundaForm serviceType="csfunda" onSuccess={handleSuccess} />}
                {service === "project" && <ProjectForm serviceType="project" onSuccess={handleSuccess} />}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
