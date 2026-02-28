import AppLayout from "@/components/AppLayout";
import { useRole } from "@/contexts/RoleContext";
import DoctorDashboard from "./dashboards/DoctorDashboard";
import DonorDashboard from "./dashboards/DonorDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";
import HealthWorkerDashboard from "./dashboards/HealthWorkerDashboard";

const dashboardMap = {
  doctor: DoctorDashboard,
  donor: DonorDashboard,
  admin: AdminDashboard,
  health_worker: HealthWorkerDashboard,
};

export default function DashboardPage() {
  const { role } = useRole();
  const Dashboard = dashboardMap[role];

  return (
    <AppLayout>
      <Dashboard />
    </AppLayout>
  );
}
