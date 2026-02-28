import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AppLayout from "@/components/AppLayout";

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
  confidence: number;
  mainFactor: string;
  factors: { name: string; importance: number }[];
}

const riskConfig = {
  low: { label: "Low Risk", color: "text-safe", bg: "bg-safe/10", border: "border-safe/30", icon: CheckCircle },
  mid: { label: "Medium Risk", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30", icon: AlertTriangle },
  high: { label: "High Risk", color: "text-emergency", bg: "bg-emergency/10", border: "border-emergency/30", icon: AlertTriangle },
};

const fields: { name: keyof PredictorForm; label: string; min: number; max: number; unit: string }[] = [
  { name: "age", label: "Age", min: 12, max: 60, unit: "years" },
  { name: "systolicBP", label: "Systolic BP", min: 80, max: 200, unit: "mmHg" },
  { name: "diastolicBP", label: "Diastolic BP", min: 40, max: 120, unit: "mmHg" },
  { name: "bloodGlucose", label: "Blood Glucose", min: 50, max: 300, unit: "mg/dL" },
  { name: "bodyTemp", label: "Body Temperature", min: 35, max: 42, unit: "°C" },
  { name: "heartRate", label: "Heart Rate", min: 40, max: 180, unit: "bpm" },
];

function mockPredict(data: PredictorForm): PredictionResult {
  const factors = [
    { name: "Systolic BP", importance: data.systolicBP > 140 ? 85 : 30 },
    { name: "Blood Glucose", importance: data.bloodGlucose > 200 ? 75 : 20 },
    { name: "Heart Rate", importance: data.heartRate > 120 ? 70 : 15 },
    { name: "Body Temp", importance: data.bodyTemp > 38 ? 60 : 10 },
    { name: "Age", importance: data.age > 35 ? 50 : 10 },
    { name: "Diastolic BP", importance: data.diastolicBP > 90 ? 65 : 15 },
  ].sort((a, b) => b.importance - a.importance);

  const score = factors.reduce((s, f) => s + f.importance, 0) / factors.length;
  const risk: RiskLevel = score > 55 ? "high" : score > 35 ? "mid" : "low";

  return { risk, confidence: Math.min(98, 70 + Math.random() * 25), mainFactor: factors[0].name, factors };
}

export default function RiskPredictorPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<PredictorForm>();

  const onSubmit = (data: PredictorForm) => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(mockPredict(data));
      setLoading(false);
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            Maternal Risk Predictor
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Enter patient vitals for AI-powered risk assessment
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="medical-card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                  <span className="text-muted-foreground ml-1 font-normal">({field.unit})</span>
                </Label>
                <Input
                  id={field.name}
                  type="number"
                  step={field.name === "bodyTemp" ? "0.1" : "1"}
                  placeholder={`${field.min}–${field.max}`}
                  {...register(field.name, {
                    required: `${field.label} is required`,
                    min: { value: field.min, message: `Min: ${field.min}` },
                    max: { value: field.max, message: `Max: ${field.max}` },
                    valueAsNumber: true,
                  })}
                  className={cn(errors[field.name] && "border-emergency")}
                />
                {errors[field.name] && (
                  <p className="text-xs text-emergency">{errors[field.name]?.message}</p>
                )}
              </div>
            ))}
          </div>

          <Button type="submit" variant="medical" size="lg" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Predict Risk
              </>
            )}
          </Button>
        </form>

        {/* Result */}
        {result && result.risk && (
          <div className="animate-slide-up space-y-4">
            <div className={cn("medical-card p-6 border-2", riskConfig[result.risk].border, riskConfig[result.risk].bg)}>
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = riskConfig[result.risk!].icon;
                  return <Icon className={cn("w-8 h-8", riskConfig[result.risk!].color)} />;
                })()}
                <div>
                  <h2 className={cn("text-2xl font-heading font-bold", riskConfig[result.risk].color)}>
                    {riskConfig[result.risk].label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Confidence: {result.confidence.toFixed(1)}%
                  </p>
                </div>
              </div>
              <div className="rounded-lg bg-card p-4 border">
                <p className="text-sm font-medium">Primary Risk Factor</p>
                <p className={cn("text-lg font-heading font-bold", riskConfig[result.risk].color)}>
                  {result.mainFactor}
                </p>
              </div>
            </div>

            <div className="medical-card p-6">
              <h3 className="font-heading font-semibold mb-4">Feature Importance</h3>
              <div className="space-y-3">
                {result.factors.map((f) => (
                  <div key={f.name} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{f.name}</span>
                      <span className="text-muted-foreground">{f.importance}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-700",
                          f.importance > 60 ? "gradient-emergency" : f.importance > 35 ? "gradient-warning" : "gradient-safe"
                        )}
                        style={{ width: `${f.importance}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
