import main from './pages/main';
import header from './modules/header/';
import setPageHeight from './modules/setPageHeight';

const global = () => {
  setPageHeight();
  header();
};

const router = {
  pages: {
    main: main,
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
