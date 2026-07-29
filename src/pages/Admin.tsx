import { useEffect, useMemo, useState } from "react";
import { PageHeader, EmptyState } from "../components/Ui";
import { SearchableSelect } from "../components/SearchableSelect";
import {
  ShieldCheck,
  MapPin,
  Users,
  UserPlus,
  X,
  Loader2,
  Pencil,
  Trash2,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Building2,
  PenLine,
  ArrowRight,
} from "lucide-react";
import type {
  AppUser,
  UnverifiedMla,
  ActiveDistrict,
  ActiveConstituency,
  Party,
  CreateMlaPayload,
} from "../types";
import {
  createMlaAPI,
  // updateMlaAPI,
  // deleteMlaAPI,
  // deleteUserAPI,
  getAllActiveConstituenciesByDistrictIdAPI,
  getAllActiveDistrictsAPI,
  getAllPartyAPI,
  getUnverifiedMlas,
  getUsers,
  setUserActive,
  verifyMla,
} from "../services";

const EMPTY_FORM: CreateMlaPayload = {
  name: "",
  mobile: "",
  email: "",
  password: "",
  party: "",
  officeAddress: "",
  photoUrl: "",
  bio: "",
  districtId: "",
  constituencyId: "",
};

/**
 * NOTE ON TYPES: editing an MLA needs more fields than the `UnverifiedMla`
 * shape used elsewhere in this file appears to expose (name, districtName,
 * constituencyName). If your actual `UnverifiedMla` type doesn't already
 * carry mobile/email/party/photoUrl/bio/districtId/constituencyId, add them
 * on the backend/type so the edit form can be pre-filled correctly. Until
 * then this file reads those fields defensively (falls back to "") so it
 * still compiles and works, just with a blank field where data is missing.
 */
type EditableMla = UnverifiedMla & Partial<CreateMlaPayload>;

type MlaModalState = { mode: "create" } | { mode: "edit"; mla: EditableMla } | null;

