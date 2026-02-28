import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Search, MapPin, Phone, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

const mockDonors = [
  { id: 1, name: "Priya Sharma", blood: "O+", distance: 1.2, phone: "+91 9876543210", available: true, score: 92, lastDonation: "2025-11-15" },
  { id: 2, name: "Rahul Patel", blood: "A+", distance: 2.5, phone: "+91 9123456789", available: true, score: 88, lastDonation: "2025-10-20" },
  { id: 3, name: "Ananya Reddy", blood: "B+", distance: 0.8, phone: "+91 9012345678", available: false, score: 95, lastDonation: "2025-12-01" },
  { id: 4, name: "Vikram Singh", blood: "O-", distance: 3.1, phone: "+91 8901234567", available: true, score: 78, lastDonation: "2025-09-10" },
  { id: 5, name: "Meera Nair", blood: "AB+", distance: 1.7, phone: "+91 8765432109", available: true, score: 91, lastDonation: "2025-11-28" },
  { id: 6, name: "Arjun Kumar", blood: "A-", distance: 4.2, phone: "+91 7654321098", available: true, score: 85, lastDonation: "2025-08-05" },
];

export default function DonorNetworkPage() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = mockDonors.filter((d) => {
    if (filter !== "All" && d.blood !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Droplets className="w-6 h-6 text-emergency" />
            Donor Network
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Find and connect with available blood donors nearby
          </p>
        </div>

        {/* Filters */}
        <div className="medical-card p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search donors by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {bloodGroups.map((bg) => (
              <button
                key={bg}
                onClick={() => setFilter(bg)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all",
                  filter === bg
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                )}
              >
                {bg}
              </button>
            ))}
          </div>
        </div>

        {/* Donor cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((donor) => (
            <div key={donor.id} className="medical-card p-5 space-y-4 animate-fade-in">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-heading font-semibold">{donor.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <MapPin className="w-3 h-3" />
                    {donor.distance} km away
                  </div>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emergency/10 text-emergency font-bold text-lg font-heading">
                  {donor.blood}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Health Score</span>
                <span className="font-semibold">{donor.score}/100</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full",
                    donor.score > 85 ? "gradient-safe" : donor.score > 70 ? "gradient-warning" : "gradient-emergency"
                  )}
                  style={{ width: `${donor.score}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                    donor.available
                      ? "bg-safe/10 text-safe"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", donor.available ? "bg-safe" : "bg-muted-foreground")} />
                  {donor.available ? "Available" : "Unavailable"}
                </span>
                <Button variant="outline" size="sm" className="gap-1">
                  <Phone className="w-3 h-3" />
                  Contact
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Droplets className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p>No donors found matching your criteria</p>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
