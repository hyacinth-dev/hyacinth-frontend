import { createApp } from 'vue';
import { create } from 'naive-ui';
import router from './router';
import App from './App.vue';
import 'vfonts/Lato.css';
import 'vfonts/FiraCode.css';

const naive = create();
const app = createApp(App);

app.use(naive);
app.use(router);
app.mount('#app');
