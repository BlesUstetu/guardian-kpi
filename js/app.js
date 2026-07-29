/**
 * Guardian KPI
 */

document.addEventListener("DOMContentLoaded", async () => {

    console.log(CONFIG.APP_NAME);

    try {

        const dashboard = await API.dashboard();

        console.log(dashboard);

    } catch (err) {

        console.error(err);

    }

});
