import api from './request'

export function getAnnouncements() {
  return api.get('/announcements')
}
