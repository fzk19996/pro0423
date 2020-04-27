import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
    state: {
        loading: false,
        userInfo: {
            'userId': 1,
            'projectId': 1,
            'projectName': '',
            'nickName': '',
            'bindStatus': 0,
            'appName': null,
            'qrCodeUrl': null
        },
        md5salt: '20b5be73046731502978270c15c43570'
    },
    mutations: {
        lock(state) {
            state.loading = true;
        },
        unlock(state) {
            state.loading = false;
        },
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo;
        },
        clearUserInfo(state) {
            state.userInfo = {};
        }

    },
    modules: {}
});

export default store;
