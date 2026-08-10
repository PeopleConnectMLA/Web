import { useEffect, useState } from "react";
import { PageHeader, EmptyState } from "../components/Ui";
import {
  Heart,
  Plus,
  X,
  Image as ImageIcon,
  Video,
  PlayCircle,
  Megaphone,
  HardHat,
  Users,
  UserCircle2,
  Calendar,
} from "lucide-react";
import type { Post } from "../types";
import { createPost, getPosts } from "../services";

const TYPES = [
  { id: "MEETING", label: "Meeting" },
  { id: "DEVELOPMENT_WORK", label: "Development Work" },
  { id: "ANNOUNCEMENT", label: "Announcement" },
];

const TYPE_SEAL: Record<
  string,
  { border: string; text: string; bg: string; icon: typeof Megaphone; short: string }
> = {
  MEETING: {
    border: "border-blue-500/30",
    text: "text-blue-400",
    bg: "bg-blue-500/10",
    icon: Users,
    short: "Meeting",
  },
  DEVELOPMENT_WORK: {
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    icon: HardHat,
    short: "Development",
  },
  ANNOUNCEMENT: {
    border: "border-amber-500/30",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    icon: Megaphone,
    short: "Notice",
  },
};

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "ANNOUNCEMENT",
  imageUrl: "",
  videoUrl: "",
};

function getYouTubeId(url?: string | null) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function stampDate(iso: string) {
  if (!iso) return "TODAY";
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const userId = sessionStorage.getItem("userId") || "";

  useEffect(() => {
    getPosts(userId).then((res) => {
      setPosts(res?.data ?? []);
    });
  }, [userId]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await createPost(userId, {
        ...form,
        imageUrl: form.imageUrl.trim(),
        videoUrl: form.videoUrl.trim(),
      });
      const post = res?.data;

      if (post) {
        setPosts((prev) => [post, ...prev]);
      }

      setForm(EMPTY_FORM);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-6 text-slate-100">
      <PageHeader
        eyebrow="Constituency Feed"
        title="Activity Posts"
        description="Meetings, development works, and announcements your constituents see in their app."
        actions={
          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all"
            onClick={() => setShowForm((v) => !v)}
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            <span>{showForm ? "Cancel" : "New Post"}</span>
          </button>
        }
      />

      {/* Creation Form Modal Card */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
        >
          <p className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
            Create Activity Post
          </p>

          <div className="grid sm:grid-cols-3 gap-2.5 mb-4">
            {TYPES.map((t) => {
              const seal = TYPE_SEAL[t.id];
              const Icon = seal.icon;
              const active = form.type === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                    active
                      ? `${seal.border} ${seal.bg} ${seal.text} ring-1 ring-blue-500/30`
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <Icon size={15} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Title
            </label>
            <input
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Public grievance camp this Saturday"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 min-h-[90px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details citizens should know…"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-slate-500" /> Image URL (Optional)
              </label>
              <input
                type="url"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Video size={13} className="text-slate-500" /> Video URL (Optional)
              </label>
              <input
                type="url"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/…"
              />
            </div>
          </div>

          {form.imageUrl.trim() && (
            <img
              src={form.imageUrl.trim()}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-xl border border-slate-800 mt-2"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/20 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Publish to Constituency Feed"}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <EmptyState
          title="No posts yet"
          description="Publish your first update so constituents can follow your activities."
        />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {posts.map((p) => {
            const ytId = getYouTubeId(p.videoUrl);
            const seal = TYPE_SEAL[p.type] ?? TYPE_SEAL.ANNOUNCEMENT;
            const SealIcon = seal.icon;

            return (
              <article
                key={p.id}
                className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-700 transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Category Pill & Date */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${seal.bg} ${seal.border} ${seal.text}`}
                    >
                      <SealIcon size={13} />
                      {seal.short}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {stampDate(p.createdDate)}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-white leading-snug">{p.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{p.description}</p>
                </div>

                {/* Media Image Attachment */}
                {p.imageUrl && (
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950">
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="w-full max-h-56 object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) =>
                        ((e.target as HTMLImageElement).parentElement!.style.display = "none")
                      }
                    />
                  </div>
                )}

                {/* Media Video Attachment */}
                {p.videoUrl && (
                  <a
                    href={p.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative rounded-xl border border-slate-800 overflow-hidden group block bg-slate-950"
                  >
                    {ytId ? (
                      <img
                        src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full max-h-56 object-cover"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-8 text-sm text-slate-400 justify-center">
                        <Video size={18} /> Watch Attached Video
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 group-hover:bg-slate-950/60 transition-colors">
                      <PlayCircle size={44} className="text-white drop-shadow-lg" />
                    </div>
                  </a>
                )}

                {/* Post Footer Metadata */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                    <Heart size={14} className="fill-rose-400/20" /> {p.likeCount ?? 0} Likes
                  </span>
                  {p.mlaName && (
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <UserCircle2 size={14} /> {p.mlaName}
                    </span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}