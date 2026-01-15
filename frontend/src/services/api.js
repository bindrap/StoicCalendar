import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const authService = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me')
};

const eventService = {
  getEvents: (startDate, endDate, calendarIds) => {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (calendarIds && calendarIds.length > 0) {
      params.calendarIds = calendarIds.join(',');
    }
    return api.get('/events', { params });
  },
  getEvent: (id) => api.get(`/events/${id}`),
  createEvent: (data) => api.post('/events', data),
  updateEvent: (id, data) => api.put(`/events/${id}`, data),
  deleteEvent: (id) => api.delete(`/events/${id}`),
  // Recurring event operations
  updateRecurringSeries: (id, data) => api.put(`/events/${id}/series`, data),
  createException: (id, data) => api.post(`/events/${id}/exception`, data),
  deleteInstance: (id, originalStartTime) => api.delete(`/events/${id}/instance`, { data: { originalStartTime } }),
  deleteSeries: (id) => api.delete(`/events/${id}/series`)
};

const quoteService = {
  getDailyQuote: () => api.get('/quotes/daily'),
  getRandomQuote: () => api.get('/quotes/random')
};

const userService = {
  updatePreferences: (data) => api.put('/users/preferences', data),
  updateProfile: (data) => api.put('/users/profile', data)
};

const contactService = {
  getContacts: () => api.get('/contacts'),
  createContact: (data) => api.post('/contacts', data),
  updateContact: (id, data) => api.put(`/contacts/${id}`, data),
  deleteContact: (id) => api.delete(`/contacts/${id}`)
};

const calendarService = {
  getCalendars: () => api.get('/calendars'),
  getCalendar: (id) => api.get(`/calendars/${id}`),
  createCalendar: (data) => api.post('/calendars', data),
  updateCalendar: (id, data) => api.put(`/calendars/${id}`, data),
  deleteCalendar: (id) => api.delete(`/calendars/${id}`),
  shareCalendar: (id, data) => api.post(`/calendars/${id}/share`, data),
  unshareCalendar: (id, userId) => api.delete(`/calendars/${id}/share/${userId}`),
  getCalendarEvents: (id) => api.get(`/calendars/${id}/events`)
};

export { authService, eventService, quoteService, userService, contactService, calendarService };
export default api;
