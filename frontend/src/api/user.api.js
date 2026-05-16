import api from './axios'

export const userApi = {
  getProfile:     ()     => api.get('/users/profile'),
  updateProfile:  (data) => api.patch('/users/profile', data),
  changePassword: (data) => api.patch('/users/password', data),
  getActivity:    ()     => api.get('/users/activity'),
}