"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error", text: string } | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error", text: string } | null>(null);

  async function fetchProfile() {
    const res = await fetch("/api/profile");
    const data = await res.json();
    if (data.user) {
      setUser(data.user);
      setProfileForm({
        name: data.user.name || "",
        email: data.user.email || "",
        phone: data.user.phone || "",
      });
    }
    setLoading(false);
  }

  useEffect(() => { fetchProfile(); }, []);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profileForm),
    });

    const data = await res.json();
    setProfileSaving(false);

    if (res.ok) {
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
      fetchProfile();
    } else {
      setProfileMsg({ type: "error", text: data.error });
    }
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg({ type: "error", text: "Image size must be less than 5MB" });
      return;
    }

    setImageUploading(true);
    setProfileMsg(null);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setProfileMsg({ type: "success", text: "Profile picture updated!" });
        setUser({ ...user, image: data.user.image });
        // Reload to update the session in the layout sidebar
        window.location.reload();
      } else {
        setProfileMsg({ type: "error", text: data.error || "Failed to upload image" });
      }
    } catch (error) {
      setProfileMsg({ type: "error", text: "Failed to upload image" });
    } finally {
      setImageUploading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passwordForm.new !== passwordForm.confirm) {
      setPasswordMsg({ type: "error", text: "New passwords do not match" });
      return;
    }

    setPasswordSaving(true);
    setPasswordMsg(null);

    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
    });

    const data = await res.json();
    setPasswordSaving(false);

    if (res.ok) {
      setPasswordMsg({ type: "success", text: "Password changed successfully!" });
      setPasswordForm({ current: "", new: "", confirm: "" });
    } else {
      setPasswordMsg({ type: "error", text: data.error });
    }
  }

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold">Profile</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your personal information and security</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative group">
              {user?.image ? (
                <img src={user.image} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary-500/20" />
              ) : (
                <div className="w-16 h-16 bg-primary-500/20 rounded-full flex items-center justify-center text-primary-500 font-bold text-2xl">
                  {user?.name?.[0] || "U"}
                </div>
              )}
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity">
                <span className="material-symbols-outlined text-[1.5rem]">{imageUploading ? "hourglass_empty" : "photo_camera"}</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={imageUploading} />
              </label>
            </div>
            <div>
              <h2 className="font-display font-semibold text-lg">{user?.name}</h2>
              <p className="text-sm text-gray-400">Member since {user?.createdAt ? formatDate(user.createdAt) : "N/A"}</p>
            </div>
          </div>

          {profileMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm border mb-6 ${
              profileMsg.type === "success" ? "bg-primary-500/10 border-primary-500/20 text-primary-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
              <input
                type="email"
                className="input-field"
                value={profileForm.email}
                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Phone Number (Optional)</label>
              <input
                type="tel"
                className="input-field"
                placeholder="+1 234 567 8900"
                value={profileForm.phone}
                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={profileSaving}>
              {profileSaving ? "Saving..." : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Security */}
        <div className="card p-6">
          <h2 className="font-display font-semibold mb-6">Security & Password</h2>

          {passwordMsg && (
            <div className={`px-4 py-3 rounded-xl text-sm border mb-6 ${
              passwordMsg.type === "success" ? "bg-primary-500/10 border-primary-500/20 text-primary-400" : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {passwordMsg.text}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Current Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={passwordForm.new}
                onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1.5 block">Confirm New Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={passwordForm.confirm}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={passwordSaving}>
              {passwordSaving ? "Updating..." : "Change Password"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-dark-600">
            <h3 className="text-sm font-medium mb-2 text-red-400">Danger Zone</h3>
            <p className="text-xs text-gray-500 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-sm px-4 py-2 rounded-lg transition-colors">
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
