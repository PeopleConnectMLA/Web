// Domain types mirroring the Spring Boot backend's entities/DTOs.

export type Role = "CITIZEN" | "MLA" | "OFFICER" | "ADMIN";

export type ComplaintStatus = "NEW" | "RECEIVED" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Category =
  | "INFRASTRUCTURE"
  | "WATER"
  | "ELECTRICITY"
  | "SANITATION"
  | "ROAD"
  | "HEALTH"
  | "EDUCATION"
  | "LAW_AND_ORDER"
  | "OTHER";

export type PostType = "MEETING" | "DEVELOPMENT_WORK" | "ANNOUNCEMENT";

export interface District {
  id: number;
  name: string;
  state: string;
}

export interface Constituency {
  id: number;
  name: string;
  districtId: number;
  areasCovered?: string;
}

export interface MlaProfile {
  id: number;
  name: string;
  party?: string;
  phone?: string;
  officeAddress?: string;
  photoUrl?: string;
  bio?: string;
  districtName: string;
  constituencyName: string;
  verified: boolean;
}

export interface Complaint {
  id: number;
  title: string;
  description?: string;
  category?: Category;
  priority: Priority;
  status: ComplaintStatus;
  citizenName: string;
  imageUrl?: string;
  videoUrl?: string;
  affectedCount: number;
  latitude?: number;
  longitude?: number;
  addressText?: string;
  createdDate: string;
  resolvedDate?: string;
  assignedOfficer?: string;
}

export interface Comment {
  id: number;
  userName: string;
  text: string;
  createdDate?: string;
}

export interface Post {
  id: number;
  title: string;
  description?: string;
  type: PostType | string;
  imageUrl?: string;
  videoUrl?: string;
  createdDate: string;
  likedByUserIds: number[];
  comments: Comment[];
}

export interface Officer {
  id: number;
  name: string;
}

export interface AppUser {
  id: number;
  name: string;
  mobile: string;
  role: Role;
  constituencyName?: string;
  active: boolean;
}

export interface UnverifiedMla {
  id: number;
  name: string;
  constituencyName: string;
  districtName: string;
  phone?: string;
}

export interface AnalyticsResponse {
  totalComplaints: number;
  resolvedComplaints: number;
  inProgressComplaints: number;
  pendingComplaints: number;
  resolutionRatePercent: number;
  categoryBreakdown: Record<string, number>;
}

export interface AuthResponse {
  token: string;
  userId: number;
  name: string;
  role: Role;
}

export interface Session {
  name: string;
  role: Role;
  userId: number;
}
