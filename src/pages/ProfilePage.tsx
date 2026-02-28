import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Droplets, Activity, Clock, Edit2, Save, MapPin, Stethoscope, Shield, Heart, Award, Building } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";
import { useRole } from "@/contexts/RoleContext";

const riskBadge = {
  low: "bg-safe/10 text-safe",
  mid: "bg-warning/10 text-warning",
  high: "bg-emergency/10 text-emergency",
};

const roleProfiles = {
  doctor: {
    name: "Dr. Sarah Mitchell",
    initials: "SM",
    subtitle: "Obstetrician • City Hospital",
    fields: [
      { label: "Email", icon: Mail, value: "sarah.mitchell@hospital.com" },
      { label: "Phone", icon: Phone, value: "+91 9876543210" },
      { label: "Specialization", icon: Stethoscope, value: "Obstetrics & Gynecology" },
      { label: "Hospital", icon: Building, value: "City General Hospital" },
      { label: "License No.", icon: Shield, value: "MED-2019-48291" },
      { label: "Experience", icon: Award, value: "12 years" },
    ],
    history: [
      { id: 1, date: "2026-02-25", detail: "Patient #1042 — High Risk", result: "Referred to ICU", badge: "high" as const },
      { id: 2, date: "2026-02-20", detail: "Patient #1038 — Medium Risk", result: "Medication adjusted", badge: "mid" as const },
      { id: 3, date: "2026-02-15", detail: "Patient #1035 — Low Risk", result: "Routine follow-up", badge: "low" as const },
    ],
    historyTitle: "Recent Assessments",
  },
  donor: {
    name: "Rahul Verma",
    initials: "RV",
    subtitle: "Regular Donor • O+ Blood Group",
    fields: [
      { label: "Email", icon: Mail, value: "rahul.verma@email.com" },
      { label: "Phone", icon: Phone, value: "+91 8765432100" },
      { label: "Blood Group", icon: Droplets, value: "O+" },
      { label: "Location", icon: MapPin, value: "Hyderabad, Telangana" },
      { label: "Hemoglobin", icon: Activity, value: "14.2 g/dL" },
      { label: "Total Donations", icon: Heart, value: "12 donations" },
    ],
    history: [
      { id: 1, date: "2026-01-15", detail: "Whole Blood — City Hospital", result: "1 unit donated", badge: "low" as const },
      { id: 2, date: "2025-11-02", detail: "Platelets — Red Cross Camp", result: "1 unit donated", badge: "low" as const },
      { id: 3, date: "2025-08-20", detail: "Whole Blood — District Hospital", result: "1 unit donated", badge: "low" as const },
    ],
    historyTitle: "Donation History",
  },
  admin: {
    name: "Ananya Iyer",
    initials: "AI",
    subtitle: "System Administrator",
    fields: [
      { label: "Email", icon: Mail, value: "ananya.iyer@maternalguard.org" },
      { label: "Phone", icon: Phone, value: "+91 7654321000" },
      { label: "Role", icon: Shield, value: "Super Admin" },
      { label: "Department", icon: Building, value: "IT & Operations" },
      { label: "Access Level", icon: Award, value: "Full Access" },
      { label: "Region", icon: MapPin, value: "All Regions" },
    ],
    history: [
      { id: 1, date: "2026-02-28", detail: "Updated RLS policies", result: "Security patch", badge: "mid" as const },
      { id: 2, date: "2026-02-25", detail: "Added 3 new health workers", result: "Onboarding", badge: "low" as const },
      { id: 3, date: "2026-02-20", detail: "Emergency protocol updated", result: "System config", badge: "high" as const },
    ],
    historyTitle: "Admin Activity",
  },
  health_worker: {
    name: "Sunita Kumari",
    initials: "SK",
    subtitle: "ASHA Worker • Rampur PHC",
    fields: [
      { label: "Email", icon: Mail, value: "sunita.k@phc.gov.in" },
      { label: "Phone", icon: Phone, value: "+91 6543210000" },
      { label: "Assigned Area", icon: MapPin, value: "Rampur, Sultanpur, Nayagaon" },
      { label: "PHC Center", icon: Building, value: "Rampur Primary Health Center" },
      { label: "Mothers Assigned", icon: Heart, value: "32 mothers" },
      { label: "Experience", icon: Award, value: "5 years" },
    ],
    history: [
      { id: 1, date: "2026-02-27", detail: "Visited Lakshmi Devi — BP check", result: "High risk flagged", badge: "high" as const },
      { id: 2, date: "2026-02-25", detail: "Iron tablet distribution", result: "15 mothers covered", badge: "low" as const },
      { id: 3, date: "2026-02-22", detail: "Radha Rani — prenatal checkup", result: "Referred to hospital", badge: "mid" as const },
    ],
    historyTitle: "Recent Field Activity",
  },
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const { role } = useRole();
  const profile = roleProfiles[role];

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          My Profile
        </h1>

        {/* Profile card */}
        <div className="medical-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                {profile.initials}
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.subtitle}</p>
              </div>
            </div>
            <Button
              variant={editing ? "medical" : "outline"}
              size="sm"
              onClick={() => setEditing(!editing)}
              className="gap-1"
            >
              {editing ? <><Save className="w-3 h-3" /> Save</> : <><Edit2 className="w-3 h-3" /> Edit</>}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.fields.map((field) => {
              const Icon = field.icon;
              return (
                <div key={field.label} className="space-y-2">
                  <Label className="flex items-center gap-1 text-muted-foreground">
                    <Icon className="w-3 h-3" />{field.label}
                  </Label>
                  <Input defaultValue={field.value} disabled={!editing} />
                </div>
              );
            })}
          </div>
        </div>

        {/* History */}
        <div className="medical-card p-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {profile.historyTitle}
          </h2>
          <div className="space-y-3">
            {profile.history.map((h) => (
              <div key={h.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{h.detail}</p>
                  <p className="text-xs text-muted-foreground">{h.date} • {h.result}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", riskBadge[h.badge])}>
                  {h.badge}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
