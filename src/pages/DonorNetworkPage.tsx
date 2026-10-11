import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Droplets, Search, MapPin, Phone, Loader2, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";

const bloodGroups = ["All", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

interface Donor {
  id: number;
  name: string;
  bloodGroup: string;
  city: string;
  phone: string;
  availability: boolean;
  healthScore: number;
  lastDonation: string;
}

export default function DonorNetworkPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newDonor, setNewDonor] = useState({
    name: "",
    bloodGroup: "O+",
    city: "",
    phone: "",
  });

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/donors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed");
      const data: Donor[] = await res.json();
      setDonors(data);
    } catch {
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonors();
  }, []);

  const handleAddDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonor.name || !newDonor.phone) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/donors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newDonor,
          availability: true,
          healthScore: 95.0,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setNewDonor({ name: "", bloodGroup: "O+", city: "", phone: "" });
        fetchDonors();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = donors.filter((d) => {
    if (filter !== "All" && d.bloodGroup !== filter) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Droplets className="w-6 h-6 text-emergency" />
              Donor Network
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Find and connect with available blood donors nearby
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2 shrink-0">
            <UserPlus className="w-4 h-4" />
            Register Donor
          </Button>
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

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Donor cards */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((donor) => (
              <div key={donor.id} className="medical-card p-5 space-y-4 animate-fade-in">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold">{donor.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      {donor.city || "—"}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-lg bg-emergency/10 text-emergency font-bold text-lg font-heading">
                    {donor.bloodGroup}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Health Score</span>
                  <span className="font-semibold">{donor.healthScore}/100</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      donor.healthScore > 85 ? "gradient-safe" : donor.healthScore > 70 ? "gradient-warning" : "gradient-emergency"
                    )}
                    style={{ width: `${donor.healthScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                      donor.availability
                        ? "bg-safe/10 text-safe"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    <span className={cn("w-1.5 h-1.5 rounded-full", donor.availability ? "bg-safe" : "bg-muted-foreground")} />
                    {donor.availability ? "Available" : "Unavailable"}
                  </span>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={`tel:${donor.phone}`}>
                      <Phone className="w-3 h-3" />
                      Contact
                    </a>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16 medical-card border-dashed">
            <Droplets className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-30" />
            <h3 className="font-heading font-semibold text-base">No Donors in Network</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
              {search || filter !== "All"
                ? "No donors match your search or blood group filters."
                : "No blood donors have been registered yet in the database."}
            </p>
            <Button onClick={() => setShowAddModal(true)} variant="outline" size="sm" className="mt-4 gap-2">
              <UserPlus className="w-4 h-4" />
              Register First Donor
            </Button>
          </div>
        )}

        {showAddModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 shadow-xl border">
              <h2 className="text-lg font-heading font-bold">Register as Blood Donor</h2>
              <p className="text-xs text-muted-foreground">Add a real donor to the maternal emergency network.</p>
              <form onSubmit={handleAddDonor} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Full Name</label>
                  <Input
                    required
                    value={newDonor.name}
                    onChange={(e) => setNewDonor({ ...newDonor, name: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Blood Group</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={newDonor.bloodGroup}
                    onChange={(e) => setNewDonor({ ...newDonor, bloodGroup: e.target.value })}
                  >
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">City</label>
                  <Input
                    value={newDonor.city}
                    onChange={(e) => setNewDonor({ ...newDonor, city: e.target.value })}
                    placeholder="e.g. Hyderabad"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Phone Number</label>
                  <Input
                    required
                    value={newDonor.phone}
                    onChange={(e) => setNewDonor({ ...newDonor, phone: e.target.value })}
                    placeholder="e.g. +91 9876543210"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save Donor"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
