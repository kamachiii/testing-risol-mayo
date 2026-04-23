import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '@/pages/HomePage.vue'
import CartPage from '@/pages/CartPage.vue'
import LoginPage from '@/pages/LoginPage.vue'
import RegisterPage from '@/pages/RegisterPage.vue'
import CheckoutPage from '@/pages/CheckoutPage.vue'
import OrderHistoryPage from '@/pages/OrderHistoryPage.vue'
import AdminDashboardPage from '@/pages/AdminDashboardPage.vue'
import AdminProductsPage from '@/pages/AdminProductsPage.vue'
import AdminUsersPage from '@/pages/AdminUsersPage.vue'
import AdminCategoriesPage from '@/pages/AdminCategoriesPage.vue'
import ProductDetailPage from '@/pages/ProductDetailPage.vue'
import NotFoundPage from '@/pages/NotFoundPage.vue'
import InfoPage from '@/pages/InfoPage.vue'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: CheckoutPage,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { hideLayout: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { hideLayout: true },
  },
  {
    path: '/orders',
        name: 'orders',
        component: OrderHistoryPage,
        meta: { requiresAuth: true, noTransition: true },
  },
  {
    path: '/admin',
        name: 'admin',
        component: AdminDashboardPage,
        meta: { requiresAuth: true, requiresAdmin: true, noTransition: true },
  },
  {
    path: '/admin/products',
        name: 'admin-products',
        component: AdminProductsPage,
        meta: { requiresAuth: true, requiresAdmin: true, noTransition: true },
  },
  {
    path: '/admin/users',
        name: 'admin-users',
        component: AdminUsersPage,
        meta: { requiresAuth: true, requiresAdmin: true, noTransition: true },
  },
  {
    path: '/admin/categories',
        name: 'admin-categories',
        component: AdminCategoriesPage,
        meta: { requiresAuth: true, requiresAdmin: true, noTransition: true },
  },
  {
    path: '/products/:id',
    name: 'product-detail',
    component: ProductDetailPage,
  },
  {
    path: '/info/:slug',
    name: 'info',
    component: InfoPage,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundPage,
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    if (!auth.isLoggedIn) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
    if (to.meta.requiresAdmin && !auth.isAdmin) {
      return { name: 'home' }
    }
  }
})

export default router
