"use client";
import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchNotifs() {
    const res = await fetch("/api/notifications");
    const data = await res.json();
    setNotifications(data.notifications ?? []);
    setLoading(false);
  }

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH" });
    fetchNotifs();
  }

  useEffect(() => { fetchNotifs(); }, []);

  const unread = notifications.filter((n) => !n.read);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          <p className="text-gray-400 text-sm mt-1">
            {unread.length > 0 ? `${unread.length} unread` : "All caught up"}
          </p>
        </div>
        {unread.length > 0 && (
          <button onClick={markAllRead} className="btn-secondary text-sm py-2">
            Mark all read
          </button>
        )}
      </div>

      <div className="card divide-y divide-dark-600">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-12">No notifications yet</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif.id} className={`flex gap-4 p-4 ${!notif.read ? "bg-primary-500/5" : ""}`}>
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${notif.read ? "bg-transparent" : "bg-primary-500"}`} />
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{notif.title}</p>
                  <p className="text-xs text-gray-500 shrink-0">{formatDate(notif.createdAt)}</p>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{notif.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
