import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import VueAxios from 'vue-axios'
import './assets/tailwind.css'

// styles
import '@fortawesome/fontawesome-free/css/all.min.css'

// components
import Footer from '@/components/Footer.vue'

const app = createApp(App)
app.component('Footer', Footer)
app.use(VueAxios, axios).use(router)
app.mount('#app')
