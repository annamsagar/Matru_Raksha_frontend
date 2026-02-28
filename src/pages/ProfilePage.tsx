import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Droplets, Activity, Clock, Edit2, Save } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

const predictionHistory = [
  { id: 1, date: "2026-02-25", risk: "low" as const, systolic: 120, glucose: 85, confidence: 94 },
  { id: 2, date: "2026-02-20", risk: "mid" as const, systolic: 145, glucose: 160, confidence: 88 },
  { id: 3, date: "2026-02-15", risk: "high" as const, systolic: 170, glucose: 250, confidence: 96 },
  { id: 4, date: "2026-02-10", risk: "low" as const, systolic: 118, glucose: 90, confidence: 92 },
];

const riskBadge = {
  low: "bg-safe/10 text-safe",
  mid: "bg-warning/10 text-warning",
  high: "bg-emergency/10 text-emergency",
};

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);

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
                DS
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">Dr. Sarah Mitchell</h2>
                <p className="text-sm text-muted-foreground">Obstetrician • City Hospital</p>
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
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground"><Mail className="w-3 h-3" />Email</Label>
              <Input defaultValue="sarah.mitchell@hospital.com" disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground"><Phone className="w-3 h-3" />Phone</Label>
              <Input defaultValue="+91 9876543210" disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground"><Droplets className="w-3 h-3" />Blood Group</Label>
              <Input defaultValue="O+" disabled={!editing} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground"><Activity className="w-3 h-3" />Department</Label>
              <Input defaultValue="Obstetrics & Gynecology" disabled={!editing} />
            </div>
          </div>
        </div>

        {/* Prediction history */}
        <div className="medical-card p-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Prediction History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Risk</th>
                  <th className="pb-3 font-medium text-muted-foreground">Systolic</th>
                  <th className="pb-3 font-medium text-muted-foreground">Glucose</th>
                  <th className="pb-3 font-medium text-muted-foreground">Confidence</th>
                </tr>
              </thead>
              <tbody>
                {predictionHistory.map((p) => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3">{p.date}</td>
                    <td className="py-3">
                      <span className={cn("px-2 py-1 rounded-md text-xs font-medium capitalize", riskBadge[p.risk])}>
                        {p.risk}
                      </span>
                    </td>
                    <td className="py-3">{p.systolic} mmHg</td>
                    <td className="py-3">{p.glucose} mg/dL</td>
                    <td className="py-3">{p.confidence}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
