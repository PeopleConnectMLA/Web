import axios from "axios";
import { API_URL } from "../config";
import { ComplaintStatus } from "./types";

// Reference used to display session timeout modal
let showAlertModal:
    | ((title: string, message: string, buttons?: any[]) => void)
    | null = null;

export const setAlertModalHandler = (
    handler: (title: string, message: string, buttons?: any[]) => void
) => {
    showAlertModal = handler;
};

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        "ngrok-skip-browser-warning": "true",
    },
});

// ======================
// Request Interceptor
// ======================
instance.interceptors.request.use(
    async (config) => {
        const isAuthRequest =
            config.url?.includes("auth/register") ||
            config.url?.includes("auth/login");

        if (!isAuthRequest) {
            if (config.data instanceof FormData) {
                config.headers["Content-Type"] = "multipart/form-data";
            } else {
                config.headers["Content-Type"] = "application/json";
            }

            const token = sessionStorage.getItem("token");

            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ======================
// Response Interceptor
// ======================
instance.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response) {
            if (
                error.response.status === 403 &&
                error?.response?.data?.exception !== "X exceptiom"
            ) {
                if (showAlertModal) {
                    showAlertModal(
                        "Session Timeout",
                        "Your session has expired. Please log in again.",
                        [
                            {
                                text: "OK",
                                style: "default",
                                onPress: () => {
                                    sessionStorage.removeItem("token");
                                    sessionStorage.removeItem("userId");
                                    sessionStorage.removeItem("role");

                                    // Optional:
                                    // window.location.href = "/login";
                                },
                            },
                        ]
                    );
                }
            }

            console.error("Response Error:", {
                url: error.config?.url,
                status: error.response.status,
                data: error.response.data,
            });

            return Promise.reject({
                status: error.response.status,
                data: error.response.data,
                headers: error.response.headers,
            });
        }

        if (error.request) {
            console.error("No Response Received:", {
                url: error.config?.url,
                request: error.request,
            });

            return Promise.reject({
                message: "No response received from server",
                request: error.request,
            });
        }

        console.error("Axios Error:", error.message);

        return Promise.reject({
            message: error.message,
        });
    }
);

// ======================
// Auth APIs
// ======================

export async function registerAPI(reqData: any) {
    try {
        const response = await instance.post("auth/register", reqData);
        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function loginAPI(reqData: any) {
    try {
        const response = await instance.post("auth/login", reqData);
        const result = response.data;
        if (result) {
            sessionStorage.setItem("token", result.token);
            sessionStorage.setItem("userId", String(result.user.id));
            sessionStorage.setItem("role", result.user.role);
            sessionStorage.setItem("name", result.user.name);
            sessionStorage.setItem("districtId", result.user.districtId);
            sessionStorage.setItem("constituencyId", result.user.constituencyId);
            sessionStorage.setItem("pcm_session", JSON.stringify(result.user));

            if (result.user.wardId) {
                sessionStorage.setItem("wardId", result.user.wardId);
            }

            if (result.user.area) {
                sessionStorage.setItem("area", result.user.area);
            }
        }

        return response;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ======================
// Admin APIs
// ======================

export async function createAdminAPI(reqData: any) {
    try {
        return await instance.post("auth/create-admin", reqData);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

// ======================
// MLA APIs
// ======================

export async function createMlaAPI(reqData: any) {
    try {
        return await instance.post("mla", reqData);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getMlaById(id: number) {
    try {
        return await instance.get(`mla/${id}`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getMlaAnalytics(id: number) {
    try {
        return await instance.get(`mla/${id}/analytics`);
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getMlaByConstituency(constituencyId: string) {
    try {
        return await instance.get(
            `mla/by-constituency/${constituencyId}`
        );
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getAllActiveDistrictsAPI() {
    try {
        let endPoint = `districts/active`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getAllActiveConstituenciesByDistrictIdAPI(districtId: string) {
    try {
        let endPoint = `constituencies/active/district/${districtId}`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getUnverifiedMlas() {
    try {
        let endPoint = `admin/mlas/unverified`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function verifyMla(id: string) {
    try {
        let endPoint = `admin/mlas/${id}/verify`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getUsers() {
    try {
        let endPoint = `admin/users`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function setUserActive(id: string) {
    try {
        let endPoint = `admin/users/${id}/active`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getAllPartyAPI() {
    try {
        let endPoint = `party`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getAnalytics(mlaId: string) {
    try {
        let endPoint = `mla/${mlaId}/analytics`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getComplaints(mlaId: string) {
    try {
        let endPoint = `complaints/mla/${mlaId}`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getMlaProfile(mlaId: string) {
    try {
        let endPoint = `mla/${mlaId}`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

interface StatusUpdatePayload {
    status: ComplaintStatus;
    remarks?: string;
    assignOfficerId?: number | string;
}

export async function updateComplaintStatus(id: number, { status, remarks, assignOfficerId }: StatusUpdatePayload) {
    try {
        let endPoint = `complaints/${id}/status`;
        let response = await instance.patch(endPoint, { status, remarks, assignOfficerId });
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getAllOfficersByConstituencyId(constituencyId: string) {
    try {
        let endPoint = `officers?constituencyId=${constituencyId}`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export async function getPosts(mlaId: string) {
    try {
        let endPoint = `posts/mla/${mlaId}`;
        let response = await instance.get(endPoint);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}

export interface CreatePostPayload {
    title: string;
    description?: string;
    type: string;
    imageUrl?: string;
    videoUrl?: string;
}

export async function createPost(mlaId: string, payload: CreatePostPayload) {
    try {
        let endPoint = `posts/mla/${mlaId}`;
        let response = await instance.post(endPoint, payload);
        return response;
    } catch (e) {
        console.log(e + ' Occured! Please Try again');
    }
}
