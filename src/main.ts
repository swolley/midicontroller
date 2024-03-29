import { createApp } from "vue";
import App from "./App.vue";
import "./index.css";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { useRack } from "./stores/useRack";

const app = createApp(App);
const store = createPinia();
store.use(piniaPluginPersistedstate);
app.use(store);

useRack()
    .init()
    .then(() => {
        app.mount("#app");
    });
