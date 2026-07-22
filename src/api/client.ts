import axios from "axios";
import * as seed from "../data/seed";
import type {
  AnalyticsResponse,
  AppUser,
  AuthResponse,
  Complaint,
  ComplaintStatus,
  Constituency,
  District,
  MlaProfile,
  Officer,
  Post,
  Role,
  UnverifiedMla,
} from "../types";

// If VITE_API_URL is set (see .env.example), every call below goes to the
// real Spring Boot backend over axios. Otherwise the app runs fully in
// "demo mode" against the seed data, so the dashboard is presentable out
// of the box for a sales demo or first design review.
const BASE_URL = import.meta.env.VITE_API_URL;
const DEMO_MODE = !BASE_URL;

export const http = axios.create({ baseURL: BASE_URL });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("pcm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const wait = (ms = 260) => new Promise((res) => setTimeout(res, ms));
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

// ---- Auth -----------------------------------------------------------
interface LoginParams {
  mobile: string;
  password: string;
  role: Role;
}

export async function login({ mobile, password, role }: LoginParams): Promise<AuthResponse> {
  if (DEMO_MODE) {
    await wait();
    const token = "demo-token";
    localStorage.setItem("pcm_token", token);
    return { token, userId: role === "ADMIN" ? 99 : 3, name: role === "ADMIN" ? "District Admin" : "A. Kumar", role };
  }
  const { data } = await http.post<AuthResponse>("/api/auth/login", { mobile, password });
  localStorage.setItem("pcm_token", data.token);
  return data;
}

// ---- Locations --------------------------------------------------------
export async function getDistricts(): Promise<District[]> {
  if (DEMO_MODE) { await wait(150); return clone(seed.districts); }
  return (await http.get<District[]>("/api/locations/districts")).data;
}

export async function getConstituencies(districtId: number): Promise<Constituency[]> {
  if (DEMO_MODE) {
    await wait(150);
    return clone(seed.constituencies.filter((c) => c.districtId === districtId));
  }
  return (await http.get<Constituency[]>(`/api/locations/districts/${districtId}/constituencies`)).data;
}

// ---- MLA --------------------------------------------------------------
export async function getMlaProfile(mlaId = 1): Promise<MlaProfile> {
  if (DEMO_MODE) { await wait(150); return clone(seed.mla); }
  return (await http.get<MlaProfile>(`/api/mla/${mlaId}`)).data;
}

export async function getAnalytics(mlaId = 1): Promise<AnalyticsResponse> {
  if (DEMO_MODE) {
    await wait(200);
    const total = seed.complaints.length;
    const resolved = seed.complaints.filter((c) => c.status === "RESOLVED").length;
    const inProgress = seed.complaints.filter((c) => c.status === "IN_PROGRESS").length;
    const pending = total - resolved - inProgress;
    const categoryBreakdown: Record<string, number> = {};
    seed.complaints.forEach((c) => {
      const key = c.category || "OTHER";
      categoryBreakdown[key] = (categoryBreakdown[key] || 0) + 1;
    });
    return {
      totalComplaints: total,
      resolvedComplaints: resolved,
      inProgressComplaints: inProgress,
      pendingComplaints: pending,
      resolutionRatePercent: total ? Math.round((resolved / total) * 10000) / 100 : 0,
      categoryBreakdown,
    };
  }
  return (await http.get<AnalyticsResponse>(`/api/mla/${mlaId}/analytics`)).data;
}

// ---- Complaints ---------------------------------------------------------
export async function getComplaints(mlaId = 1, status?: ComplaintStatus): Promise<Complaint[]> {
  if (DEMO_MODE) {
    await wait(220);
    let list = clone(seed.complaints);
    if (status) list = list.filter((c) => c.status === status);
    return list;
  }
  return (await http.get<Complaint[]>(`/api/complaints/mla/${mlaId}`, { params: { status } })).data;
}

interface StatusUpdatePayload {
  status: ComplaintStatus;
  remarks?: string;
  assignOfficerId?: number | string;
}

export async function updateComplaintStatus(id: number, { status, remarks, assignOfficerId }: StatusUpdatePayload): Promise<Complaint | undefined> {
  if (DEMO_MODE) {
    await wait(300);
    const c = seed.complaints.find((x) => x.id === id);
    if (c) {
      c.status = status;
      if (status === "RESOLVED") c.resolvedDate = new Date().toISOString();
      if (assignOfficerId) c.assignedOfficer = seed.officers.find((o) => o.id === Number(assignOfficerId))?.name;
    }
    return clone(c);
  }
  return (await http.patch<Complaint>(`/api/complaints/${id}/status`, { status, remarks, assignOfficerId })).data;
}

// ---- Posts ------------------------------------------------------------
export async function getPosts(mlaId = 1): Promise<Post[]> {
  if (DEMO_MODE) { await wait(200); return clone(seed.posts); }
  return (await http.get<Post[]>(`/api/posts/mla/${mlaId}`)).data;
}

export interface CreatePostPayload {
  title: string;
  description?: string;
  type: string;
  imageUrl?: string;
  videoUrl?: string;
}

export async function createPost(mlaId: number, payload: CreatePostPayload): Promise<Post> {
  if (DEMO_MODE) {
    await wait(300);
    const post: Post = {
      id: Date.now(),
      ...payload,
      createdDate: new Date().toISOString(),
      likedByUserIds: [],
      comments: [],
    };
    seed.posts.unshift(post);
    return clone(post);
  }
  return (await http.post<Post>(`/api/posts/mla/${mlaId}`, payload)).data;
}

// ---- Admin --------------------------------------------------------------
export async function getUsers(): Promise<AppUser[]> {
  if (DEMO_MODE) { await wait(200); return clone(seed.users); }
  return (await http.get<AppUser[]>("/api/admin/users")).data;
}

export async function setUserActive(id: number, active: boolean): Promise<AppUser | undefined> {
  if (DEMO_MODE) {
    await wait(200);
    const u = seed.users.find((x) => x.id === id);
    if (u) u.active = active;
    return clone(u);
  }
  return (await http.patch<AppUser>(`/api/admin/users/${id}/active`, { active })).data;
}

export async function getUnverifiedMlas(): Promise<UnverifiedMla[]> {
  if (DEMO_MODE) { await wait(200); return clone(seed.unverifiedMlas); }
  return (await http.get<UnverifiedMla[]>("/api/admin/mlas/unverified")).data;
}

export async function verifyMla(id: number): Promise<{ ok: boolean }> {
  if (DEMO_MODE) {
    await wait(250);
    const idx = seed.unverifiedMlas.findIndex((m) => m.id === id);
    if (idx > -1) seed.unverifiedMlas.splice(idx, 1);
    return { ok: true };
  }
  return (await http.patch(`/api/admin/mlas/${id}/verify`)).data;
}

export async function getOfficers(): Promise<Officer[]> {
  await wait(80);
  return clone(seed.officers);
}

export const isDemoMode = DEMO_MODE;
