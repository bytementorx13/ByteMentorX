import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Calendar, LogOut, RefreshCw,
  Clock, Mail, ChevronDown, ChevronUp, X
} from "lucide-react";

type Request = {
  id: string;
  name: string;
  email: string;
  serviceType: string;
  calculatedPrice: number | null;
  finalPrice: number | null;
  status: string;
  paymentStatus: string;
  sessionDate: string | null;
  sessionTime: string | null;
  meetingLink: string | null;
  adminNotes: string | null;
  formData: Record<string, unknown>;
  timestamp: string;
};

const SERVICE_LABELS: Record<string, string> = {
  webdev: "Web Dev",
  consultation: "Consultation",
  csfunda: "CS Fundamentals",
  project: "Project / Resume",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  accepted: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  rejected: "bg-red-500/15 text-red-400 border-red-500/20",
  scheduled: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  completed: "bg-green-500/15 text-green-400 border-green-500/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  unpaid: "text-muted-foreground",
  paid: "text-green-400",
  advance_paid: "text-blue-400",
  fully_paid: "text-green-400",
};

type ModalType = "accept" | "reject" | "schedule" | null;

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: ModalType; request: Request } | null>(null);

  // Modal form state
  const [adminNotes, setAdminNotes] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [sessionTime, setSessionTime] = useState("");
  const [meetingLink, setMeetingLink] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const res = await fetch("/api/admin/check");
    const data = await res.json();
    if (!data.isAdmin) {
      navigate("/admin");
      return;
    }
    fetchRequests();
  }

  async function fetchRequests() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      if (res.status === 401) { navigate("/admin"); return; }
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    navigate("/admin");
  }

  function openModal(type: ModalType, request: Request) {
    setModal({ type, request });
    setAdminNotes("");
    setSessionDate("");
    setSessionTime("");
    setMeetingLink("");
  }

  function closeModal() {
    setModal(null);
  }

  async function submitAction(requestId: string, action: string, body: Record<string, unknown> = {}) {
    setActionLoading(requestId + action);
    try {
      const res = await fetch(`/api/admin/requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...body }),
      });
      if (res.ok) {
        const updated = await res.json();
        setRequests((prev) => prev.map((r) => (r.id === requestId ? updated : r)));
        closeModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  }

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    accepted: requests.filter((r) => r.status === "accepted").length,
    scheduled: requests.filter((r) => r.status === "scheduled").length,
    completed: requests.filter((r) => r.status === "completed").length,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-gradient-to-tr from-primary to-secondary flex items-center justify-center font-bold text-xs text-background">B</div>
            <span className="font-display font-bold text-lg">ByteMentorX</span>
            <span className="hidden sm:inline text-xs text-muted-foreground px-2 py-0.5 rounded-full border border-white/10 ml-1">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              data-testid="button-refresh"
              onClick={fetchRequests}
              className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              data-testid="button-logout"
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: "Total", value: stats.total, color: "text-foreground" },
            { label: "Pending", value: stats.pending, color: "text-yellow-400" },
            { label: "Accepted", value: stats.accepted, color: "text-blue-400" },
            { label: "Scheduled", value: stats.scheduled, color: "text-purple-400" },
            { label: "Completed", value: stats.completed, color: "text-green-400" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Requests Table */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="font-display font-bold text-lg">Service Requests</h2>
            <span className="text-sm text-muted-foreground">{requests.length} total</span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">No requests yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    {["Name", "Service", "Price", "Status", "Payment", "Date", "Actions"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <>
                      <tr
                        key={req.id}
                        data-testid={`row-request-${req.id}`}
                        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      >
                        {/* Name + Email */}
                        <td className="px-4 py-3">
                          <p className="font-medium text-foreground truncate max-w-[140px]">{req.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[140px]">{req.email}</p>
                        </td>

                        {/* Service */}
                        <td className="px-4 py-3">
                          <span className="text-xs font-medium text-foreground/80 whitespace-nowrap">
                            {SERVICE_LABELS[req.serviceType] || req.serviceType}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {req.finalPrice
                            ? <span className="text-foreground font-semibold">₹{req.finalPrice.toLocaleString("en-IN")}</span>
                            : req.calculatedPrice
                            ? <span className="text-foreground/80">₹{req.calculatedPrice.toLocaleString("en-IN")}</span>
                            : <span className="text-muted-foreground text-xs">Custom</span>}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_COLORS[req.status] || "text-muted-foreground"}`}>
                            {req.status}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="px-4 py-3">
                          <span className={`text-xs ${PAYMENT_COLORS[req.paymentStatus] || "text-muted-foreground"}`}>
                            {req.paymentStatus.replace("_", " ")}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(req.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {req.status === "pending" && (
                              <>
                                <ActionBtn
                                  label="Accept"
                                  icon={<CheckCircle className="w-3 h-3" />}
                                  color="green"
                                  loading={actionLoading === req.id + "accept"}
                                  onClick={() => openModal("accept", req)}
                                />
                                <ActionBtn
                                  label="Reject"
                                  icon={<XCircle className="w-3 h-3" />}
                                  color="red"
                                  loading={actionLoading === req.id + "reject"}
                                  onClick={() => openModal("reject", req)}
                                />
                              </>
                            )}
                            {req.status === "accepted" && (
                              <>
                                <ActionBtn
                                  label="Schedule"
                                  icon={<Calendar className="w-3 h-3" />}
                                  color="purple"
                                  loading={actionLoading === req.id + "schedule"}
                                  onClick={() => openModal("schedule", req)}
                                />
                                <ActionBtn
                                  label="Reject"
                                  icon={<XCircle className="w-3 h-3" />}
                                  color="red"
                                  loading={actionLoading === req.id + "reject"}
                                  onClick={() => openModal("reject", req)}
                                />
                              </>
                            )}
                            {req.status === "scheduled" && (
                              <ActionBtn
                                label="Complete"
                                icon={<CheckCircle className="w-3 h-3" />}
                                color="green"
                                loading={actionLoading === req.id + "complete"}
                                onClick={() => submitAction(req.id, "complete")}
                              />
                            )}
                            {/* Expand */}
                            <button
                              data-testid={`button-expand-${req.id}`}
                              onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                              title="View details"
                            >
                              {expandedId === req.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row */}
                      {expandedId === req.id && (
                        <tr key={req.id + "-expanded"} className="bg-white/[0.01]">
                          <td colSpan={7} className="px-6 pb-5 pt-3">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-2">Form Data</p>
                                <div className="space-y-1.5">
                                  {Object.entries(req.formData).filter(([, v]) => v).map(([k, v]) => (
                                    <div key={k} className="flex gap-3 text-sm">
                                      <span className="text-muted-foreground min-w-[110px] capitalize">{k.replace(/([A-Z])/g, " $1")}:</span>
                                      <span className="text-foreground/90">{String(v)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="space-y-3">
                                {req.adminNotes && (
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Admin Notes</p>
                                    <p className="text-sm text-foreground/80">{req.adminNotes}</p>
                                  </div>
                                )}
                                {req.sessionDate && (
                                  <div>
                                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">Session</p>
                                    <p className="text-sm text-foreground/80">{req.sessionDate} at {req.sessionTime}</p>
                                    {req.meetingLink && (
                                      <a href={req.meetingLink} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">{req.meetingLink}</a>
                                    )}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 pt-1">
                                  <a
                                    href={`mailto:${req.email}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                  >
                                    <Mail className="w-3 h-3" /> Email Client
                                  </a>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md glass-card rounded-2xl p-6 shadow-2xl z-10"
            >
              <button onClick={closeModal} className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>

              {modal.type === "accept" && (
                <>
                  <h3 className="text-lg font-display font-bold mb-1">Accept Request</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Accepting <strong className="text-foreground">{modal.request.name}</strong>'s request. An email will be sent notifying them.
                  </p>
                  <label className="block text-sm font-medium mb-1.5">Message to client (optional)</label>
                  <textarea
                    data-testid="input-admin-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-4"
                    placeholder="Any message to include in the acceptance email…"
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button
                      data-testid="button-confirm-accept"
                      onClick={() => submitAction(modal.request.id, "accept", { adminNotes })}
                      disabled={!!actionLoading}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-500 transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? "Sending…" : "Accept & Notify"}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "reject" && (
                <>
                  <h3 className="text-lg font-display font-bold mb-1">Reject Request</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    An email will be sent to <strong className="text-foreground">{modal.request.name}</strong> with the rejection notice.
                  </p>
                  <label className="block text-sm font-medium mb-1.5">Reason / Message (optional)</label>
                  <textarea
                    data-testid="input-reject-notes"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none mb-4"
                    placeholder="Reason for rejection (will be included in the email)…"
                  />
                  <div className="flex gap-3 justify-end">
                    <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button
                      data-testid="button-confirm-reject"
                      onClick={() => submitAction(modal.request.id, "reject", { adminNotes })}
                      disabled={!!actionLoading}
                      className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-500 transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? "Sending…" : "Reject & Notify"}
                    </button>
                  </div>
                </>
              )}

              {modal.type === "schedule" && (
                <>
                  <h3 className="text-lg font-display font-bold mb-1">Schedule Session</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Set date & time for <strong className="text-foreground">{modal.request.name}</strong>. An email with the session details will be sent automatically.
                  </p>
                  <div className="space-y-4 mb-5">
                    <div>
                      <label className="block text-sm font-medium mb-1.5"><Calendar className="inline w-3.5 h-3.5 mr-1" />Date</label>
                      <input
                        data-testid="input-session-date"
                        type="date"
                        value={sessionDate}
                        onChange={(e) => setSessionDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5"><Clock className="inline w-3.5 h-3.5 mr-1" />Time</label>
                      <input
                        data-testid="input-session-time"
                        type="time"
                        value={sessionTime}
                        onChange={(e) => setSessionTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Meeting Link (optional)</label>
                      <input
                        data-testid="input-meeting-link"
                        type="url"
                        value={meetingLink}
                        onChange={(e) => setMeetingLink(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        placeholder="https://meet.google.com/…"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-white/10 text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
                    <button
                      data-testid="button-confirm-schedule"
                      onClick={() => {
                        if (!sessionDate || !sessionTime) return;
                        submitAction(modal.request.id, "schedule", { sessionDate, sessionTime, meetingLink: meetingLink || null });
                      }}
                      disabled={!sessionDate || !sessionTime || !!actionLoading}
                      className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors disabled:opacity-60"
                    >
                      {actionLoading ? "Scheduling…" : "Schedule & Notify"}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionBtn({
  label,
  icon,
  color,
  onClick,
  loading,
}: {
  label: string;
  icon: React.ReactNode;
  color: "green" | "red" | "purple" | "blue";
  onClick: () => void;
  loading?: boolean;
}) {
  const colors = {
    green: "border-green-500/30 text-green-400 hover:bg-green-500/10",
    red: "border-red-500/30 text-red-400 hover:bg-red-500/10",
    purple: "border-purple-500/30 text-purple-400 hover:bg-purple-500/10",
    blue: "border-blue-500/30 text-blue-400 hover:bg-blue-500/10",
  };
  return (
    <button
      data-testid={`button-${label.toLowerCase()}`}
      onClick={onClick}
      disabled={loading}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors disabled:opacity-50 ${colors[color]}`}
    >
      {icon} {label}
    </button>
  );
}
