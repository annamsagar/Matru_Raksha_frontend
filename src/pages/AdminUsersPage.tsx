import { useState, useEffect } from "react";
import { Users, Shield, UserCheck, UserX, Loader2, UserCog, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/AppLayout";
import { cn } from "@/lib/utils";

interface UserAccount {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  createdAt?: string;
}

interface Patient {
  id: number;
  name: string;
  assignedDoctor?: { id: number; name: string };
  healthWorker?: { id: number; name: string };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [assignModal, setAssignModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");
  const [savingAssign, setSavingAssign] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [uRes, pRes] = await Promise.all([
        fetch("http://localhost:8081/api/admin/users", { headers }),
        fetch("http://localhost:8081/api/patients", { headers }),
      ]);

      if (uRes.ok) setUsers(await uRes.json());
      if (pRes.ok) setPatients(await pRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRoleChange = async (userId: number, newRole: string) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8081/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8081/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignCareTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;
    setSavingAssign(true);

    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://localhost:8081/api/admin/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId: selectedPatientId,
          doctorId: selectedDoctorId || null,
          workerId: selectedWorkerId || null,
        }),
      });

      if (res.ok) {
        setAssignModal(false);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingAssign(false);
    }
  };

  const doctors = users.filter((u) => u.role.toLowerCase() === "doctor");
  const healthWorkers = users.filter((u) => u.role.toLowerCase() === "health_worker");

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-emerald-600" />
              User Accounts & Role Management
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Role permissions, account activation status, and clinical care team assignments
            </p>
          </div>
          <Button onClick={() => setAssignModal(true)} className="gap-2 shrink-0 bg-emerald-600 hover:bg-emerald-700">
            <UserCog className="w-4 h-4" />
            Assign Care Team
          </Button>
        </div>

        {/* Users Table */}
        <div className="medical-card p-6 overflow-hidden">
          <h2 className="font-heading font-semibold text-base mb-4">
            System Accounts ({users.length})
          </h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">Contact</th>
                    <th className="pb-3 font-semibold">System Role</th>
                    <th className="pb-3 font-semibold">Account Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5">
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </td>
                      <td className="py-3.5 text-xs text-muted-foreground">
                        {u.phone || "—"}
                      </td>
                      <td className="py-3.5">
                        <select
                          className="h-8 px-2 rounded-md border text-xs bg-white font-medium"
                          value={u.role.toLowerCase()}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="patient">Patient</option>
                          <option value="doctor">Doctor</option>
                          <option value="health_worker">Health Worker</option>
                          <option value="donor">Donor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="py-3.5">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-xs font-semibold capitalize",
                          u.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                        )}>
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <Button
                          size="sm"
                          variant={u.isActive ? "outline" : "default"}
                          className="text-xs h-8"
                          onClick={() => handleStatusToggle(u.id, u.isActive)}
                        >
                          {u.isActive ? (
                            <><UserX className="w-3.5 h-3.5 mr-1 text-red-500" /> Deactivate</>
                          ) : (
                            <><UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Activate</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Assign Care Team Modal */}
        {assignModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="medical-card p-6 w-full max-w-md space-y-4 border shadow-xl">
              <h2 className="text-lg font-heading font-bold">Assign Patient Care Team</h2>
              <p className="text-xs text-muted-foreground">Link attending doctor and field health worker to maternal patient.</p>
              <form onSubmit={handleAssignCareTeam} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium">Select Maternal Patient</label>
                  <select
                    required
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                  >
                    <option value="">-- Choose Patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Assign Attending Doctor</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={selectedDoctorId}
                    onChange={(e) => setSelectedDoctorId(e.target.value)}
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium">Assign Field Health Worker</label>
                  <select
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    value={selectedWorkerId}
                    onChange={(e) => setSelectedWorkerId(e.target.value)}
                  >
                    <option value="">-- Choose Health Worker --</option>
                    {healthWorkers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-3">
                  <Button type="button" variant="outline" onClick={() => setAssignModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={savingAssign} className="bg-emerald-600 hover:bg-emerald-700">
                    {savingAssign ? "Saving..." : "Save Assignment"}
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
