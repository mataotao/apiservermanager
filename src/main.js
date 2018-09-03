import Vue from 'vue';
import App from './App';
import router from './router';
import axios from 'axios';
import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';    // 默认主题
import '../static/css/theme-green/index.css'; // 浅绿色主题
import "babel-polyfill";

import {delCookie, getCookie, setCookie} from './util/util' //引用刚才我们创建的util.js文件，并使用getCookie方法
// http request 拦截器
axios.interceptors.request.use(
    config => {
        if (getCookie('token')) {  // 判断是否存在token，如果存在的话，则每个http header都加上token
            let t = getCookie('token');
            setCookie('token', t, 20 * 60 * 1000);
            setCookie('username', getCookie('username'), 20 * 60 * 1000);
            setCookie('head_img', getCookie('head_img'), 20 * 60 * 1000);
            setCookie('is_root', getCookie('is_root'), 20 * 60 * 1000);
            config.headers.Authorization = `Bearer ${t}`;
        }
        return config;
    },
    err => {
        return Promise.reject(err);
    });

// http response 拦截器
axios.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        if (error.response) {
            switch (error.response.status) {
                case 401:
                    // 返回 401 清除token信息并跳转到登录页面
                    delCookie('token');
                    delCookie('userInfo');
                    router.replace({
                        path: '/login',
                        query: {redirect: router.currentRoute.fullPath}
                    })
            }
        }
        return Promise.reject(error.response.data)   // 返回接口返回的错误信息
    });


Vue.use(ElementUI, {size: 'small'});
Vue.prototype.$axios = axios;
Vue.prototype.$cookies = {delCookie: delCookie, setCookie: setCookie, getCookie: getCookie};

global.DOMAIN = 'http://www.immt.com/';
//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    if (!getCookie('token') && to.path !== '/login') {
        next('/login');
    } else if (to.path === '/login' && getCookie('token')) {
        next('/dashboard');
    } else {
        // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
        if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
            Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
                confirmButtonText: '确定'
            });
        } else {
            next();
        }
    }
})


new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
