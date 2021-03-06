import Vue from 'vue';
import element from 'element-ui';
import VueRouter from 'vue-router';

import validate from 'vue-validator-help';
import selecter from 'com/selecter/selecter.vue';
import checkbox from 'com/checkbox/checkbox.vue';
import button from 'com/button/button.vue';
import Service from 'serv';

import routes from './router/config';
import store from './store';
import interceptor from './router/interceptor';
import md5 from 'lib/md5.js';
import VueVideoPlayer from 'vue-video-player';
import 'video.js/dist/video-js.css';

require('./style/index.scss');

const Alert = require('com/alert/index');
const Confirm = require('com/confirm/index');

const app = require('./app.vue');

const router = new VueRouter({
    mode: 'hash',
    routes
});

// vue
Vue.config.devtools = true;
Vue.use(element);
Vue.use(VueRouter);
Vue.use(validate);
Vue.use(VueVideoPlayer);

Vue.prototype.$notifyErr = function(msg) {
    Alert({
        type: 'error',
        message: msg
    });
};
Vue.prototype.$notifyOk = function(msg) {
    Alert({
        type: 'success',
        message: msg
    });
};
Vue.prototype.$alert = Alert;
Vue.prototype.$confirm = Confirm;
Vue.prototype.$serv = Service;
Vue.prototype.$md5 = md5;

Vue.component('selecter', selecter);
Vue.component('checkbox', checkbox);
Vue.component('txt-button', button);

interceptor(router);

new Vue({
    el: '#app',
    router,
    store,
    render(fn) {
        return fn(app);
    }
});

// hide loading
window.document.getElementById('loading').style.display = 'none';
