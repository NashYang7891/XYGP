import { defineStore } from 'pinia'
import { login, register, getMe } from '../api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user') || 'null'),
  }),
  getters: {
    isLoggedIn: (s) => !!s.token,
  },
  actions: {
    async doLogin(data) {
      const res = await login(data)
      if (res.code === 0) {
        this.token = res.data.token
        this.user = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return true
      }
      throw new Error(res.msg || '登录失败')
    },
    async doRegister(data) {
      const res = await register(data)
      if (res.code === 0) {
        this.token = res.data.token
        this.user = res.data.user
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        return true
      }
      throw new Error(res.msg || '注册失败')
    },
    async fetchMe() {
      const res = await getMe()
      if (res.code === 0) {
        this.user = res.data
        localStorage.setItem('user', JSON.stringify(res.data))
      }
    },
    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})
