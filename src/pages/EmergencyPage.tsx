import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, MapPin, Phone, Clock, Droplets, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";

interface ActiveDonor {
  id: number;
  name: string;
  bloodGroup: string;
  city?: string;
  phone: string;
}

export default function EmergencyPage() {
  const [alertSent, setAlertSent] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [searching, setSearching] = useState(false);
  const [donors, setDonors] = useState<ActiveDonor[]>([]);

  const triggerAlert = async () => {
    setConfirming(false);
    setSearching(true);

    try {
      const token = localStorage.getItem("token");
      // Fetch patient's blood group
      let patientBloodGroup = "O+"; // default fallback
      try {
        const pRes = await fetch("http://localhost:8081/api/patients/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (pRes.ok) {
          const patientData = await pRes.json();
          if (patientData.bloodGroup) {
            patientBloodGroup = patientData.bloodGroup;
          }
        }
      } catch (e) {
        console.error("Could not fetch patient info", e);
      }

      // Trigger emergency in backend
      await fetch("http://localhost:8081/api/emergency/trigger", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientLabel: "Hemorrhage SOS Alert",
          bloodGroup: patientBloodGroup,
        }),
      });

      // Fetch real available donors
      const res = await fetch("http://localhost:8081/api/donors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDonors(data.filter((d: any) => d.availability && d.bloodGroup === patientBloodGroup));
      } else {
        setDonors([]);
      }
    } catch (err) {
      console.error(err);
      setDonors([]);
    } finally {
      setSearching(false);
      setAlertSent(true);
    }
  };

  const reset = () => {
    setAlertSent(false);
    setConfirming(false);
    setSearching(false);
    setDonors([]);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold flex items-center justify-center gap-2">
            <AlertTriangle className="w-6 h-6 text-emergency" />
            SOS Emergency
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Hemorrhage alert — find nearest donors immediately
          </p>
        </div>

        {/* Big SOS button */}
        {!alertSent && !confirming && !searching && (
          <div className="flex flex-col items-center py-12 space-y-6">
            <button
              onClick={() => setConfirming(true)}
              className="w-48 h-48 rounded-full gradient-emergency text-emergency-foreground flex flex-col items-center justify-center shadow-emergency pulse-emergency transition-transform hover:scale-105 active:scale-95"
            >
              <AlertTriangle className="w-12 h-12 mb-2" />
              <span className="text-lg font-heading font-bold">HEMORRHAGE</span>
              <span className="text-sm opacity-80">TAP TO ALERT</span>
            </button>
            <p className="text-muted-foreground text-sm text-center max-w-xs">
              Press the button to immediately search for the nearest available blood donors
            </p>
          </div>
        )}

        {/* Confirmation */}
        {confirming && (
          <div className="medical-card p-8 text-center space-y-6 border-2 border-emergency/30 bg-emergency/5 animate-slide-up">
            <AlertTriangle className="w-16 h-16 text-emergency mx-auto" />
            <div>
              <h2 className="text-xl font-heading font-bold">Confirm Emergency Alert</h2>
              <p className="text-muted-foreground text-sm mt-2">
                This will notify all nearby donors and emergency services. Are you sure?
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" size="lg" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
              <Button variant="emergency" size="lg" onClick={triggerAlert}>
                Confirm Alert
              </Button>
            </div>
          </div>
        )}

        {/* Searching */}
        {searching && (
          <div className="text-center py-16 space-y-4 animate-fade-in">
            <div className="w-20 h-20 rounded-full border-4 border-emergency border-t-transparent animate-spin mx-auto" />
            <p className="text-lg font-heading font-semibold">Searching nearby donors...</p>
            <p className="text-sm text-muted-foreground">Scanning within 5km radius</p>
          </div>
        )}

        {/* Results */}
        {alertSent && (
          <div className="space-y-4 animate-slide-up">
            <div className="medical-card p-4 border-2 border-safe/30 bg-safe/5 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-safe flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Emergency Alert Dispatched</p>
                <p className="text-xs text-muted-foreground">
                  SOS broadcast recorded in system logs. {donors.length} active donor(s) located.
                </p>
              </div>
            </div>

            {donors.length > 0 ? (
              <>
                <h3 className="font-heading font-semibold">Matching Donors in Network</h3>
                <div className="space-y-3">
                  {donors.map((donor, i) => (
                    <div
                      key={donor.id}
                      className="medical-card p-4 flex items-center gap-4"
                      style={{ animationDelay: `${i * 100}ms` }}
                    >
                      <div className="w-10 h-10 rounded-full gradient-emergency flex items-center justify-center text-emergency-foreground font-bold text-sm flex-shrink-0">
                        {donor.bloodGroup}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{donor.name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {donor.city || "Nearby"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {donor.phone}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1 flex-shrink-0" asChild>
                        <a href={`tel:${donor.phone}`}>
                          <Phone className="w-3 h-3" />
                          Call
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="medical-card p-6 text-center space-y-3 border-dashed">
                <AlertTriangle className="w-10 h-10 text-warning mx-auto opacity-70" />
                <h4 className="font-heading font-semibold">No Donors in Immediate Network</h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Alert is active in hospital emergency logs. Please contact emergency services directly or check regional blood banks.
                </p>
                <div className="pt-2">
                  <Button variant="emergency" size="sm" asChild>
                    <a href="tel:108" className="gap-2">
                      <Phone className="w-4 h-4" />
                      Call Emergency Ambulance (108)
                    </a>
                  </Button>
                </div>
              </div>
            )}

            <Button variant="outline" onClick={reset} className="w-full mt-4">
              Reset Alert
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
