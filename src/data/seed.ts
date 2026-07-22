// Demo data mirroring the Spring Boot DTOs (District, Constituency, Mla,
// Complaint, Post). Used by src/api/client.ts so the dashboard is fully
// browsable without the Java backend running. Swap VITE_API_URL in .env to
// point at a live backend — the api client already speaks this same shape.

import type {
  AppUser,
  Complaint,
  Constituency,
  District,
  MlaProfile,
  Officer,
  Post,
  UnverifiedMla,
} from "../types";

export const districts: District[] = [
  { id: 1, name: "Chennai", state: "Tamil Nadu" },
  { id: 2, name: "Coimbatore", state: "Tamil Nadu" },
];

export const constituencies: Constituency[] = [
  { id: 1, name: "Velachery", districtId: 1, areasCovered: "Velachery, Pallikaranai, Medavakkam" },
  { id: 2, name: "Mylapore", districtId: 1, areasCovered: "Mylapore, Adyar, R.A. Puram" },
  { id: 3, name: "Coimbatore North", districtId: 2, areasCovered: "Ganapathy, Thudiyalur, Saravanampatti" },
];

export const mla: MlaProfile = {
  id: 1,
  name: "A. Kumar",
  party: "Independent",
  phone: "+91 98400 12345",
  officeAddress: "MLA Office, 12 Anna Salai, Velachery, Chennai",
  photoUrl: "",
  bio: "Serving Velachery constituency since 2021. Focus areas: roads, water supply, education.",
  districtName: "Chennai",
  constituencyName: "Velachery",
  verified: true,
};

const now = Date.now();
const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

export let complaints: Complaint[] = [
  {
    id: 1031,
    title: "Overflowing sewage near Medavakkam bus stand",
    description: "Sewage has been overflowing onto the main road for 4 days, causing health hazards for commuters and shop owners.",
    category: "SANITATION",
    priority: "CRITICAL",
    status: "NEW",
    citizenName: "Kavitha R.",
    imageUrl: "",
    affectedCount: 34,
    latitude: 12.9165, longitude: 80.1876,
    addressText: "Medavakkam Bus Stand, Velachery",
    createdDate: daysAgo(0.3),
  },
  {
    id: 1030,
    title: "Streetlights not working on 100 Feet Road",
    description: "Almost 12 streetlights have been non-functional for two weeks, making the stretch unsafe at night.",
    category: "ELECTRICITY",
    priority: "HIGH",
    status: "IN_PROGRESS",
    citizenName: "Mohammed I.",
    imageUrl: "",
    affectedCount: 18,
    latitude: 12.9750, longitude: 80.2210,
    addressText: "100 Feet Road, Velachery",
    createdDate: daysAgo(3),
  },
  {
    id: 1029,
    title: "Deep pothole near Vijayanagar signal causing accidents",
    description: "A large pothole has formed after the recent rains; two two-wheeler riders have already fallen.",
    category: "ROAD",
    priority: "HIGH",
    status: "RECEIVED",
    citizenName: "Suresh K.",
    imageUrl: "",
    affectedCount: 9,
    latitude: 12.9800, longitude: 80.2200,
    addressText: "Vijayanagar Signal, Velachery",
    createdDate: daysAgo(2),
  },
  {
    id: 1028,
    title: "No water supply for 3 days in Phase 2",
    description: "Corporation water tanker has not arrived this week. Residents have run out of stored water.",
    category: "WATER",
    priority: "CRITICAL",
    status: "IN_PROGRESS",
    citizenName: "Lakshmi N.",
    imageUrl: "",
    affectedCount: 112,
    latitude: 12.9700, longitude: 80.2100,
    addressText: "Phase 2, Pallikaranai",
    createdDate: daysAgo(4),
  },
  {
    id: 1027,
    title: "Encroachment blocking footpath near school",
    description: "Vendors have set up permanent stalls on the footpath forcing schoolchildren to walk on the road.",
    category: "INFRASTRUCTURE",
    priority: "MEDIUM",
    status: "RESOLVED",
    citizenName: "Anitha P.",
    imageUrl: "",
    affectedCount: 21,
    latitude: 12.9600, longitude: 80.2000,
    addressText: "Near Govt. High School, Velachery",
    createdDate: daysAgo(9),
    resolvedDate: daysAgo(1),
  },
  {
    id: 1026,
    title: "Garbage not collected for over a week",
    description: "Municipal garbage truck has skipped this street since last Tuesday.",
    category: "SANITATION",
    priority: "MEDIUM",
    status: "RESOLVED",
    citizenName: "Ravi S.",
    imageUrl: "",
    affectedCount: 15,
    latitude: 12.9550, longitude: 80.1950,
    addressText: "3rd Street, Velachery",
    createdDate: daysAgo(11),
    resolvedDate: daysAgo(3),
  },
  {
    id: 1025,
    title: "Damaged park equipment unsafe for children",
    description: "Swing set at the community park has a broken chain and sharp edges exposed.",
    category: "INFRASTRUCTURE",
    priority: "LOW",
    status: "RECEIVED",
    citizenName: "Deepa V.",
    imageUrl: "",
    affectedCount: 6,
    latitude: 12.9500, longitude: 80.1900,
    addressText: "Community Park, Medavakkam",
    createdDate: daysAgo(1),
  },
  {
    id: 1024,
    title: "Frequent power cuts in industrial estate",
    description: "Unscheduled power cuts happening 2-3 times daily, affecting small businesses.",
    category: "ELECTRICITY",
    priority: "HIGH",
    status: "NEW",
    citizenName: "Ganesh T.",
    imageUrl: "",
    affectedCount: 27,
    latitude: 12.9450, longitude: 80.1850,
    addressText: "Industrial Estate, Guindy Extension",
    createdDate: daysAgo(0.1),
  },
];

