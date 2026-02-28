import { Droplets, Heart, Clock, Award, TrendingUp, MapPin, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const stats = [
  { label: "Total Donations", value: "12", change: "+2", icon: Droplets, color: "text-emergency" },
  { label: "Lives Saved", value: "36", change: "+6", icon: Heart, color: "text-safe" },
  { label: "Days Since Last", value: "45", change: "", icon: Clock, color: "text-warning" },
  { label: "Donor Score", value: "94", change: "+3", icon: Award, color: "text-primary" },
];

const donationHistory = [
  { id: 1, date: "2026-01-15", location: "City Hospital", type: "Whole Blood", units: 1, status: "completed" },
  { id: 2, date: "2025-11-02", location: "Red Cross Camp", type: "Platelets", units: 1, status: "completed" },
  { id: 3, date: "2025-08-20", location: "District Hospital", type: "Whole Blood", units: 1, status: "completed" },
  { id: 4, date: "2025-06-10", location: "Mobile Van", type: "Plasma", units: 1, status: "completed" },
];

const upcomingRequests = [
  { id: 1, hospital: "City Hospital", bloodGroup: "O+", urgency: "high" as const, distance: "2.3 km", time: "30 min ago" },
  { id: 2, hospital: "District Hospital", bloodGroup: "O+", urgency: "mid" as const, distance: "5.1 km", time: "2 hr ago" },
  { id: 3, hospital: "PHC Center", bloodGroup: "O+", urgency: "low" as const, distance: "8.7 km", time: "5 hr ago" },
];

const urgencyBadge = {
  high: "bg-emergency/10 text-emergency",
  mid: "bg-warning/10 text-warning",
  low: "bg-safe/10 text-safe",
};

export default function DonorDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <Droplets className="w-6 h-6 text-emergency" />
          Donor Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your donation history and nearby requests
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="medical-card p-5">
              <div className="flex items-center justify-between mb-3">
                <Icon className={cn("w-5 h-5", stat.color)} />
                {stat.change && (
                  <span className="text-xs font-medium text-safe flex items-center gap-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-heading font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donation History */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Donation History
          </h2>
          <div className="space-y-3">
            {donationHistory.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{d.type}</p>
                  <p className="text-xs text-muted-foreground">{d.location} • {d.date}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-safe font-medium">
                  <CheckCircle className="w-3 h-3" />
                  {d.status}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t text-center">
            <p className="text-sm font-medium text-primary">Next eligible donation: Mar 15, 2026</p>
          </div>
        </div>

        {/* Nearby Requests */}
        <div className="medical-card p-5">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            Nearby Blood Requests
          </h2>
          <div className="space-y-3">
            {upcomingRequests.map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.hospital}</p>
                  <p className="text-xs text-muted-foreground">{r.distance} away • {r.time}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className="text-sm font-bold text-emergency">{r.bloodGroup}</span>
                  <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium capitalize", urgencyBadge[r.urgency])}>
                    {r.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
