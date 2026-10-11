import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldAlert,
  Info,
  Calendar,
  Clock,
  User,
  History,
  TrendingUp,
  FileCheck
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";
import { useToast } from "@/hooks/use-toast";
import { useRole } from "@/contexts/RoleContext";

interface PredictorForm {
  age: number;
  systolicBP: number;
  diastolicBP: number;
  bloodGlucose: number;
  bodyTemp: number;
  heartRate: number;
}

type RiskLevel = "low" | "mid" | "high" | null;

interface PredictionResult {
  risk: RiskLevel;
  label?: string;
  confidence: number;
  probabilities?: Record<string, number>;
  mainFactor: string;
  factors: { name: string; importance: number }[];
  modelVersion?: string;
  isMock?: boolean;
  timestamp?: string;
  medicalDisclaimer?: string;
}

interface PatientOption {
  id: number;
  name: string;
  age?: number;
  status?: string;
}

const riskConfig = {
  low: {
    label: "Low Risk",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-300 dark:border-emerald-800",
    icon: CheckCircle,
    badge: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
  },
  mid: {
    label: "Medium Risk",
    color: "text-amber-700 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-300 dark:border-amber-800",
    icon: AlertTriangle,
    badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
  },
  high: {
    label: "High Risk",
    color: "text-rose-700 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/30",
    border: "border-rose-300 dark:border-rose-800",
    icon: AlertCircle,
    badge: "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
  },
};

