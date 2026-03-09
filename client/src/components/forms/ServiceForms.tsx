import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PremiumInput, PremiumTextarea, PremiumSelect } from "../ui/PremiumInput";
import { PremiumButton } from "../ui/PremiumButton";
import { useCreateRequest } from "@/hooks/use-requests";

interface FormProps {
  onSuccess: () => void;
  serviceType: string;
}

// --- Common Fields Schema ---
const commonSchema = {
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
};

// --- Web Development Form ---
const webDevSchema = z.object({
  ...commonSchema,
  projectDesc: z.string().min(10, "Please provide more details about your project"),
  features: z.string().min(10, "Please list some core features"),
  timeline: z.string().min(2, "Expected timeline is required"),
  budget: z.string().optional(),
  links: z.string().optional(),
});

export function WebDevForm({ onSuccess, serviceType }: FormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof webDevSchema>>({
    resolver: zodResolver(webDevSchema)
  });
  const createRequest = useCreateRequest();

  const onSubmit = (data: z.infer<typeof webDevSchema>) => {
    createRequest.mutate({
      serviceType,
      name: data.name,
      email: data.email,
      formData: {
        projectDesc: data.projectDesc,
        features: data.features,
        timeline: data.timeline,
        budget: data.budget,
        links: data.links
      },
    }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Your Name" {...register("name")} error={errors.name?.message} required />
        <PremiumInput label="Email Address" type="email" {...register("email")} error={errors.email?.message} required />
      </div>
      <PremiumTextarea label="Project Description" placeholder="What are we building?" {...register("projectDesc")} error={errors.projectDesc?.message} required />
      <PremiumTextarea label="Required Features" placeholder="Core functionalities needed..." {...register("features")} error={errors.features?.message} required />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Expected Timeline" placeholder="e.g., 4 weeks" {...register("timeline")} error={errors.timeline?.message} required />
        <PremiumInput label="Budget (Optional)" placeholder="e.g., $1000" {...register("budget")} />
      </div>
      <PremiumInput label="Reference Links (Optional)" placeholder="Any inspiration?" {...register("links")} />
      
      <div className="pt-4">
        <PremiumButton type="submit" className="w-full" isLoading={createRequest.isPending}>
          Submit Request
        </PremiumButton>
      </div>
    </form>
  );
}

// --- Consultation Form ---
const consultSchema = z.object({
  ...commonSchema,
  topic: z.string().min(1, "Please select a topic"),
  hours: z.coerce.number().min(1, "Minimum 1 hour required"),
  level: z.string().min(1, "Please select your current level"),
  goals: z.string().min(5, "Please share your goals"),
  meetingTime: z.string().min(2, "Please suggest a time"),
});

export function ConsultationForm({ onSuccess, serviceType }: FormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof consultSchema>>({
    resolver: zodResolver(consultSchema),
    defaultValues: { hours: 1, topic: "", level: "" }
  });
  const createRequest = useCreateRequest();
  
  const hours = watch("hours") || 0;
  const price = hours * 500;

  const onSubmit = (data: z.infer<typeof consultSchema>) => {
    createRequest.mutate({
      serviceType,
      name: data.name,
      email: data.email,
      calculatedPrice: price,
      formData: {
        topic: data.topic,
        hours: data.hours,
        level: data.level,
        goals: data.goals,
        meetingTime: data.meetingTime
      },
    }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Your Name" {...register("name")} error={errors.name?.message} required />
        <PremiumInput label="Email Address" type="email" {...register("email")} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumSelect 
          label="Consultation Topic" 
          options={[
            { value: "dsa", label: "DSA Guidance" },
            { value: "placement", label: "Placement Prep" },
            { value: "interview", label: "Interview Prep" },
            { value: "career", label: "Career Strategy" }
          ]}
          {...register("topic")} 
          error={errors.topic?.message} 
          required 
        />
        <PremiumInput label="Number of Hours" type="number" min="1" {...register("hours")} error={errors.hours?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumSelect 
          label="Current Level" 
          options={[
            { value: "beginner", label: "Beginner" },
            { value: "intermediate", label: "Intermediate" },
            { value: "advanced", label: "Advanced" }
          ]}
          {...register("level")} 
          error={errors.level?.message} 
          required 
        />
        <PremiumInput label="Preferred Meeting Time" placeholder="e.g., Weekends Evening" {...register("meetingTime")} error={errors.meetingTime?.message} required />
      </div>
      <PremiumTextarea label="What are your main goals for this session?" {...register("goals")} error={errors.goals?.message} required />
      
      <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Estimated Total</p>
          <p className="text-2xl font-display font-bold text-primary">₹{price}</p>
        </div>
        <PremiumButton type="submit" isLoading={createRequest.isPending}>
          Book Session
        </PremiumButton>
      </div>
    </form>
  );
}

// --- CS Fundamentals Form ---
const csSchema = z.object({
  ...commonSchema,
  subject: z.string().min(1, "Please select a subject"),
  sessions: z.coerce.number().min(4, "Minimum 4 sessions").refine(val => val % 4 === 0, {
    message: "Sessions must be in multiples of 4"
  }),
  level: z.string().min(1, "Please describe your level"),
  doubts: z.string().min(5, "Please list what you want to cover"),
  schedule: z.string().min(2, "Please suggest a schedule"),
});

export function CSFundaForm({ onSuccess, serviceType }: FormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof csSchema>>({
    resolver: zodResolver(csSchema),
    defaultValues: { sessions: 4, subject: "" }
  });
  const createRequest = useCreateRequest();
  
  const sessions = watch("sessions") || 0;
  const validSessions = Math.max(4, Math.floor(sessions / 4) * 4); // For UI display stability
  const price = (validSessions / 4) * 2000;

  const onSubmit = (data: z.infer<typeof csSchema>) => {
    createRequest.mutate({
      serviceType,
      name: data.name,
      email: data.email,
      calculatedPrice: price,
      formData: {
        subject: data.subject,
        sessions: data.sessions,
        level: data.level,
        doubts: data.doubts,
        schedule: data.schedule
      },
    }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Your Name" {...register("name")} error={errors.name?.message} required />
        <PremiumInput label="Email Address" type="email" {...register("email")} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumSelect 
          label="Subject" 
          options={[
            { value: "os", label: "Operating Systems" },
            { value: "cn", label: "Computer Networks" },
            { value: "dbms", label: "DBMS" }
          ]}
          {...register("subject")} 
          error={errors.subject?.message} 
          required 
        />
        <PremiumInput label="Sessions (Multiples of 4)" type="number" step="4" min="4" {...register("sessions")} error={errors.sessions?.message} required />
      </div>
      <PremiumInput label="Current Knowledge Level" placeholder="e.g., Know the basics but struggle with concepts" {...register("level")} error={errors.level?.message} required />
      <PremiumTextarea label="Key Topics / Doubts to Cover" {...register("doubts")} error={errors.doubts?.message} required />
      <PremiumInput label="Preferred Schedule" placeholder="e.g., 2 sessions a week" {...register("schedule")} error={errors.schedule?.message} required />
      
      <div className="pt-4 flex items-center justify-between border-t border-white/10 mt-4">
        <div>
          <p className="text-sm text-muted-foreground">Package Total</p>
          <p className="text-2xl font-display font-bold text-accent">₹{price}</p>
        </div>
        <PremiumButton type="submit" variant="secondary" isLoading={createRequest.isPending}>
          Enroll Now
        </PremiumButton>
      </div>
    </form>
  );
}

// --- Project Mentorship Form ---
const projectSchema = z.object({
  ...commonSchema,
  category: z.string().min(1, "Please select a category"),
  customCategory: z.string().optional(),
  idea: z.string().min(10, "Please describe the idea"),
  features: z.string().min(10, "Please list required features"),
  deadline: z.string().min(2, "Deadline is required"),
  techStack: z.string().optional(),
  complexity: z.string().min(1, "Please select complexity"),
});

export function ProjectForm({ onSuccess, serviceType }: FormProps) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: { category: "", complexity: "" }
  });
  const createRequest = useCreateRequest();
  
  const selectedCategory = watch("category");

  const onSubmit = (data: z.infer<typeof projectSchema>) => {
    createRequest.mutate({
      serviceType,
      name: data.name,
      email: data.email,
      formData: {
        category: data.category === "other" ? data.customCategory : data.category,
        idea: data.idea,
        features: data.features,
        deadline: data.deadline,
        techStack: data.techStack,
        complexity: data.complexity
      },
    }, { onSuccess });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Your Name" {...register("name")} error={errors.name?.message} required />
        <PremiumInput label="Email Address" type="email" {...register("email")} error={errors.email?.message} required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumSelect 
          label="Project Category" 
          options={[
            { value: "portfolio", label: "Portfolio Website" },
            { value: "display", label: "Display Website" },
            { value: "shopping", label: "Shopping Website" },
            { value: "dashboard", label: "Dashboard" },
            { value: "other", label: "Other (Specify)" }
          ]}
          {...register("category")} 
          error={errors.category?.message} 
          required 
        />
        {selectedCategory === "other" ? (
          <PremiumInput label="Custom Category" {...register("customCategory")} required />
        ) : (
          <PremiumSelect 
            label="Complexity Level" 
            options={[
              { value: "basic", label: "Basic (Static/Simple DB)" },
              { value: "intermediate", label: "Intermediate (Auth, APIs)" },
              { value: "advanced", label: "Advanced (Real-time, Complex Logic)" }
            ]}
            {...register("complexity")} 
            error={errors.complexity?.message} 
            required 
          />
        )}
      </div>
      {selectedCategory === "other" && (
         <PremiumSelect 
         label="Complexity Level" 
         options={[
           { value: "basic", label: "Basic (Static/Simple DB)" },
           { value: "intermediate", label: "Intermediate (Auth, APIs)" },
           { value: "advanced", label: "Advanced (Real-time, Complex Logic)" }
         ]}
         {...register("complexity")} 
         error={errors.complexity?.message} 
         required 
       />
      )}

      <PremiumTextarea label="Project Idea" placeholder="What are you trying to build?" {...register("idea")} error={errors.idea?.message} required />
      <PremiumTextarea label="Required Features" placeholder="Core functionalities..." {...register("features")} error={errors.features?.message} required />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PremiumInput label="Deadline" placeholder="e.g., 2 months" {...register("deadline")} error={errors.deadline?.message} required />
        <PremiumInput label="Preferred Tech Stack (Optional)" placeholder="e.g., MERN, Next.js" {...register("techStack")} />
      </div>
      
      <div className="pt-4">
        <PremiumButton type="submit" className="w-full" isLoading={createRequest.isPending}>
          Request Mentorship
        </PremiumButton>
      </div>
    </form>
  );
}
