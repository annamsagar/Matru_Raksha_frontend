import AppLayout from "@/components/AppLayout";
import { useRole } from "@/contexts/RoleContext";
import PatientDashboard from "./dashboards/PatientDashboard";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import DonorDashboard from "./dashboards/DonorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import HealthWorkerDashboard from "./dashboards/HealthWorkerDashboard";

const dashboardMap = {
  patient: PatientDashboard,
  doctor: DoctorDashboard,
  donor: DonorDashboard,
  admin: AdminDashboard,
  health_worker: HealthWorkerDashboard,
};

export default function DashboardPage() {
  const { role } = useRole();
  const Dashboard = dashboardMap[role] || PatientDashboard;

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
