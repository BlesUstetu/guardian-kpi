/**
 * ==========================================
 * Guardian KPI Web3
 * Code.gs
 * ==========================================
 */

function doGet(e) {

  const page = (e && e.parameter.page)
    ? e.parameter.page
    : "dashboard";

  const template = HtmlService.createTemplateFromFile("index");

  template.page = page;
  template.appName = CONFIG.APP_NAME;
  template.version = CONFIG.VERSION;

  return template
    .evaluate()
    .setTitle(CONFIG.APP_NAME)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag("viewport", "width=device-width, initial-scale=1");

}

/**
 * include html
 */
function include(filename) {
  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}

/**
 * render page
 */
function render(page) {
  return HtmlService
    .createHtmlOutputFromFile("pages/" + page)
    .getContent();
}
