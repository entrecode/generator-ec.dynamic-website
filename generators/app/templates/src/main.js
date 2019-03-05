import Vue from 'vue';

const vueApp = new Vue({
  el: '#app',
  delimiters: ['${', '}'],
  data: {
    message: 'Vue.js initialized',
  },
});

export default vueApp;
