/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/app.js
 * ==========================================================
 * Single Page Application Router
 * ==========================================================
 */

let currentPage = "dashboard";

/**
 * Load Halaman
 */
async function loadPage(page) {

    currentPage = page;

    const app = document.getElementById("appContent");

    if (!app) return;

    app.innerHTML = `
        <div class="text-center p-5">
            <div class="spinner-border text-info"></div>
            <p class="mt-3">Loading...</p>
        </div>
    `;

    try {

        const response = await fetch(`pages/${page}.html`);

        if (!response.ok) {

            throw new Error("Halaman tidak ditemukan.");

        }

        const html = await response.text();

        app.innerHTML = html;

        document.getElementById("pageTitle").innerText = pageTitle(page);

        initPage(page);

        activeMenu(page);

    }

    catch (err) {

        app.innerHTML = `
            <div class="alert alert-danger">
                ${err.message}
            </div>
        `;

    }

}

/**
 * Inisialisasi setiap halaman
 */
function initPage(page) {

    switch (page) {

        case "dashboard":

            if (typeof init === "function") {

                init();

            }

            break;

        case "anggota":

            if (typeof initAnggota === "function") {

                initAnggota();

            }

            break;

        case "group":

            if (typeof initGroup === "function") {

                initGroup();

            }

            break;

        case "masterkpi":

            if (typeof initMasterKPI === "function") {

                initMasterKPI();

            }

            break;

        case "penilaian":

            if (typeof loadPenilaian === "function") {

                loadPenilaian();

            }

            break;

    }

}

/**
 * Refresh halaman aktif
 */
function refreshPage() {

    loadPage(currentPage);

}

/**
 * Judul halaman
 */
function pageTitle(page) {

    const title = {

        dashboard: "Dashboard",

        anggota: "Data Anggota",

        group: "Data Group",

        masterkpi: "Master KPI",

        penilaian: "Penilaian",

        laporan: "Laporan",

        setting: "Setting"

    };

    return title[page] || "Guardian KPI";

}

/**
 * Menu aktif
 */
function activeMenu(page) {

    document.querySelectorAll(".menu a").forEach(function(item){

        item.classList.remove("active");

    });

    const menu = document.querySelector(`.menu a[data-page="${page}"]`);

    if(menu){

        menu.classList.add("active");

    }

}

/**
 * Start App
 */
document.addEventListener("DOMContentLoaded", function(){

    loadPage("dashboard");

});
