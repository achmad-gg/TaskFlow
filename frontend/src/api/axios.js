// This is the most critical frontend file.
// The interceptor handles token refresh transparently —
// the user never sees a 401 if their access token expires mid-session.

import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// Track if we're already refreshing to prevent infinite loops
let isRefreshing = false
let failedQueue = []

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve()
  })
  failedQueue = []
}

// Auth endpoints that should NEVER trigger a refresh attempt
// to avoid infinite loops (e.g. /auth/me on page load when not logged in)
const AUTH_SKIP_URLS = ['/auth/refresh', '/auth/login', '/auth/register', '/auth/me']

const isAuthSkipUrl = (url = '') =>
  AUTH_SKIP_URLS.some((skip) => url.includes(skip))

// Response interceptor — handle token expiry globally
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Never attempt refresh for auth endpoints or already-retried requests
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthSkipUrl(originalRequest.url)
    ) {
      if (isRefreshing) {
        // Queue this request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => api(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt token refresh — uses httpOnly refresh token cookie
        await api.post('/auth/refresh')
        processQueue(null)
        return api(originalRequest) // Retry original request
      } catch (refreshError) {
        processQueue(refreshError)
        // Refresh failed — let the router/store handle redirection
        // Do NOT use window.location.href here — it causes infinite reload loops
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api