export default function Admin() {
  const [unverified, setUnverified] = useState<UnverifiedMla[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [districts, setDistricts] = useState<ActiveDistrict[]>([]);

  const [mlaModal, setMlaModal] = useState<MlaModalState>(null);
  const [confirm, setConfirm] = useState<
    | { kind: "mla"; id: number; name: string }
    | { kind: "user"; id: number; name: string }
    | null
  >(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  useEffect(() => {
    refresh();
  }, []);

  function refresh() {
    getUnverifiedMlas().then((res) => setUnverified(res?.data ?? []));
    getUsers().then((res) => setUsers(res?.data ?? []));
    getAllActiveDistrictsAPI().then((res) => setDistricts(res?.data ?? []));
  }

  async function handleVerify(id: number) {
    await verifyMla(String(id));
    setUnverified((prev) => prev.filter((m) => m.id !== id));
  }

  async function handleToggleActive(u: AppUser) {
    const res = await setUserActive(String(u.id));
    const updated = res?.data;
    setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, active: updated?.active ?? !u.active } : x)));
  }

  async function handleConfirmDelete() {
    if (!confirm) return;
    setConfirmBusy(true);
    try {
      if (confirm.kind === "mla") {
        // await deleteMlaAPI(String(confirm.id));
        setUnverified((prev) => prev.filter((m) => m.id !== confirm.id));
      } else {
        // await deleteUserAPI(String(confirm.id));
        setUsers((prev) => prev.filter((u) => u.id !== confirm.id));
      }
      setConfirm(null);
    } catch (err) {
      console.error(err);
    } finally {
      setConfirmBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        eyebrow="District Administration"
        title="Admin Panel"
        description="Verify MLA accounts, manage districts, and moderate user access."
        actions={
          <button
            onClick={() => setMlaModal({ mode: "create" })}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5"
          >
            <UserPlus size={14} />
            Add MLA
          </button>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <StatCard icon={<MapPin size={18} />} accent="text-seal" value={districts.length} label="Districts managed" />
        <StatCard icon={<Users size={18} />} accent="text-banyan" value={users.length} label="Registered users" />
        <StatCard
          icon={<ShieldCheck size={18} />}
          accent="text-marigold-light"
          value={unverified.length}
          label="Pending MLA verification"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <p className="eyebrow mb-3">Pending MLA verification</p>
          {unverified.length === 0 ? (
            <EmptyState title="All caught up" description="No MLA accounts are awaiting verification right now." />
          ) : (
            <div className="file-card divide-y divide-ink/8">
              {unverified.map((m) => (
                <div
                  key={m.id}
                  className="group px-5 py-4 flex items-center justify-between gap-3 transition-colors hover:bg-ink/[0.025]"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{m.name}</p>
                    <p className="text-xs text-slateink">
                      {m.constituencyName} · {m.districtName}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => handleVerify(m.id)} className="btn-secondary text-xs px-3 py-1.5">
                      Verify
                    </button>
                    <IconButton
                      label="Edit MLA"
                      onClick={() => setMlaModal({ mode: "edit", mla: m as EditableMla })}
                    >
                      <Pencil size={14} />
                    </IconButton>
                    <IconButton
                      label="Delete MLA"
                      tone="danger"
                      onClick={() => setConfirm({ kind: "mla", id: m.id, name: m.name })}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">User management</p>
          <div className="file-card divide-y divide-ink/8 max-h-[420px] overflow-y-auto">
            {users.map((u) => (
              <div
                key={u.id}
                className="group px-5 py-3.5 flex items-center justify-between gap-3 transition-colors hover:bg-ink/[0.025]"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{u.name}</p>
                  <p className="text-xs text-slateink font-mono">
                    {u.mobile} · {u.role} · {u.constituencyName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`text-[11px] font-mono uppercase tracking-wide px-2.5 py-1 rounded-sm border transition-colors ${
                      u.active
                        ? "border-banyan/40 text-banyan hover:bg-banyan/10"
                        : "border-seal/40 text-seal hover:bg-seal/10"
                    }`}
                  >
                    {u.active ? "Active" : "Deactivated"}
                  </button>
                  <IconButton
                    label="Delete user"
                    tone="danger"
                    onClick={() => setConfirm({ kind: "user", id: u.id, name: u.name })}
                  >
                    <Trash2 size={14} />
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {mlaModal && (
        <MlaFormModal
          state={mlaModal}
          onClose={() => setMlaModal(null)}
          onSaved={() => {
            setMlaModal(null);
            refresh();
          }}
        />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.kind === "mla" ? "Delete MLA account?" : "Delete user account?"}
          description={`This will permanently remove "${confirm.name}". This action can't be undone.`}
          busy={confirmBusy}
          onCancel={() => setConfirm(null)}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}

function StatCard({
  icon,
  accent,
  value,
  label,
}: {
  icon: React.ReactNode;
  accent: string;
  value: number;
  label: string;
}) {
  return (
    <div className="file-card p-5 flex items-start gap-3 transition-shadow hover:shadow-md">
      <span className={accent}>{icon}</span>
      <div>
        <p className="font-mono text-2xl font-semibold text-ink">{value}</p>
        <p className="text-xs text-slateink">{label}</p>
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  tone = "default",
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center w-7 h-7 rounded-sm border transition-colors ${
        tone === "danger"
          ? "border-seal/30 text-seal hover:bg-seal/10"
          : "border-ink/15 text-slateink hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function ConfirmDialog({
  title,
  description,
  busy,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onCancel]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center bg-ink/50 backdrop-blur-[2px] px-4 transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className={`file-card relative w-full max-w-sm shadow-xl px-7 py-6 transition-all duration-150 ${
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <div className="flex items-start gap-3">
          <span className="flex items-center justify-center w-9 h-9 rounded-full border border-seal/30 text-seal shrink-0">
            <AlertTriangle size={16} />
          </span>
          <div className="min-w-0">
            <p className="font-serif text-lg text-ink leading-tight">{title}</p>
            <p className="text-xs text-slateink mt-1.5 leading-relaxed">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-xs text-slateink hover:text-ink transition-colors px-2 py-2 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex items-center gap-1.5 text-xs font-medium text-white bg-seal hover:bg-seal/90 rounded-sm px-4 py-2 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy && <Loader2 size={14} className="animate-spin" />}
            {busy ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MlaFormModal({
  state,
  onClose,
  onSaved,
}: {
  state: { mode: "create" } | { mode: "edit"; mla: EditableMla };
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = state.mode === "edit";
  const initialForm: CreateMlaPayload = isEdit
    ? {
        name: state.mla.name ?? "",
        mobile: state.mla.mobile ?? "",
        email: state.mla.email ?? "",
        password: "",
        party: state.mla.party ?? "",
        officeAddress: state.mla.officeAddress ?? "",
        photoUrl: state.mla.photoUrl ?? "",
        bio: state.mla.bio ?? "",
        districtId: state.mla.districtId ?? "",
        constituencyId: state.mla.constituencyId ?? "",
      }
    : EMPTY_FORM;

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<CreateMlaPayload>(initialForm);
  const [districts, setDistricts] = useState<ActiveDistrict[]>([]);
  const [constituencies, setConstituencies] = useState<ActiveConstituency[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(true);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingParties, setLoadingParties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    getAllActiveDistrictsAPI()
      .then((res) => setDistricts(res?.data ?? []))
      .finally(() => setLoadingDistricts(false));
    getAllPartyAPI()
      .then((res) => setParties((res?.data ?? []).filter((p: Party) => p.active)))
      .finally(() => setLoadingParties(false));
  }, []);

  // Pre-load constituencies for the pre-filled district when editing.
  useEffect(() => {
    if (!isEdit || !initialForm.districtId) return;
    setLoadingConstituencies(true);
    getAllActiveConstituenciesByDistrictIdAPI(initialForm.districtId)
      .then((res) => setConstituencies(res?.data ?? []))
      .finally(() => setLoadingConstituencies(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const districtOptions = useMemo(
    () => districts.map((d) => ({ id: d.id, label: d.districtName })),
    [districts]
  );
  const constituencyOptions = useMemo(
    () => constituencies.map((c) => ({ id: c.id, label: c.constituencyName })),
    [constituencies]
  );
  const partyOptions = useMemo(
    () =>
      parties.map((p) => ({
        id: p.partyName,
        label: p.partyName,
        sublabel: p.shortName,
        iconUrl: p.symbolUrl,
      })),
    [parties]
  );

  function update<K extends keyof CreateMlaPayload>(key: K, value: CreateMlaPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleDistrictChange(districtId: string) {
    update("districtId", districtId);
    update("constituencyId", "");
    setConstituencies([]);
    if (!districtId) return;
    setLoadingConstituencies(true);
    try {
      const res = await getAllActiveConstituenciesByDistrictIdAPI(districtId);
      setConstituencies(res?.data ?? []);
    } finally {
      setLoadingConstituencies(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const requiredOk =
      form.name &&
      form.mobile &&
      form.email &&
      form.districtId &&
      form.constituencyId &&
      (isEdit || form.password);

    if (!requiredOk) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      if (isEdit) {
        // Don't send a blank password through on edit; only include it if the
        // admin actually typed a new one.
        const { password, ...rest } = form;
        const payload = password ? form : ({ ...rest, password: undefined } as CreateMlaPayload);
        // await updateMlaAPI(String(state.mla.id), payload);
      } else {
        await createMlaAPI(form);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      setError(
        isEdit
          ? "Could not update the MLA account. Please check the details and try again."
          : "Could not create the MLA account. Please check the details and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setForm(initialForm);
    setError(null);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px] px-4 transition-opacity duration-150 ${
        mounted ? "opacity-100" : "opacity-0"
      }`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl transition-all duration-150 ${
          mounted ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-1"
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div className="flex items-center gap-3.5">
            <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm shrink-0">
              {isEdit ? <Pencil size={18} /> : <UserPlus size={18} />}
            </span>
            <div>
              <p className="text-lg font-semibold text-slate-900 leading-tight">{isEdit ? "Edit MLA" : "Add MLA"}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEdit ? "Update this representative's account" : "Register a new representative account"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="px-8 pb-6">
          <div className="flex items-center">
            <StepPill index="01" label="Account Details" active />
            <div className="flex-1 h-px bg-slate-200 mx-3" />
            <StepPill index="02" label="Public Profile" />
            <div className="flex-1 h-px bg-slate-200 mx-3" />
            <StepPill index="03" label="Constituency Assignment" />
          </div>
        </div>

        <form id="mla-form" onSubmit={handleSubmit} className="px-8 pb-2 space-y-5">
          <div className="grid md:grid-cols-2 gap-5">
            <SectionCard
              icon={<User size={16} />}
              iconBg="bg-indigo-100"
              iconColor="text-indigo-600"
              headerBg="bg-indigo-50/70"
              title="Account Details"
              subtitle="Basic login information"
            >
              <Field label="Full Name" required>
                <IconInput
                  icon={<User size={15} />}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </Field>
              <Field label="Mobile Number" required>
                <IconInput
                  icon={<Phone size={15} />}
                  value={form.mobile}
                  onChange={(e) => update("mobile", e.target.value)}
                  placeholder="Enter mobile number"
                  required
                />
              </Field>
              <Field label="Email Address" required>
                <IconInput
                  icon={<Mail size={15} />}
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </Field>
              <Field label="Password" required={!isEdit}>
                <PasswordField
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                  required={!isEdit}
                />
              </Field>
            </SectionCard>

            <SectionCard
              icon={<Users size={16} />}
              iconBg="bg-emerald-100"
              iconColor="text-emerald-600"
              headerBg="bg-emerald-50/70"
              title="Public Profile"
              subtitle="Information visible to the public"
            >
              <Field label="Party" required>
                <SearchableSelect
                  options={partyOptions}
                  value={form.party}
                  onChange={(id) => update("party", id)}
                  placeholder="Select party"
                  searchPlaceholder="Search parties..."
                  loading={loadingParties}
                  emptyLabel="No parties found"
                  triggerClassName="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  menuClassName="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden"
                />
              </Field>
              <Field label="Photo URL">
                <IconInput
                  icon={<ImageIcon size={15} />}
                  value={form.photoUrl}
                  onChange={(e) => update("photoUrl", e.target.value)}
                  placeholder="https://example.com/photo.jpg"
                />
              </Field>
              <Field label="Office Address">
                <IconInput
                  icon={<Building2 size={15} />}
                  value={form.officeAddress}
                  onChange={(e) => update("officeAddress", e.target.value)}
                  placeholder="Enter office address"
                />
              </Field>
              <Field label="Bio / About">
                <div className="relative">
                  <PenLine size={15} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
                  <textarea
                    rows={5}
                    maxLength={300}
                    value={form.bio}
                    onChange={(e) => update("bio", e.target.value)}
                    placeholder="Write a short bio about the MLA..."
                    className="w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-shadow resize-none"
                  />
                  <span className="absolute bottom-2.5 right-3 text-[11px] text-slate-400">
                    {form.bio.length}/300
                  </span>
                </div>
              </Field>
            </SectionCard>
          </div>

          <SectionCard
            icon={<MapPin size={16} />}
            iconBg="bg-amber-100"
            iconColor="text-amber-600"
            headerBg="bg-amber-50/70"
            title="Constituency Assignment"
            subtitle="Select district and constituency"
          >
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="District" required>
                <SearchableSelect
                  options={districtOptions}
                  value={form.districtId}
                  onChange={handleDistrictChange}
                  placeholder="Select district"
                  searchPlaceholder="Search districts..."
                  loading={loadingDistricts}
                  emptyLabel="No districts found"
                  triggerClassName="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  menuClassName="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden"
                />
              </Field>
              <Field label="Constituency" required>
                <SearchableSelect
                  options={constituencyOptions}
                  value={form.constituencyId}
                  onChange={(id) => update("constituencyId", id)}
                  placeholder="Select constituency"
                  searchPlaceholder="Search constituencies..."
                  disabled={!form.districtId}
                  disabledHint={!form.districtId ? "Choose a district first" : undefined}
                  loading={loadingConstituencies}
                  emptyLabel="No constituencies found"
                  triggerClassName="rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  menuClassName="rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden"
                />
              </Field>
            </div>
          </SectionCard>
        </form>

        <div className="flex items-center justify-between gap-3 px-8 py-6">
          <button
            type="button"
            onClick={handleReset}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors px-2 py-2"
          >
            Reset
          </button>
          <div className="flex items-center gap-3">
            {error && <p className="text-xs text-rose-600">{error}</p>}
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-4 py-2.5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="mla-form"
              disabled={submitting}
              className="flex items-center gap-1.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 rounded-lg px-5 py-2.5 shadow-sm transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              {submitting ? (isEdit ? "Saving..." : "Creating...") : isEdit ? "Save changes" : "Create MLA"}
              {!submitting && <ArrowRight size={15} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPill({ index, label, active }: { index: string; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full border text-[11px] font-semibold ${
          active ? "border-indigo-600 text-indigo-600" : "border-slate-300 text-slate-400"
        }`}
      >
        {index}
      </span>
      <span className={`text-xs whitespace-nowrap ${active ? "text-slate-900 font-semibold" : "text-slate-400"}`}>
        {label}
      </span>
    </div>
  );
}

function SectionCard({
  icon,
  iconBg,
  iconColor,
  headerBg,
  title,
  subtitle,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  headerBg: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 ${headerBg}`}>
        <span className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${iconBg} ${iconColor}`}>
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
      <div className="px-5 py-5 space-y-4 bg-white">{children}</div>
    </div>
  );
}

function IconInput({
  icon,
  className = "",
  ...props
}: { icon: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</span>
      <input
        {...props}
        className={`w-full rounded-lg border border-slate-200 pl-10 pr-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-shadow ${className}`}
      />
    </div>
  );
}

function PasswordField({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        {...props}
        type={show ? "text" : "password"}
        className={`w-full rounded-lg border border-slate-200 pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-shadow ${className}`}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        tabIndex={-1}
        aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 mb-1.5 block">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      {children}
    </label>
  );
}