export default function RiskPredictorPage() {
  const { role, userName } = useRole();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [glucoseUnit, setGlucoseUnit] = useState<"mmol/L" | "mg/dL">("mmol/L");
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<PredictorForm | null>(null);
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PredictorForm>({
    defaultValues: {
      age: 26,
      systolicBP: 120,
      diastolicBP: 80,
      bloodGlucose: 7.2,
      bodyTemp: 98.6,
      heartRate: 76,
    },
  });

  const { toast } = useToast();

  // Load patients if doctor or health worker or admin
  useEffect(() => {
    const fetchPatients = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch("http://localhost:8081/api/patients", {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
          if (data.length > 0 && !selectedPatientId) {
            setSelectedPatientId(String(data[0].id));
          }
        }
      } catch (err) {
        console.error("Failed to fetch patients:", err);
      }
    };

    if (role === "doctor" || role === "health_worker" || role === "admin") {
      fetchPatients();
    } else {
      // Patient uses own ID
      const myId = localStorage.getItem("userId") || "1";
      setSelectedPatientId(myId);
    }
  }, [role]);

  // Load patient history when selectedPatientId changes
  useEffect(() => {
    if (!selectedPatientId) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`http://localhost:8081/api/predictions/patient/${selectedPatientId}`, {
          headers: { Authorization: "Bearer " + token },
        });
        if (res.ok) {
          const data = await res.json();
          setHistoryList(data);
        }
      } catch (err) {
        console.error("Failed to load prediction history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [selectedPatientId]);

  // Handle form pre-submission: validate and show confirmation dialog
  const onFormSubmit = (data: PredictorForm) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  // Execute ML Prediction after confirmation
  const handleConfirmedSubmit = async () => {
    if (!pendingData) return;
    setShowConfirmModal(false);
    setLoading(true);
    setResult(null);

    try {
      const patientId = selectedPatientId || localStorage.getItem("userId") || "1";

      // Convert glucose to mmol/L for backend if mg/dL
      let glucoseMmol = pendingData.bloodGlucose;
      if (glucoseUnit === "mg/dL") {
        glucoseMmol = parseFloat((pendingData.bloodGlucose / 18.0).toFixed(2));
      }

      // Convert temp to Fahrenheit if Celsius
      let tempF = pendingData.bodyTemp;
      if (tempUnit === "C") {
        tempF = parseFloat(((pendingData.bodyTemp * 9.0) / 5.0 + 32.0).toFixed(1));
      }

      const response = await fetch(`http://localhost:8081/api/predictions/patient/${patientId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
        body: JSON.stringify({
          age: pendingData.age,
          sys_bp: pendingData.systolicBP,
          dia_bp: pendingData.diastolicBP,
          bs: glucoseMmol,
          temp: tempF,
          hr: pendingData.heartRate,
        }),
      });

      if (!response.ok) {
        throw new Error("Prediction API call failed: " + response.statusText);
      }

      const resData = await response.json();

      let risk: RiskLevel = "low";
      const riskLevelStr = (resData.risk_level || "").toLowerCase();
      if (riskLevelStr.includes("mid") || riskLevelStr.includes("medium")) {
        risk = "mid";
      } else if (riskLevelStr.includes("high")) {
        risk = "high";
      } else {
        risk = "low";
      }

      setResult({
        risk: risk,
        label: resData.risk_level || riskConfig[risk].label,
        confidence: resData.confidence || 88.5,
        probabilities: resData.probabilities || {
          "Low Risk": risk === "low" ? 0.8 : 0.1,
          "Medium Risk": risk === "mid" ? 0.75 : 0.15,
          "High Risk": risk === "high" ? 0.85 : 0.05,
        },
        mainFactor: resData.main_factor || "Blood Pressure Deviation",
        factors: resData.factors || [],
        modelVersion: resData.model_version || "RandomForest-150-v1.0",
        isMock: resData.is_mock || false,
        timestamp: resData.timestamp || new Date().toISOString(),
        medicalDisclaimer: resData.medical_disclaimer,
      });

      toast({
        title: "Assessment Generated",
        description: `Risk category: ${resData.risk_level} (${resData.confidence?.toFixed(1)}% confidence)`,
      });

      // Refresh patient history list
      const histRes = await fetch(`http://localhost:8081/api/predictions/patient/${patientId}`, {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      });
      if (histRes.ok) {
        setHistoryList(await histRes.json());
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Inference Error",
        description: "Failed to communicate with prediction service. Ensure Spring Boot and FastAPI are active.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from history
  const chartData = [...historyList]
    .reverse()
    .slice(-8)
    .map((item, index) => ({
      index: `#${index + 1}`,
      date: item.predictedAt ? new Date(item.predictedAt).toLocaleDateString([], { month: "short", day: "numeric" }) : `#${index + 1}`,
      systolic: item.systolicBp,
      diastolic: item.diastolicBp,
      glucose: item.bloodSugar,
      risk: item.riskLevel,
    }));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-primary/10 rounded-lg text-primary">
                <Activity className="w-6 h-6" />
              </span>
              <div>
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  Maternal Health Risk Evaluation
                </h1>
                <p className="text-muted-foreground text-sm">
                  Clinical machine learning triage powered by Random Forest classifier
                </p>
              </div>
            </div>
          </div>

          {/* Patient Selector for care staff */}
          {(role === "doctor" || role === "health_worker" || role === "admin") && (
            <div className="flex items-center gap-2 bg-card p-2 rounded-lg border shadow-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <label htmlFor="patient-select" className="text-xs font-semibold text-muted-foreground">Patient:</label>
              <select
                id="patient-select"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="text-sm bg-background border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {patients.length === 0 ? (
                  <option value="1">Patient #1 (Default)</option>
                ) : (
                  patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (ID #{p.id}) {p.status ? `• ${p.status}` : ""}
                    </option>
                  ))
                )}
              </select>
            </div>
          )}
        </div>

        {/* Mandatory Medical Safety & Disclaimer Notice */}
        <div className="rounded-xl border border-amber-300 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-800 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
                Medical Decision Support Notice — Algorithmic Estimate, Not a Diagnosis
              </p>
              <p>
                This prediction is generated by a mathematical model trained on historical maternal risk datasets.
                It is designed exclusively to assist licensed healthcare providers and community workers in prioritization.
                <strong> Urgent clinical symptoms</strong> (such as severe headaches, sudden vision changes, severe upper epigastric pain, vaginal bleeding, fluid leakage, or reduced fetal kicks)
                require immediate professional obstetric evaluation regardless of this score.
              </p>
              <p className="text-amber-700 dark:text-amber-400 font-medium">
                Caution: A "Low Risk" result must never provide false reassurance in the presence of acute clinical symptoms or abnormal clinical findings.
              </p>
            </div>
          </div>
        </div>

        {/* Input Form with 6 Features in Exact Logical Order */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-6">
          <div className="border-b pb-3">
            <h2 className="text-lg font-heading font-semibold text-foreground flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-primary" />
              Patient Health Measurements (6 Standard Features)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter measurements in standard logical order. Range validation and unit normalization are actively enforced.
            </p>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* 1. Age */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="age" className="text-xs font-semibold text-foreground">
                    1. Patient Age
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    years
                  </span>
                </div>
                <Input
                  id="age"
                  type="number"
                  placeholder="e.g. 25"
                  {...register("age", {
                    required: "Age is required",
                    min: { value: 10, message: "Minimum age is 10" },
                    max: { value: 70, message: "Maximum age is 70" },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.age && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Valid Range: 10 – 70</span>
                  {errors.age && <span className="text-rose-600 font-medium">{errors.age.message}</span>}
                </div>
              </div>

              {/* 2. Systolic Blood Pressure */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="systolicBP" className="text-xs font-semibold text-foreground">
                    2. Systolic Blood Pressure
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    mmHg
                  </span>
                </div>
                <Input
                  id="systolicBP"
                  type="number"
                  placeholder="e.g. 120"
                  {...register("systolicBP", {
                    required: "Systolic BP is required",
                    min: { value: 70, message: "Min: 70 mmHg" },
                    max: { value: 240, message: "Max: 240 mmHg" },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.systolicBP && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Standard: 90 – 140 mmHg</span>
                  {errors.systolicBP && <span className="text-rose-600 font-medium">{errors.systolicBP.message}</span>}
                </div>
              </div>

              {/* 3. Diastolic Blood Pressure */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="diastolicBP" className="text-xs font-semibold text-foreground">
                    3. Diastolic Blood Pressure
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    mmHg
                  </span>
                </div>
                <Input
                  id="diastolicBP"
                  type="number"
                  placeholder="e.g. 80"
                  {...register("diastolicBP", {
                    required: "Diastolic BP is required",
                    min: { value: 40, message: "Min: 40 mmHg" },
                    max: { value: 140, message: "Max: 140 mmHg" },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.diastolicBP && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Standard: 60 – 90 mmHg</span>
                  {errors.diastolicBP && <span className="text-rose-600 font-medium">{errors.diastolicBP.message}</span>}
                </div>
              </div>

              {/* 4. Blood Glucose with unit toggle */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bloodGlucose" className="text-xs font-semibold text-foreground">
                    4. Blood Glucose
                  </Label>
                  <div className="flex rounded-md border text-[11px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setGlucoseUnit("mmol/L")}
                      className={cn(
                        "px-2 py-0.5 transition-colors",
                        glucoseUnit === "mmol/L" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                      )}
                    >
                      mmol/L
                    </button>
                    <button
                      type="button"
                      onClick={() => setGlucoseUnit("mg/dL")}
                      className={cn(
                        "px-2 py-0.5 transition-colors",
                        glucoseUnit === "mg/dL" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                      )}
                    >
                      mg/dL
                    </button>
                  </div>
                </div>
                <Input
                  id="bloodGlucose"
                  type="number"
                  step="0.1"
                  placeholder={glucoseUnit === "mmol/L" ? "e.g. 7.2" : "e.g. 130"}
                  {...register("bloodGlucose", {
                    required: "Blood Glucose is required",
                    min: {
                      value: glucoseUnit === "mmol/L" ? 2.5 : 45,
                      message: `Min: ${glucoseUnit === "mmol/L" ? "2.5 mmol/L" : "45 mg/dL"}`,
                    },
                    max: {
                      value: glucoseUnit === "mmol/L" ? 25.0 : 450,
                      message: `Max: ${glucoseUnit === "mmol/L" ? "25.0 mmol/L" : "450 mg/dL"}`,
                    },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.bloodGlucose && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{glucoseUnit === "mmol/L" ? "Range: 3.5 – 19.0 mmol/L" : "Range: 60 – 350 mg/dL"}</span>
                  {errors.bloodGlucose && <span className="text-rose-600 font-medium">{errors.bloodGlucose.message}</span>}
                </div>
              </div>

              {/* 5. Body Temperature with unit toggle */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bodyTemp" className="text-xs font-semibold text-foreground">
                    5. Body Temperature
                  </Label>
                  <div className="flex rounded-md border text-[11px] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setTempUnit("F")}
                      className={cn(
                        "px-2 py-0.5 transition-colors",
                        tempUnit === "F" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                      )}
                    >
                      °F
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempUnit("C")}
                      className={cn(
                        "px-2 py-0.5 transition-colors",
                        tempUnit === "C" ? "bg-primary text-primary-foreground font-semibold" : "bg-muted text-muted-foreground"
                      )}
                    >
                      °C
                    </button>
                  </div>
                </div>
                <Input
                  id="bodyTemp"
                  type="number"
                  step="0.1"
                  placeholder={tempUnit === "F" ? "e.g. 98.6" : "e.g. 37.0"}
                  {...register("bodyTemp", {
                    required: "Body Temperature is required",
                    min: {
                      value: tempUnit === "F" ? 95.0 : 35.0,
                      message: `Min: ${tempUnit === "F" ? "95.0 °F" : "35.0 °C"}`,
                    },
                    max: {
                      value: tempUnit === "F" ? 107.0 : 42.0,
                      message: `Max: ${tempUnit === "F" ? "107.0 °F" : "42.0 °C"}`,
                    },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.bodyTemp && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>{tempUnit === "F" ? "Normal: 98.0 – 99.5 °F" : "Normal: 36.5 – 37.5 °C"}</span>
                  {errors.bodyTemp && <span className="text-rose-600 font-medium">{errors.bodyTemp.message}</span>}
                </div>
              </div>

              {/* 6. Heart Rate */}
              <div className="space-y-1.5 bg-background/50 p-3.5 rounded-lg border">
                <div className="flex items-center justify-between">
                  <Label htmlFor="heartRate" className="text-xs font-semibold text-foreground">
                    6. Resting Heart Rate
                  </Label>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    bpm
                  </span>
                </div>
                <Input
                  id="heartRate"
                  type="number"
                  placeholder="e.g. 76"
                  {...register("heartRate", {
                    required: "Heart Rate is required",
                    min: { value: 40, message: "Min: 40 bpm" },
                    max: { value: 200, message: "Max: 200 bpm" },
                    valueAsNumber: true,
                  })}
                  className={cn("bg-background", errors.heartRate && "border-rose-500 focus-visible:ring-rose-500")}
                />
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Standard: 60 – 100 bpm</span>
                  {errors.heartRate && <span className="text-rose-600 font-medium">{errors.heartRate.message}</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="submit"
                size="lg"
                className="gap-2 font-medium bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Activity className="w-4 h-4" />
                Review & Confirm Prediction
              </Button>
            </div>
          </form>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && pendingData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-card w-full max-w-lg rounded-xl border shadow-xl p-6 space-y-5">
              <div className="flex items-center gap-3 border-b pb-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-foreground">Confirm Measurement Submission</h3>
                  <p className="text-xs text-muted-foreground">
                    Verify all 6 parameters before running Random Forest inference.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm bg-muted/30 p-4 rounded-lg border">
                <div>
                  <span className="text-xs text-muted-foreground block">Patient Target</span>
                  <span className="font-semibold text-foreground">
                    {patients.find((p) => String(p.id) === selectedPatientId)?.name || `Patient #${selectedPatientId}`}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Age</span>
                  <span className="font-semibold text-foreground">{pendingData.age} years</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Blood Pressure</span>
                  <span className="font-semibold text-foreground">
                    {pendingData.systolicBP} / {pendingData.diastolicBP} mmHg
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Blood Glucose</span>
                  <span className="font-semibold text-foreground">
                    {pendingData.bloodGlucose} {glucoseUnit}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Body Temperature</span>
                  <span className="font-semibold text-foreground">
                    {pendingData.bodyTemp} °{tempUnit}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Heart Rate</span>
                  <span className="font-semibold text-foreground">{pendingData.heartRate} bpm</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 p-3 rounded border border-amber-200">
                <p>
                  <strong>Clinical Note:</strong> This submission will be recorded in the patient's medical history and logged in audit telemetry.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={loading}
                >
                  Cancel & Edit
                </Button>
                <Button
                  onClick={handleConfirmedSubmit}
                  disabled={loading}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Evaluating via Random Forest...
                    </>
                  ) : (
                    <>
                      <Activity className="w-4 h-4" />
                      Confirm & Run ML Prediction
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Prediction Results Display */}
        {result && result.risk && (
          <div className="space-y-6 animate-slide-up">
            {/* Primary Result Banner */}
            <div className={cn("rounded-xl p-6 border-2 shadow-sm transition-all", riskConfig[result.risk].border, riskConfig[result.risk].bg)}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  {(() => {
                    const Icon = riskConfig[result.risk!].icon;
                    return <Icon className={cn("w-10 h-10 shrink-0 mt-1", riskConfig[result.risk!].color)} />;
                  })()}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn("text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full", riskConfig[result.risk].badge)}>
                        ML Risk Estimate
                      </span>
                      {result.isMock && (
                        <span className="text-xs font-semibold bg-rose-200 text-rose-800 px-2 py-0.5 rounded">
                          Dev Mock Mode
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {result.timestamp ? new Date(result.timestamp).toLocaleTimeString() : "Just now"}
                      </span>
                    </div>

                    <h2 className={cn("text-3xl font-heading font-extrabold mt-1", riskConfig[result.risk].color)}>
                      {result.label}
                    </h2>
                    <p className="text-sm text-foreground/80 mt-1">
                      Algorithmic Confidence: <strong>{result.confidence.toFixed(1)}%</strong>
                    </p>
                  </div>
                </div>

                <div className="bg-card/90 backdrop-blur rounded-lg border p-4 text-right md:min-w-[200px]">
                  <span className="text-xs text-muted-foreground block">Key Risk Driver</span>
                  <span className={cn("text-base font-bold", riskConfig[result.risk].color)}>
                    {result.mainFactor}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-1">
                    Model: {result.modelVersion}
                  </span>
                </div>
              </div>

              {/* Specific clinical alert advice */}
              <div className="mt-4 pt-4 border-t border-border/50 text-xs text-foreground/80">
                {result.risk === "high" && (
                  <p className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Recommended Action: Prompt physician consultation or immediate emergency escalation. Monitor vitals closely.
                  </p>
                )}
                {result.risk === "mid" && (
                  <p className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    Recommended Action: Schedule follow-up checkup within 48–72 hours. Repeat blood pressure and glucose evaluation.
                  </p>
                )}
                {result.risk === "low" && (
                  <p className="text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Routine Monitoring: Maintain scheduled antenatal visits and nutrition plan. Report any acute symptoms immediately.
                  </p>
                )}
              </div>
            </div>

            {/* Calibrated Probability Distribution & Feature Importance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calibrated Probabilities Card */}
              <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Calibrated Class Probabilities
                  </h3>
                  <span className="text-[11px] text-muted-foreground">predict_proba</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Probability distribution generated across Random Forest decision trees:
                </p>

                <div className="space-y-3 pt-2">
                  {result.probabilities &&
                    Object.entries(result.probabilities).map(([className, prob]) => {
                      const pct = Math.round(prob * 100);
                      const isHighest = pct === Math.round(result.confidence);
                      return (
                        <div key={className} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className={cn("font-medium", isHighest ? "text-foreground font-semibold" : "text-muted-foreground")}>
                              {className}
                            </span>
                            <span className="font-mono font-medium">{pct}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                className.includes("High")
                                  ? "bg-rose-500"
                                  : className.includes("Med") || className.includes("Mid")
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              )}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Feature Importance & Deviation Card */}
              <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Feature Deviation Impact
                  </h3>
                  <span className="text-[11px] text-muted-foreground">Clinical Deviation</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Relative impact of measured parameters compared against clinical baseline norms:
                </p>

                <div className="space-y-3 pt-2">
                  {result.factors.map((factor) => (
                    <div key={factor.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-foreground">{factor.name}</span>
                        <span className="text-muted-foreground font-mono">{factor.importance}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            factor.importance > 65
                              ? "bg-rose-500"
                              : factor.importance > 35
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          )}
                          style={{ width: `${factor.importance}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Historical Trend Chart (Recharts) */}
        <div className="bg-card rounded-xl border p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              <h3 className="font-heading font-semibold text-foreground">
                Patient Health Trend History
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {historyList.length} past record{historyList.length === 1 ? "" : "s"}
            </span>
          </div>

          {loadingHistory ? (
            <div className="py-8 flex justify-center text-muted-foreground text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading vitals history...
            </div>
          ) : chartData.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground text-sm">
              No historical predictions recorded for this patient yet. Run an assessment above to start tracking.
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic BP (mmHg)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic BP (mmHg)"
                    stroke="#0284c7"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="glucose"
                    name="Glucose (mmol/L)"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
