import client from './client'

// Auth
export const login = (data) => client.post('/auth/login/', data)
export const register = (data) => client.post('/auth/register/', data)
export const logout = (data) => client.post('/auth/logout/', data)
export const getMe = () => client.get('/auth/me/')
export const updateMe = (data) => client.patch('/auth/me/', data)

// Products
export const getProducts = (params) => client.get('/products/', { params })
export const getProduct = (id) => client.get(`/products/${id}/`)

// Categories
export const getCategories = () => client.get('/categories/')

// Cart
export const getCart = () => client.get('/cart/')
export const addToCart = (data) => client.post('/cart/', data)
export const updateCart = (data) => client.patch('/cart/', data)
export const removeFromCart = (data) => client.delete('/cart/', { data })

// Orders
export const getOrders = () => client.get('/orders/')
export const getOrder = (id) => client.get(`/orders/${id}/`)
export const checkout = (data) => client.post('/checkout/', data)

// Wishlist
export const getWishlist = () => client.get('/wishlist/')
export const addToWishlist = (data) => client.post('/wishlist/', data)
export const removeFromWishlist = (data) => client.delete('/wishlist/', { data })

// Addresses
export const getAddresses = () => client.get('/addresses/')
export const addAddress = (data) => client.post('/addresses/', data)
export const updateAddress = (id, data) => client.put(`/addresses/${id}/`, data)
export const deleteAddress = (id) => client.delete(`/addresses/${id}/`)

// Misc
export const getSettings = () => client.get('/settings/')
export const sendContact = (data) => client.post('/contact/', data)
