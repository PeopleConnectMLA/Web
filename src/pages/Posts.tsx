import { useEffect, useState } from "react";
import { getPosts, createPost } from "../api/client";
import { PageHeader, EmptyState } from "../components/Ui";
import { Heart, MessageCircle, Plus, X } from "lucide-react";
import type { Post } from "../types";

const TYPES = [
  { id: "MEETING", label: "Meeting" },
  { id: "DEVELOPMENT_WORK", label: "Development Work" },
  { id: "ANNOUNCEMENT", label: "Announcement" },
];

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", type: "ANNOUNCEMENT" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const post = await createPost(1, form);
      setPosts((prev) => [post, ...prev]);
      setForm({ title: "", description: "", type: "ANNOUNCEMENT" });
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
            {TYPES.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setForm({ ...form, type: t.id })}
                className={`px-3 py-2.5 rounded-sm border text-sm font-medium transition-colors ${
                  form.type === t.id ? "border-seal bg-seal/5 text-seal-dark" : "border-ink/12 text-ink/70 hover:border-ink/25"
                }`}
              >
                {t.label}
              </button>
            ))}
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
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Publishing…" : "Publish to constituency feed"}
          </button>
        </form>
      )}

      {posts.length === 0 ? (
        <EmptyState title="No posts yet" description="Publish your first update so constituents can follow your activities." />
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <article key={p.id} className="file-card p-5">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono uppercase tracking-wide text-seal">{p.type?.replaceAll("_", " ")}</span>
                <span className="text-xs text-slateink">{new Date(p.createdDate).toLocaleDateString()}</span>
              </div>
              <h3 className="font-display text-lg font-semibold text-ink mb-1.5">{p.title}</h3>
              <p className="text-sm text-ink/75 leading-relaxed mb-4">{p.description}</p>
              <div className="flex items-center gap-5 text-xs text-slateink border-t border-ink/8 pt-3">
                <span className="flex items-center gap-1.5"><Heart size={14} /> {p.likedByUserIds?.length || 0} likes</span>
                <span className="flex items-center gap-1.5"><MessageCircle size={14} /> {p.comments?.length || 0} comments</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
