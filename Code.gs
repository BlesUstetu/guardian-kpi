/**
 * ==========================================
 * Guardian KPI Web3
 * Code.gs
 * ==========================================
 */

const ROUTES = {
  dashboard: "pages/dashboard",
  anggota: "pages/anggota",
  group: "pages/group",
  masterkpi: "pages/masterkpi",
  penilaian: "pages/penilaian",
  laporan: "pages/laporan",
  setting: "pages/setting"
};

function doGet(e) {

  const page = (e && e.parameter.page) ? e.parameter.page : "dashboard";

  const template = HtmlService.createTemplateFromFile("index");

  template.page = ROUTES[page] || ROUTES.dashboard;
  template.appName = CONFIG.APP_NAME;
  template.version = CONFIG.VERSION;

  return template
    .evaluate()
    .setTitle(CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function render(page) {
  return HtmlService.createHtmlOutputFromFile(page).getContent();
}
