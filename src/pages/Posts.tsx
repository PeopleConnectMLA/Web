import { useEffect, useState } from "react";
import { PageHeader, EmptyState } from "../components/Ui";
import { Heart, Plus, X, Image as ImageIcon, Video, PlayCircle, Megaphone, HardHat, Users, UserCircle2 } from "lucide-react";
import type { Post } from "../types";
import { createPost, getPosts } from "../services";

const TYPES = [
  { id: "MEETING", label: "Meeting" },
  { id: "DEVELOPMENT_WORK", label: "Development Work" },
  { id: "ANNOUNCEMENT", label: "Announcement" },
];

/** Each notice type gets its own wax-seal color + mark, echoing the RESOLVED
 *  stamp used elsewhere in the app so the whole product shares one visual language. */
const TYPE_SEAL: Record<string, { border: string; text: string; bg: string; icon: typeof Megaphone; short: string }> = {
  MEETING: { border: "border-slateink", text: "text-slateink", bg: "bg-slateink/5", icon: Users, short: "Meet" },
  DEVELOPMENT_WORK: { border: "border-banyan", text: "text-banyan", bg: "bg-banyan/5", icon: HardHat, short: "Work" },
  ANNOUNCEMENT: { border: "border-seal", text: "text-seal-dark", bg: "bg-seal/5", icon: Megaphone, short: "Notice" },
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
  return new Date(iso)
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

/** Thin row of "sprocket" marks so video thumbnails read as a filmstrip clip
 *  rather than a generic embed. */
function Sprockets() {
  return (
    <div className="flex justify-between px-2 py-1 bg-ink/90">
      {Array.from({ length: 14 }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-[1px] bg-parchment/70" />
      ))}
    </div>
  );
}

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const userId = sessionStorage.getItem('userId')

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
    <div>
      <PageHeader
        eyebrow="Constituency Feed"
        title="Activity Posts"
        description="Meetings, development works, and announcements your constituents see in their app."
        actions={
          <button className="btn-seal" onClick={() => setShowForm((v) => !v)}>
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Post"}
          </button>
        }
      />

      {showForm && (
        <form onSubmit={handleCreate} className="file-card p-5 mb-8">
          <div className="grid sm:grid-cols-3 gap-2 mb-4">
            {TYPES.map((t) => {
              const seal = TYPE_SEAL[t.id];
              const Icon = seal.icon;
              const active = form.type === t.id;
              return (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => setForm({ ...form, type: t.id })}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-sm border text-sm font-medium transition-colors ${
                    active ? `${seal.border} ${seal.bg} ${seal.text}` : "border-ink/12 text-ink/70 hover:border-ink/25"
                  }`}
                >
                  <Icon size={14} />
                  {t.label}
                </button>
              );
            })}
          </div>
          <label className="block mb-3">
            <span className="text-xs font-medium text-ink/70 mb-1.5 block">Title</span>
            <input
              required
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Public grievance camp this Saturday"
            />
          </label>
          <label className="block mb-4">
            <span className="text-xs font-medium text-ink/70 mb-1.5 block">Description</span>
            <textarea
              required
              className="input-field min-h-[90px] resize-none"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Add details citizens should know…"
            />
          </label>

          <div className="grid sm:grid-cols-2 gap-3 mb-2">
            <label className="block">
              <span className="text-xs font-medium text-ink/70 mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-slateink" /> Image URL (optional)
              </span>
              <input
                type="url"
                className="input-field"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink/70 mb-1.5 flex items-center gap-1.5">
                <Video size={13} className="text-slateink" /> Video URL (optional)
              </span>
              <input
                type="url"
                className="input-field"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/…"
              />
            </label>
          </div>

          {form.imageUrl.trim() && (
            <img
              src={form.imageUrl.trim()}
              alt="Preview"
              className="w-full max-h-48 object-cover rounded-sm border border-ink/10 mb-4"
              onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
            />
          )}

          <button type="submit" disabled={saving} className="btn-primary mt-3">
            {saving ? "Publishing…" : "Publish to constituency feed"}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Publish your first update so constituents can follow your activities." />
      ) : (
        <div className="grid md:grid-cols-2 gap-x-6 gap-y-10">
          {posts.map((p, i) => {
            const ytId = getYouTubeId(p.videoUrl);
            const seal = TYPE_SEAL[p.type] ?? TYPE_SEAL.ANNOUNCEMENT;
            const SealIcon = seal.icon;
            const tilt = i % 2 === 0 ? "-rotate-[0.6deg]" : "rotate-[0.6deg]";

            return (
              <article
                key={p.id}
                className={`relative bg-parchment border border-ink/10 shadow-sm hover:shadow-md hover:rotate-0 transition-all duration-200 p-5 pt-6 ${tilt}`}
              >
                {/* wax-seal type mark, pinned to the corner like a stamped notice */}
                <div
                  className={`absolute -top-4 -right-3 w-14 h-14 rounded-full bg-parchment border-[3px] ${seal.border} flex flex-col items-center justify-center rotate-[8deg] shadow-sm`}
                >
                  <SealIcon size={15} className={seal.text} />
                  <span className={`text-[7px] font-mono uppercase tracking-wide mt-0.5 ${seal.text}`}>{seal.short}</span>
                </div>

                <span className="inline-block text-[10px] font-mono uppercase tracking-wide text-slateink border border-ink/15 rounded-[2px] px-1.5 py-0.5 mb-3">
                  {stampDate(p.createdDate)}
                </span>

                <h3 className="font-display text-lg font-semibold text-ink mb-1.5 pr-10 leading-snug">{p.title}</h3>
                <p className="text-sm text-ink/75 leading-relaxed mb-4">{p.description}</p>

                {p.imageUrl && (
                  <div className="relative w-[92%] mx-auto mb-5 mt-2">
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-parchment/90 border border-ink/10 rotate-2 shadow-sm" />
                    <div className="bg-white p-1.5 pb-3 border border-ink/10 shadow-md -rotate-1">
                      <img
                        src={p.imageUrl}
                        alt={p.title}
                        className="w-full max-h-56 object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).parentElement!.parentElement!.style.display = "none")}
                      />
                    </div>
                  </div>
                )}

                {p.videoUrl && (
                  <a
                    href={p.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block mb-5 border border-ink/10 shadow-sm group overflow-hidden"
                  >
                    <Sprockets />
                    <div className="relative">
                      {ytId ? (
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                          alt="Video thumbnail"
                          className="w-full max-h-56 object-cover"
                        />
                      ) : (
                        <div className="flex items-center gap-2 px-4 py-6 bg-ink/5 text-sm text-ink/70 justify-center">
                          <Video size={16} /> Watch video
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-ink/15 group-hover:bg-ink/30 transition-colors">
                        <PlayCircle size={36} className="text-parchment drop-shadow" />
                      </div>
                    </div>
                    <Sprockets />
                  </a>
                )}

                <div className="flex items-center justify-between text-xs text-slateink border-t border-dashed border-ink/15 pt-3">
                  <span className="flex items-center gap-1.5"><Heart size={14} /> {p.likeCount ?? 0} likes</span>
                  {p.mlaName && (
                    <span className="flex items-center gap-1.5"><UserCircle2 size={14} /> {p.mlaName}</span>
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