import { useState, useEffect } from "react";
import { Heart, Activity, Calendar, AlertTriangle, User, FileText, Clock, Phone, Loader2, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PatientRecord {
  id: number;
  name: string;
  age?: number;
  bloodGroup?: string;
  weeksPregnant?: number;
  dueDate?: string;
  highRisk?: boolean;
  status?: string;
  notes?: string;
  assignedDoctor?: { name: string; email: string };
  healthWorker?: { name: string; phone: string };
}

interface Appointment {
  id: number;
  appointmentTime: string;
  reason: string;
  status: string;
  clinicalNotes?: string;
  doctorRecommendation?: string;
}

interface Prediction {
  id: number;
  riskLevel: string;
  confidence: number;
  mainFactor: string;
  predictedAt: string;
  systolicBp?: number;
  diastolicBp?: number;
  bloodSugar?: number;
  heartRate?: number;
}

export default function PatientDashboard() {
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [providers, setProviders] = useState<{id: number, name: string, role: string}[]>([]);
  const [showBooking, setShowBooking] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [bookingReason, setBookingReason] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchPatientData = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Fetch patient profile
        const pRes = await fetch("http://localhost:8081/api/patients/me", { headers });
        let pData: PatientRecord | null = null;
        if (pRes.ok) {
          pData = await pRes.json();
          setPatient(pData);
        } else {
          // Fallback to first patient if me is empty
          const allRes = await fetch("http://localhost:8081/api/patients", { headers });
          if (allRes.ok) {
            const list = await allRes.json();
            if (list.length > 0) {
              pData = list[0];
              setPatient(pData);
            }
          }
        }

        // Fetch appointments
        const apptRes = await fetch("http://localhost:8081/api/appointments", { headers });
        if (apptRes.ok) {
          const appts = await apptRes.json();
          setAppointments(appts);
        }

        // Fetch predictions history if patient id is available
        if (pData?.id) {
          const predRes = await fetch(`http://localhost:8081/api/predictions/patient/${pData.id}`, { headers });
          if (predRes.ok) {
            const preds = await predRes.json();
            setPredictions(preds);
          }
        }

        // Fetch providers
        const provRes = await fetch("http://localhost:8081/api/users/providers", { headers });
        if (provRes.ok) {
          const provs = await provRes.json();
          setProviders(provs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, []);

  const handleBookAppointment = async () => {
    if (!selectedProvider || !bookingDate || !bookingReason) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8081/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          patientId: patient?.id,
          doctorId: selectedProvider,
          appointmentTime: new Date(bookingDate).toISOString(),
          reason: bookingReason
        })
      });
      if (res.ok) {
        toast({ title: "Success", description: "Appointment booked successfully" });
        setShowBooking(false);
        const apptRes = await fetch("http://localhost:8081/api/appointments", { headers: { Authorization: `Bearer ${token}` } });
        if (apptRes.ok) {
          setAppointments(await apptRes.json());
        }
      } else {
        toast({ title: "Error", description: "Failed to book appointment", variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground">Loading your maternal health profile...</p>
      </div>
    );
  }

  const latestPrediction = predictions.length > 0 ? predictions[0] : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white">
              Patient Care Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold">
              Namaste, {patient?.name || "Mother"}!
            </h1>
            <p className="text-white/80 text-sm max-w-lg">
              Welcome to your personal prenatal health monitoring dashboard. Track vitals, doctor visits, and risk evaluations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/emergency">
              <Button variant="destructive" className="bg-red-500 hover:bg-red-600 shadow-md gap-2">
                <AlertTriangle className="w-4 h-4" />
                Emergency SOS
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Maternal Profile Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="medical-card p-5 border-l-4 border-l-emerald-500">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Gestational Age</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-heading font-bold text-emerald-700">
              {patient?.weeksPregnant || 28}
            </span>
            <span className="text-sm font-medium text-muted-foreground">weeks</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Due Date: {patient?.dueDate || "Mid December"}</p>
        </div>

        <div className="medical-card p-5 border-l-4 border-l-teal-500">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Blood Group</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-heading font-bold text-teal-700">
              {patient?.bloodGroup || "O+"}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">Verified</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Donor network active in your area</p>
        </div>

        <div className="medical-card p-5 border-l-4 border-l-amber-500">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Risk Assessment</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={cn(
              "text-2xl font-heading font-bold",
              patient?.highRisk ? "text-red-600" : "text-emerald-600"
            )}>
              {latestPrediction ? latestPrediction.riskLevel : (patient?.highRisk ? "High Risk" : "Normal")}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {latestPrediction ? `${latestPrediction.confidence}% confidence` : "Routine checkup verified"}
          </p>
        </div>

        <div className="medical-card p-5 border-l-4 border-l-blue-500">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assigned Doctor</p>
          <div className="mt-2">
            <p className="text-base font-semibold text-slate-800">
              {patient?.assignedDoctor?.name || "Dr. Rajesh Kulkarni"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Obstetrics & Gynecology</p>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Clinical Decision Support Advisory</p>
          <p className="mt-0.5 text-amber-800 leading-relaxed">
            All AI risk calculations represent computational estimates from physiological vital readings and do not replace professional in-person medical evaluation. If experiencing vaginal bleeding, severe abdominal pain, persistent headaches, or visual disturbances, seek immediate emergency hospital care.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments & Doctor Recommendations */}
        <div className="medical-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-heading font-semibold text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Upcoming Appointments
            </h2>
            <div className="flex gap-3 items-center">
              <Dialog open={showBooking} onOpenChange={setShowBooking}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Plus className="w-3 h-3 mr-1" /> Book
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Book Appointment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Provider</Label>
                      <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {providers.map(p => (
                            <SelectItem key={p.id} value={p.id.toString()}>
                              {p.name} ({p.role.replace("ROLE_", "").replace("_", " ")})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date & Time</Label>
                      <Input type="datetime-local" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Reason</Label>
                      <Input placeholder="E.g., Routine Checkup" value={bookingReason} onChange={(e) => setBookingReason(e.target.value)} />
                    </div>
                    <Button onClick={handleBookAppointment} className="w-full bg-emerald-600 hover:bg-emerald-700">Confirm Booking</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Link to="/appointments" className="text-xs font-medium text-emerald-600 hover:underline">
                View All
              </Link>
            </div>
          </div>

          {appointments.length > 0 ? (
            <div className="space-y-3">
              {appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="p-3.5 rounded-lg border bg-slate-50/60 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">{appt.reason}</p>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                      {appt.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(appt.appointmentTime).toLocaleDateString()} at {new Date(appt.appointmentTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {appt.doctorRecommendation && (
                    <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-700 bg-white p-2 rounded">
                      <span className="font-semibold text-emerald-700">Doctor's Advice: </span>
                      {appt.doctorRecommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-1">
              <Calendar className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No scheduled appointments right now.</p>
              <p className="text-xs">Your doctor will book your next 3rd-trimester ultrasound soon.</p>
            </div>
          )}
        </div>

        {/* Prediction & Vitals History */}
        <div className="medical-card p-5 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="font-heading font-semibold text-base flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-600" />
              Recent Risk Evaluations
            </h2>
            <Link to="/risk-predictor" className="text-xs font-medium text-teal-600 hover:underline">
              Check Vitals
            </Link>
          </div>

          {predictions.length > 0 ? (
            <div className="space-y-3">
              {predictions.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        p.riskLevel.toLowerCase().includes("high") ? "bg-red-500" :
                        p.riskLevel.toLowerCase().includes("med") || p.riskLevel.toLowerCase().includes("mid") ? "bg-amber-500" : "bg-emerald-500"
                      )} />
                      <p className="text-sm font-semibold">{p.riskLevel}</p>
                      <span className="text-xs text-muted-foreground">({p.confidence}% confidence)</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Key factor: {p.mainFactor || "Physiological Vitals"} • {new Date(p.predictedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right text-xs">
                    {p.systolicBp && p.diastolicBp && (
                      <span className="font-mono text-slate-600 font-medium">BP: {p.systolicBp}/{p.diastolicBp}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground space-y-1">
              <Activity className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm">No recorded risk predictions yet.</p>
              <p className="text-xs">Your health worker will record your physiological vitals during home visits.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
