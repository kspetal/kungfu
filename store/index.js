import { reactive } from 'vue'

// 简单的全局状态，用于示例。后续可替换为 Pinia。
const state = reactive({
  students: [],
  statsSummary: null,
  revenueRank: [],
  expiringStudents: []
})

export function useGlobalStore() {
  const setStudents = (list) => {
    state.students = list || []
  }

  const setStatsSummary = (summary) => {
    state.statsSummary = summary
  }

  const setRevenueRank = (list) => {
    state.revenueRank = list || []
  }

  const setExpiringStudents = (list) => {
    state.expiringStudents = list || []
  }

  return {
    state,
    setStudents,
    setStatsSummary,
    setRevenueRank,
    setExpiringStudents
  }
}


