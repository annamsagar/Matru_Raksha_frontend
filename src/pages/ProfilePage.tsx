import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, Clock, Edit2, Save, Shield } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { useRole } from "@/contexts/RoleContext";

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { role, userName, setUserName } = useRole();

  const [profile, setProfile] = useState({ name: userName || "", email: "", phone: "", role: role });
  const [editName, setEditName] = useState(userName || "");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8081/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setProfile(data);
        setEditName(data.name);
        setEditPhone(data.phone || "");
      } catch {
        // Keep values from localStorage as fallback
        setEditName(userName || "");
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8081/api/users/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, phone: editPhone }),
      });
      if (!res.ok) throw new Error("Failed");
      const updated = await res.json();
      setProfile(updated);
      setUserName(updated.name);
      setEditing(false);
    } catch {
      alert("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const avatarInitials = profile.name
    ? profile.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";

  const roleLabel: Record<string, string> = {
    doctor: "Doctor",
    donor: "Donor",
    admin: "Administrator",
    health_worker: "Health Worker",
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        <h1 className="text-2xl font-heading font-bold flex items-center gap-2">
          <User className="w-6 h-6 text-primary" />
          My Profile
        </h1>

        {/* Profile card */}
        <div className="medical-card p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                {avatarInitials}
              </div>
              <div>
                <h2 className="font-heading font-bold text-lg">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{roleLabel[profile.role] || profile.role}</p>
              </div>
            </div>
            <Button
              variant={editing ? "medical" : "outline"}
              size="sm"
              onClick={editing ? handleSave : () => setEditing(true)}
              disabled={saving}
              className="gap-1"
            >
              {editing
                ? <><Save className="w-3 h-3" /> {saving ? "Saving…" : "Save"}</>
                : <><Edit2 className="w-3 h-3" /> Edit</>}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Mail className="w-3 h-3" />Email
              </Label>
              <Input value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Phone className="w-3 h-3" />Phone
              </Label>
              <Input
                value={editing ? editPhone : (profile.phone || "—")}
                disabled={!editing}
                onChange={(e) => setEditPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground">
                <User className="w-3 h-3" />Full Name
              </Label>
              <Input
                value={editing ? editName : profile.name}
                disabled={!editing}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-muted-foreground">
                <Shield className="w-3 h-3" />Role
              </Label>
              <Input value={roleLabel[profile.role] || profile.role} disabled />
            </div>
          </div>
        </div>

        {/* Recent activity placeholder */}
        <div className="medical-card p-6">
          <h2 className="font-heading font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            Recent Activity
          </h2>
          <p className="text-sm text-muted-foreground text-center py-6">
            Activity history will appear here as you use the platform.
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
