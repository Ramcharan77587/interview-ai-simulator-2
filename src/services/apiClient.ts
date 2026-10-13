async function request<T>(endpoint: string, options: RequestInit = {}): Promise<{ data: T }> {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string>),
  };

  if (isFormData) {
    // Let the browser set the multipart/form-data boundary header automatically
    delete headers["Content-Type"];
    delete headers["content-type"];
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`/api${endpoint}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && !endpoint.includes("/auth/login") && !endpoint.includes("/auth/register")) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/onboarding") {
        window.location.href = "/login";
      }
    }
    const error: any = new Error(data?.message || res.statusText);
    error.response = { status: res.status, data };
    throw error;
  }

  return { data };
}

export const apiClient = {
  get: <T>(url: string, init?: RequestInit) => request<T>(url, { method: "GET", ...init }),
  post: <T>(url: string, body?: any, init?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(url, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
      ...init,
    });
  },
  put: <T>(url: string, body?: any, init?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(url, {
      method: "PUT",
      body: isFormData ? body : JSON.stringify(body),
      ...init,
    });
  },
  patch: <T>(url: string, body?: any, init?: RequestInit) => {
    const isFormData = body instanceof FormData;
    return request<T>(url, {
      method: "PATCH",
      body: isFormData ? body : JSON.stringify(body),
      ...init,
    });
  },
  delete: <T>(url: string, init?: RequestInit) => request<T>(url, { method: "DELETE", ...init }),
};

export default apiClient;
