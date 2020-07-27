import main from './pages/main';
import blog from './pages/blog';
import download from './pages/download';
import header from './modules/header/';
import setPageHeight from './modules/setPageHeight';

if ('serviceWorker' in navigator) {
  window.addEventListener('load',() => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker: Registered'))
      .catch(err => console.log('Service Worker Error'))
  })
}

const global = () => {
  setPageHeight();
  header();

};
const router = {
  pages: {
    main: main,
    download: download,
    blog: blog,
  },
  global: global,
};

const getRoute = () => {
  const documentClassNames = document.documentElement.className;
  const routePattern = /(js-route-)\S+/gm;
  const routeExact = documentClassNames.match(routePattern);
  return routeExact ? routeExact[0].replace('js-route-', '') : null;
};

const route = getRoute();

router.global();

if (route) {
  router.pages[route]();
}
