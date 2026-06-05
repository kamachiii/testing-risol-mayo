import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useCartStore = defineStore('cart', () => {
  const items = ref([])
  const loading = ref(false)

  const totalItems = computed(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0)
  )

  const totalPrice = computed(() =>
    items.value.reduce((sum, item) => sum + item.unit_price * item.quantity, 0)
  )

  // Normalize backend response → frontend format
  function normalizeItem(raw) {
    return {
      id: raw.cart_item_id || raw.id,
      product_id: raw.product_id,
      name: raw.product_name || raw.name,
      unit_price: parseFloat(raw.unit_price || raw.price),
      price: parseFloat(raw.unit_price || raw.price),
      quantity: parseInt(raw.quantity, 10),
      stock: parseInt(raw.stock ?? 99, 10),
      image_url: raw.image_url || 'https://placehold.co/80x80/1e293b/f59e0b?text=🥐',
      subtotal: parseFloat(raw.subtotal)
    }
  }

  // GET cart dari backend
  async function fetchCart() {
    loading.value = true
    try {
      const { data } = await api.get('/cart')
      if (data.status === 'success') {
        items.value = (data.data.items || []).map(normalizeItem)
      }
    } catch (error) {
      console.error('Gagal fetch cart:', error)
    }
    loading.value = false
  }

  // ADD item ke backend
  async function addToCart(productOrId, quantity = 1) {
    try {
      const productId = typeof productOrId === 'object' ? productOrId.id : productOrId
      const productName = typeof productOrId === 'object' ? productOrId.name : null
      const { data } = await api.post('/cart/items', {
        product_id: productId,
        quantity
      })
      if (data.status === 'success') {
        await fetchCart()
        return { success: true, message: productName ? `${productName} ditambahkan ke keranjang!` : 'Ditambahkan ke keranjang!' }
      }
      return { success: false, message: data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal tambah ke keranjang'
      }
    }
  }

  // UPDATE quantity di backend
  async function changeQuantity(cartItemId, quantity) {
    try {
      const { data } = await api.patch(`/cart/items/${cartItemId}`, { quantity })
      if (data.status === 'success') {
        await fetchCart()
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal update quantity'
      }
    }
  }

  // DELETE item dari backend
  async function removeItem(cartItemId) {
    try {
      const { data } = await api.delete(`/cart/items/${cartItemId}`)
      if (data.status === 'success') {
        await fetchCart()
        return { success: true }
      }
      return { success: false, message: data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Gagal hapus item'
      }
    }
  }

  // CLEAR cart (parallel, resilient)
  async function clearCart() {
    const toDelete = [...items.value]
    try {
      await Promise.allSettled(
        toDelete.map(item => api.delete(`/cart/items/${item.id}`))
      )
      items.value = []
    } catch (error) {
      console.error('Gagal clear cart:', error)
    }
  }

  const subtotal = computed(() => totalPrice.value)

  return {
    items,
    loading,
    totalItems,
    totalPrice,
    subtotal,
    fetchCart,
    addToCart,
    changeQuantity,
    removeItem,
    clearCart
  }
})
