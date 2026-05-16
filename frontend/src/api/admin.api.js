import api from './axios'

export const adminApi = {
  getStats:    ()     => api.get('/admin/stats'),
  getUsers:    (p)    => api.get('/admin/users', { params: p }),
  toggleUser:  (id)   => api.patch(`/admin/users/${id}/toggle`),
}