export let posts: Post[] = [
  {
    id: 501,
    title: "Road-widening work begins on 100 Feet Road",
    description: "Sanctioned Rs. 2.1 crore project to widen and relay 100 Feet Road starts this week. Expected completion: 45 days.",
    type: "DEVELOPMENT_WORK",
    imageUrl: "",
    createdDate: daysAgo(2),
    likedByUserIds: [3, 8, 21, 45],
    comments: [
      { id: 1, userName: "Priya M.", text: "Finally! This stretch badly needed it.", createdDate: daysAgo(2) },
    ],
  },
  {
    id: 500,
    title: "Public grievance camp — this Saturday, 10am",
    description: "Meet me and ward officers in person at the Velachery Community Hall to raise issues directly.",
    type: "MEETING",
    imageUrl: "",
    createdDate: daysAgo(5),
    likedByUserIds: [1, 2, 5, 9, 14],
    comments: [],
  },
  {
    id: 499,
    title: "New water tanker schedule announced for Pallikaranai",
    description: "Additional tankers deployed to Phase 1-3 following recent supply complaints. Daily 7am and 5pm.",
    type: "ANNOUNCEMENT",
    imageUrl: "",
    createdDate: daysAgo(8),
    likedByUserIds: [4, 6, 11],
    comments: [
      { id: 2, userName: "Suresh K.", text: "Thank you for the quick action.", createdDate: daysAgo(7) },
    ],
  },
];

export const officers: Officer[] = [
  { id: 201, name: "Ward Engineer — PWD" },
  { id: 202, name: "Sanitary Inspector" },
  { id: 203, name: "Electricity Board Liaison" },
  { id: 204, name: "Water Board Liaison" },
];

export const users: AppUser[] = [
  { id: 1, name: "Kavitha R.", mobile: "9840011111", role: "CITIZEN", constituencyName: "Velachery", active: true },
  { id: 2, name: "Suresh K.", mobile: "9840022222", role: "CITIZEN", constituencyName: "Velachery", active: true },
  { id: 3, name: "A. Kumar", mobile: "9840012345", role: "MLA", constituencyName: "Velachery", active: true },
  { id: 4, name: "S. Priya", mobile: "9840054321", role: "MLA", constituencyName: "Mylapore", active: true },
  { id: 5, name: "Ganesh T.", mobile: "9840033333", role: "CITIZEN", constituencyName: "Velachery", active: false },
];

export const unverifiedMlas: UnverifiedMla[] = [
  { id: 9, name: "V. Shankar", constituencyName: "Coimbatore North", districtName: "Coimbatore", phone: "+91 98430 98765" },
];
