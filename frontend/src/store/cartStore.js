import { create } from 'zustand'
import { getCart, addToCart, updateCart, removeFromCart } from '../api'

const useCartStore = create((set) => ({
  items: [],
  total: 0,
  count: 0,

  fetchCart: async () => {
    const res = await getCart()
    set({ items: res.data.items, total: res.data.total, count: res.data.count })
  },

  addItem: async (product_id, quantity = 1) => {
    await addToCart({ product_id, quantity })
    const res = await getCart()
    set({ items: res.data.items, total: res.data.total, count: res.data.count })
  },

  updateItem: async (product_id, quantity) => {
    await updateCart({ product_id, quantity })
    const res = await getCart()
    set({ items: res.data.items, total: res.data.total, count: res.data.count })
  },

  removeItem: async (product_id) => {
    await removeFromCart({ product_id })
    const res = await getCart()
    set({ items: res.data.items, total: res.data.total, count: res.data.count })
  },

  clearCart: () => set({ items: [], total: 0, count: 0 }),
}))

export default useCartStore
