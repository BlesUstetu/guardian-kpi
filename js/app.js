/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * APP.JS — UI CONTROLLER
 * ==========================================================
 *
 * Fungsi:
 * - Hamburger menu
 * - Dropdown Dashboard / Settings
 * - Dark / Light mode
 * - Settings PIN Admin
 * - Page loader
 * - Menjalankan initializer halaman
 *
 * TIDAK mengubah:
 * - api.js
 * - dashboard.js
 * - backend Apps Script
 * - data KPI
 * - chart
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
   STORAGE
========================================================== */

const GKP_THEME_KEY =
    "guardianKPI.theme";

const GKP_SETTINGS_SESSION =
    "guardianKPI.settingsUnlocked";


/* ==========================================================
   STATE
========================================================== */

let gkpCurrentPage =
    "dashboard";


/* ==========================================================
   INITIALIZATION
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Guardian KPI UI initialized."
        );


        gkpInitTheme();

        gkpInitMenu();

        gkpInitPin();

        gkpLoadPage(
            "dashboard"
        );

    }
);


/* ==========================================================
   THEME
========================================================== */

function gkpInitTheme() {

    const savedTheme =
        localStorage.getItem(
            GKP_THEME_KEY
        );


    const theme =
        savedTheme === "light"
            ? "light"
            : "dark";


    gkpApplyTheme(
        theme
    );

}


/* ----------------------------------------------------------
   APPLY THEME
---------------------------------------------------------- */

function gkpApplyTheme(
    theme
) {

    const normalized =
        theme === "light"
            ? "light"
            : "dark";


    document.documentElement
        .setAttribute(
            "data-theme",
            normalized
        );


    localStorage.setItem(
        GKP_THEME_KEY,
        normalized
    );


    /*
     * Support beberapa kemungkinan
     * ID icon agar tidak error jika
     * HTML menggunakan salah satu.
     */

    const icon =
        document.getElementById(
            "guardianThemeIcon"
        ) ||
        document.getElementById(
            "themeIcon"
        );


    if (icon) {

        if (
            normalized === "dark"
        ) {

            icon.className =
                "bi bi-sun-fill";

        } else {

            icon.className =
                "bi bi-moon-stars-fill";

        }

    }


    /*
     * Support tombol theme lama
     */

    const button =
        document.getElementById(
            "guardianThemeButton"
        ) ||
        document.getElementById(
            "themeToggle"
        );


    if (button) {

        button.setAttribute(
            "aria-label",
            normalized === "dark"
                ? "Gunakan mode terang"
                : "Gunakan mode gelap"
        );

    }


    console.log(
        "Guardian KPI theme:",
        normalized
    );

}


/* ----------------------------------------------------------
   TOGGLE THEME
---------------------------------------------------------- */

function gkpToggleTheme() {

    const current =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) ||
        "dark";


    const next =
        current === "dark"
            ? "light"
            : "dark";


    gkpApplyTheme(
        next
    );

}


/* ==========================================================
   MENU
========================================================== */

function gkpInitMenu() {

    const button =
        document.getElementById(
            "guardianMenuButton"
        ) ||
        document.getElementById(
            "menuButton"
        );


    const menu =
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    if (!button || !menu) {

        console.warn(
            "Guardian KPI: menu element tidak ditemukan."
        );

        return;

    }


    /*
     * HAMBURGER
     */

    button.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            gkpToggleMenu();

        }
    );


    /*
     * MENU ITEMS
     */

    menu
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        const page =
                            item.dataset.page;


                        gkpCloseMenu();


                        if (
                            page ===
                            "setting"
                        ) {

                            gkpRequestSettings();

                            return;

                        }


                        gkpLoadPage(
                            page
                        );

                    }
                );

            }
        );


    /*
     * CLICK OUTSIDE
     */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !menu.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                gkpCloseMenu();

            }

        }
    );


    /*
     * THEME BUTTON
     */

    const themeButton =
        document.getElementById(
            "guardianThemeButton"
        ) ||
        document.getElementById(
            "themeToggle"
        );


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            function () {

                gkpToggleTheme();

            }
        );

    }

}


/* ==========================================================
   TOGGLE MENU
========================================================== */

function gkpToggleMenu() {

    const menu =
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "guardianMenuButton"
        ) ||
        document.getElementById(
            "menuButton"
        );


    if (!menu) {

        return;

    }


    const isOpen =
        menu.classList.contains(
            "open"
        ) ||
        menu.classList.contains(
            "show"
        );


    if (isOpen) {

        gkpCloseMenu();

    } else {

        gkpOpenMenu();

    }

}


/* ==========================================================
   OPEN MENU
========================================================== */

function gkpOpenMenu() {

    const menu =
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "guardianMenuButton"
        ) ||
        document.getElementById(
            "menuButton"
        );


    if (!menu) {

        return;

    }


    /*
     * Support kedua class.
     */

    menu.classList.add(
        "open"
    );

    menu.classList.add(
        "show"
    );


    if (button) {

        button.classList.add(
            "open"
        );

        button.classList.add(
            "active"
        );


        button.setAttribute(
            "aria-expanded",
            "true"
        );

    }

}


/* ==========================================================
   CLOSE MENU
========================================================== */

function gkpCloseMenu() {

    const menu =
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "guardianMenuButton"
        ) ||
        document.getElementById(
            "menuButton"
        );


    if (menu) {

        menu.classList.remove(
            "open"
        );

        menu.classList.remove(
            "show"
        );

    }


    if (button) {

        button.classList.remove(
            "open"
        );

        button.classList.remove(
            "active"
        );


        button.setAttribute(
            "aria-expanded",
            "false"
        );

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

async function gkpLoadPage(
    page
) {

    if (!page) {

        page =
            "dashboard";

    }


    console.log(
        "Guardian KPI: loading page",
        page
    );


    gkpCurrentPage =
        page;


    const container =
        document.getElementById(
            "guardianPage"
        ) ||
        document.getElementById(
            "pageContainer"
        ) ||
        document.getElementById(
            "mainContent"
        );


    if (!container) {

        console.error(
            "Guardian KPI: page container tidak ditemukan."
        );

        return;

    }


    /*
     * Loading state.
     */

    container.innerHTML = `

        <div class="page-loading">

            <div class="spinner-border"
                 role="status">

                <span class="visually-hidden">
                    Loading...
                </span>

            </div>

        </div>

    `;


    try {

        const response =
            await fetch(
                "pages/" +
                page +
                ".html",
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(

                "Halaman " +
                page +
                ".html tidak ditemukan."

            );

        }


        const html =
            await response.text();


        container.innerHTML =
            html;


        /*
         * Jalankan initializer
         * berdasarkan halaman.
         */

        await gkpRunPageInitializer(
            page
        );


        /*
         * Update active menu.
         */

        gkpSetActiveMenu(
            page
        );


        console.log(
            "Guardian KPI: page loaded",
            page
        );


    }
    catch (err) {

        console.error(
            "Guardian KPI page error:",
            err
        );


        container.innerHTML = `

            <div class="alert alert-danger">

                <strong>
                    Gagal memuat halaman.
                </strong>

                <div class="mt-2">
                    ${gkpEscapeHtml(
                        err.message
                    )}
                </div>

            </div>

        `;

    }

}


/* ==========================================================
   PAGE INITIALIZER
========================================================== */

async function gkpRunPageInitializer(
    page
) {

    try {

        switch (page) {


            case "dashboard":

                if (
                    typeof loadDashboard ===
                    "function"
                ) {

                    await loadDashboard();

                }

                break;


            case "anggota":

                if (
                    typeof loadAnggota ===
                    "function"
                ) {

                    await loadAnggota();

                }

                break;


            case "group":

                if (
                    typeof loadGroup ===
                    "function"
                ) {

                    await loadGroup();

                }

                break;


            case "masterkpi":

                if (
                    typeof loadMasterKPI ===
                    "function"
                ) {

                    await loadMasterKPI();

                }

                break;


            case "penilaian":

                if (
                    typeof loadPenilaian ===
                    "function"
                ) {

                    await loadPenilaian();

                }

                break;


            case "laporan":

                if (
                    typeof loadLaporan ===
                    "function"
                ) {

                    await loadLaporan();

                }

                break;


            case "setting":

                if (
                    typeof loadSetting ===
                    "function"
                ) {

                    await loadSetting();

                }

                break;


            default:

                console.log(
                    "Tidak ada initializer untuk:",
                    page
                );

        }

    }
    catch (err) {

        console.error(
            "Page initializer error:",
            err
        );

    }

}


/* ==========================================================
   ACTIVE MENU
========================================================== */

function gkpSetActiveMenu(
    page
) {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function (item) {

                const itemPage =
                    item.dataset.page;


                item.classList.toggle(

                    "active",

                    itemPage ===
                    page

                );

            }
        );

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function gkpEscapeHtml(
    value
) {

    return String(
        value == null
            ? ""
            : value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   PIN INITIALIZATION
========================================================== */

function gkpInitPin() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        ) ||
        document.getElementById(
            "settingsPinModal"
        );


    if (!modal) {

        console.warn(
            "Guardian KPI: PIN modal tidak ditemukan."
        );

        return;

    }


    /*
     * SUBMIT
     */

    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    if (submit) {

        submit.addEventListener(
            "click",
            function () {

                gkpSubmitPin();

            }
        );

    }


    /*
     * ENTER KEY
     */

    const input =
        document.getElementById(
            "guardianPinInput"
        ) ||
        document.getElementById(
            "settingsPinInput"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    gkpSubmitPin();

                }

            }
        );

    }


    /*
     * CLOSE
     */

    const closeButtons =
        modal.querySelectorAll(
            "[data-close-pin], .pin-modal-close"
        );


    closeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    gkpClosePinModal();

                }
            );

        }
    );

}


/* ==========================================================
   REQUEST SETTINGS
========================================================== */

function gkpRequestSettings() {

    /*
     * Settings selalu membutuhkan
     * PIN Admin.
     *
     * Tidak ada lagi pembuatan PIN
     * melalui localStorage.
     */

    const modal =
        document.getElementById(
            "guardianPinModal"
        ) ||
        document.getElementById(
            "settingsPinModal"
        );


    if (!modal) {

        console.error(
            "Guardian KPI: PIN modal tidak ditemukan."
        );

        return;

    }


    const title =
        modal.querySelector(
            ".pin-modal-title"
        ) ||
        document.getElementById(
            "guardianPinTitle"
        );


    const message =
        modal.querySelector(
            ".pin-modal-message"
        ) ||
        document.getElementById(
            "guardianPinMessage"
        );


    const createGroup =
        document.getElementById(
            "guardianPinCreateGroup"
        ) ||
        document.getElementById(
            "settingsPinCreateGroup"
        );


    const enterGroup =
        document.getElementById(
            "guardianPinEnterGroup"
        ) ||
        document.getElementById(
            "settingsPinEnterGroup"
        );


    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    const input =
        document.getElementById(
            "guardianPinInput"
        ) ||
        document.getElementById(
            "settingsPinInput"
        );


    const error =
        document.getElementById(
            "guardianPinError"
        ) ||
        document.getElementById(
            "settingsPinError"
        );


    if (title) {

        title.textContent =
            "Settings Terkunci";

    }


    if (message) {

        message.textContent =
            "Masukkan PIN Admin untuk membuka Settings.";

    }


    /*
     * Jangan tampilkan pembuatan PIN
     * dari browser.
     */

    if (createGroup) {

        createGroup.classList.add(
            "d-none"
        );

    }


    if (enterGroup) {

        enterGroup.classList.remove(
            "d-none"
        );

    }


    if (submit) {

        submit.textContent =
            "Buka Settings";

    }


    if (error) {

        error.textContent =
            "";

        error.classList.add(
            "d-none"
        );

    }


    if (input) {

        input.value =
            "";

        input.focus();

    }


    gkpOpenPinModal();

}


/* ==========================================================
   OPEN PIN MODAL
========================================================== */

function gkpOpenPinModal() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        ) ||
        document.getElementById(
            "settingsPinModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "d-none"
    );

    modal.classList.add(
        "show"
    );


    modal.style.display =
        "flex";


    document.body.classList.add(
        "pin-modal-open"
    );

}


/* ==========================================================
   CLOSE PIN MODAL
========================================================== */

function gkpClosePinModal() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        ) ||
        document.getElementById(
            "settingsPinModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );

    modal.classList.add(
        "d-none"
    );


    modal.style.display =
        "";


    document.body.classList.remove(
        "pin-modal-open"
    );


    const input =
        document.getElementById(
            "guardianPinInput"
        ) ||
        document.getElementById(
            "settingsPinInput"
        );


    if (input) {

        input.value =
            "";

    }

}


/* ==========================================================
   VALIDATE PIN
========================================================== */

function gkpValidPin(
    pin
) {

    return /^\d{4,12}$/.test(
        String(
            pin || ""
        )
    );

}


/* ==========================================================
   SHOW PIN ERROR
========================================================== */

function gkpShowPinError(
    message
) {

    const error =
        document.getElementById(
            "guardianPinError"
        ) ||
        document.getElementById(
            "settingsPinError"
        );


    if (!error) {

        alert(
            message
        );

        return;

    }


    error.textContent =
        message;


    error.classList.remove(
        "d-none"
    );

}


/* ==========================================================
   SUBMIT ADMIN PIN
========================================================== */

function gkpSubmitPin() {

    const pinInput =
        document.getElementById(
            "guardianPinInput"
        ) ||
        document.getElementById(
            "settingsPinInput"
        );


    const pin =
        pinInput
            ?.value
            .trim();


    if (
        !gkpValidPin(
            pin
        )
    ) {

        gkpShowPinError(
            "Masukkan PIN Admin 4–12 digit."
        );

        return;

    }


    /*
     * Google Apps Script server-side
     * verification.
     */

    if (
        typeof google ===
        "undefined" ||
        !google.script ||
        !google.script.run
    ) {

        gkpShowPinError(
            "Koneksi ke server Admin PIN tidak tersedia."
        );

        return;

    }


    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    if (submit) {

        submit.disabled =
            true;

        submit.dataset.originalText =
            submit.textContent;

        submit.textContent =
            "Memverifikasi...";

    }


    google.script.run

        .withSuccessHandler(
            function (result) {

                if (submit) {

                    submit.disabled =
                        false;

                    submit.textContent =
                        submit.dataset
                            .originalText ||
                        "Buka Settings";

                }


                if (
                    !result ||
                    !result.success
                ) {

                    gkpShowPinError(

                        result?.message ||
                        "PIN Admin salah."

                    );

                    return;

                }


                /*
                 * PIN benar.
                 *
                 * Yang disimpan hanya status
                 * sesi, BUKAN PIN.
                 */

                sessionStorage.setItem(

                    GKP_SETTINGS_SESSION,

                    "1"

                );


                if (pinInput) {

                    pinInput.value =
                        "";

                }


                gkpClosePinModal();


                gkpLoadPage(
                    "setting"
                );

            }
        )

        .withFailureHandler(
            function (err) {

                if (submit) {

                    submit.disabled =
                        false;

                    submit.textContent =
                        submit.dataset
                            .originalText ||
                        "Buka Settings";

                }


                console.error(
                    "verifyAdminPin:",
                    err
                );


                gkpShowPinError(

                    err?.message ||
                    "Gagal memverifikasi PIN Admin."

                );

            }
        )

        .verifyAdminPin(
            pin
        );

}


/* ==========================================================
   LOCK SETTINGS
========================================================== */

function gkpLockSettings() {

    sessionStorage.removeItem(
        GKP_SETTINGS_SESSION
    );


    gkpLoadPage(
        "dashboard"
    );

}


/* ==========================================================
   CHECK SETTINGS SESSION
========================================================== */

function gkpIsSettingsUnlocked() {

    return (
        sessionStorage.getItem(
            GKP_SETTINGS_SESSION
        ) === "1"
    );

}


/* ==========================================================
   CHANGE ADMIN PIN
========================================================== */

function guardianChangeAdminPin() {

    const oldPin =
        window.prompt(
            "Masukkan PIN Admin lama:"
        );


    if (
        oldPin === null
    ) {

        return;

    }


    if (
        !gkpValidPin(
            oldPin
        )
    ) {

        alert(
            "PIN lama harus terdiri dari 4–12 digit."
        );

        return;

    }


    const newPin =
        window.prompt(
            "Masukkan PIN Admin baru (4–12 digit):"
        );


    if (
        newPin === null
    ) {

        return;

    }


    if (
        !gkpValidPin(
            newPin
        )
    ) {

        alert(
            "PIN baru harus terdiri dari 4–12 digit."
        );

        return;

    }


    const confirmPin =
        window.prompt(
            "Konfirmasi PIN Admin baru:"
        );


    if (
        confirmPin === null
    ) {

        return;

    }


    if (
        newPin !==
        confirmPin
    ) {

        alert(
            "Konfirmasi PIN baru tidak sama."
        );

        return;

    }


    if (
        typeof google ===
        "undefined" ||
        !google.script ||
        !google.script.run
    ) {

        alert(
            "Koneksi ke server Admin PIN tidak tersedia."
        );

        return;

    }


    google.script.run

        .withSuccessHandler(
            function (result) {

                if (
                    result &&
                    result.success
                ) {

                    sessionStorage.removeItem(
                        GKP_SETTINGS_SESSION
                    );


                    alert(
                        result.message ||
                        "PIN Admin berhasil diubah."
                    );


                    gkpLoadPage(
                        "dashboard"
                    );


                    return;

                }


                alert(

                    result?.message ||
                    "Gagal mengubah PIN Admin."

                );

            }
        )

        .withFailureHandler(
            function (err) {

                console.error(
                    "changeAdminPin:",
                    err
                );


                alert(

                    err?.message ||
                    "Gagal mengubah PIN Admin."

                );

            }
        )

        .changeAdminPin(

            oldPin,

            newPin

        );

}


/* ==========================================================
   GLOBAL EXPORT
========================================================== */

window.gkpLoadPage =
    gkpLoadPage;

window.gkpRequestSettings =
    gkpRequestSettings;

window.gkpSubmitPin =
    gkpSubmitPin;

window.gkpClosePinModal =
    gkpClosePinModal;

window.gkpLockSettings =
    gkpLockSettings;

window.gkpToggleTheme =
    gkpToggleTheme;

window.gkpOpenMenu =
    gkpOpenMenu;

window.gkpCloseMenu =
    gkpCloseMenu;


/* ==========================================================
   ACTIVE MENU
========================================================== */

function gkpSetActiveMenu(
    page
) {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function (item) {

                /*
                 * Jangan menganggap semua
                 * data-page sebagai menu.
                 */

                if (
                    item.classList.contains(
                        "guardian-menu-item"
                    ) ||
                    item.classList.contains(
                        "main-menu-item"
                    )
                ) {

                    item.classList.remove(
                        "active"
                    );

                }

            }
        );


    const active =
        document.querySelector(
            `.guardian-menu-item[data-page="${page}"], .main-menu-item[data-page="${page}"]`
        );


    if (active) {

        active.classList.add(
            "active"
        );

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

async function gkpLoadPage(
    page
) {

    /*
     * SETTINGS HARUS PIN
     */

    if (
        page === "setting" &&
        !gkpSettingsUnlocked()
    ) {

        gkpRequestSettings();

        return;

    }


    gkpCurrentPage =
        page;


    const container =
        document.getElementById(
            "appContent"
        );


    if (!container) {

        console.error(
            "Guardian KPI: #appContent tidak ditemukan."
        );

        return;

    }


    /*
     * LOADING
     */

    container.innerHTML = `

        <div class="guardian-loading">

            <div class="guardian-spinner"></div>

        </div>

    `;


    try {

        /*
         * Halaman HTML
         */

        const response =
            await fetch(
                "pages/" +
                page +
                ".html",
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Halaman pages/" +
                page +
                ".html tidak ditemukan."
            );

        }


        const html =
            await response.text();


        container.innerHTML =
            html;


        /*
         * ACTIVE MENU
         */

        gkpSetActiveMenu(
            page
        );


        /*
         * INITIALIZER
         */

        gkpInitializePage(
            page
        );


        /*
         * SCROLL TOP
         */

        window.scrollTo(
            {
                top: 0,
                behavior: "smooth"
            }
        );


        console.log(
            "Guardian KPI page loaded:",
            page
        );

    }


    catch (error) {

        console.error(
            "Guardian KPI page error:",
            error
        );


        container.innerHTML = `

            <div style="
                max-width:650px;
                margin:50px auto;
                padding:20px;
                border:1px solid rgba(255,80,100,.25);
                border-radius:12px;
                background:rgba(255,80,100,.07);
                color:#ff6478;
            ">

                <div style="
                    font-weight:700;
                    margin-bottom:7px;
                ">

                    <i class="bi bi-exclamation-triangle"></i>

                    Halaman gagal dimuat

                </div>


                <div style="
                    color:#8995a5;
                    font-size:13px;
                ">

                    ${gkpEscape(
                        error.message
                    )}

                </div>

            </div>

        `;

    }

}


/* ==========================================================
   PAGE INITIALIZER
========================================================== */

function gkpInitializePage(
    page
) {

    /*
     * DASHBOARD
     *
     * Jangan membuat ulang API.
     */

    if (
        page ===
        "dashboard"
    ) {

        if (
            typeof loadDashboard ===
            "function"
        ) {

            loadDashboard();

        }

        return;

    }


    /*
     * ANGGOTA
     */

    if (
        page ===
        "anggota"
    ) {

        if (
            typeof loadAnggota ===
            "function"
        ) {

            loadAnggota();

        }

        return;

    }


    /*
     * GROUP
     */

    if (
        page ===
        "group"
    ) {

        if (
            typeof loadGroup ===
            "function"
        ) {

            loadGroup();

        }

        return;

    }


    /*
     * MASTER KPI
     */

    if (
        page ===
        "masterkpi"
    ) {

        if (
            typeof loadMasterKPI ===
            "function"
        ) {

            loadMasterKPI();

        }

        return;

    }


    /*
     * PENILAIAN
     *
     * Modul Penilaian tidak diubah.
     */

    if (
        page ===
        "penilaian"
    ) {

        if (
            typeof loadPenilaian ===
            "function"
        ) {

            loadPenilaian();

        }

        return;

    }


    /*
     * LAPORAN
     */

    if (
        page ===
        "laporan"
    ) {

        if (
            typeof loadLaporan ===
            "function"
        ) {

            loadLaporan();

        }

        return;

    }


    /*
     * SETTINGS
     */

    if (
        page ===
        "setting"
    ) {

        if (
            typeof loadSetting ===
            "function"
        ) {

            loadSetting();

        }

        return;

    }

}


/* ==========================================================
   HTML ESCAPE
========================================================== */

function gkpEscape(
    value
) {

    return String(
        value == null
            ? ""
            : value
    )

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* ==========================================================
   PIN INIT
========================================================== */

function gkpInitPin() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        );


    if (!modal) {

        console.warn(
            "Guardian KPI: guardianPinModal tidak ditemukan."
        );

        return;

    }


    /*
     * Submit button
     */

    const submit =
        document.getElementById(
            "guardianPinSubmit"
        );


    if (submit) {

        submit.addEventListener(
            "click",
            function () {

                gkpSubmitPin();

            }
        );

    }


    /*
     * Enter key
     */

    const input =
        document.getElementById(
            "guardianPinInput"
        );


    if (input) {

        input.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    gkpSubmitPin();

                }

            }
        );

    }


    /*
     * Close button
     */

    const close =
        document.getElementById(
            "guardianPinClose"
        );


    if (close) {

        close.addEventListener(
            "click",
            function () {

                gkpClosePinModal();

            }
        );

    }

}


/* ==========================================================
   SETTINGS SESSION
========================================================== */

function gkpSettingsUnlocked() {

    return (
        sessionStorage.getItem(
            GKP_SETTINGS_SESSION
        ) ===
        "1"
    );

}


/* ==========================================================
   REQUEST SETTINGS
========================================================== */

function gkpRequestSettings() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        );


    if (!modal) {

        console.error(
            "Guardian KPI: modal PIN tidak ditemukan."
        );

        return;

    }


    const title =
        document.getElementById(
            "guardianPinTitle"
        );


    const message =
        document.getElementById(
            "guardianPinMessage"
        );


    const input =
        document.getElementById(
            "guardianPinInput"
        );


    const error =
        document.getElementById(
            "guardianPinError"
        );


    const submit =
        document.getElementById(
            "guardianPinSubmit"
        );


    /*
     * Tidak ada lagi:
     *
     * localStorage.getItem()
     * localStorage.setItem()
     * create PIN
     *
     * PIN selalu berasal dari Admin PIN
     * yang diverifikasi server.
     */

    if (title) {

        title.textContent =
            "PIN Admin";

    }


    if (message) {

        message.textContent =
            "Masukkan PIN Admin untuk membuka Settings.";

    }


    if (input) {

        input.value =
            "";

    }


    if (error) {

        error.textContent =
            "";

        error.classList.add(
            "d-none"
        );

    }


    if (submit) {

        submit.disabled =
            false;

        submit.textContent =
            "Buka Settings";

    }


    gkpOpenPinModal();


    setTimeout(
        function () {

            if (input) {

                input.focus();

            }

        },
        100
    );

}


/* ==========================================================
   OPEN PIN MODAL
========================================================== */

function gkpOpenPinModal() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "d-none"
    );


    modal.classList.add(
        "show"
    );


    modal.style.display =
        "flex";


    document.body.classList.add(
        "pin-modal-open"
    );

}


/* ==========================================================
   CLOSE PIN MODAL
========================================================== */

function gkpClosePinModal() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        );


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "show"
    );


    modal.classList.add(
        "d-none"
    );


    modal.style.display =
        ""

       ;


    document.body.classList.remove(
        "pin-modal-open"
    );


    const input =
        document.getElementById(
            "guardianPinInput"
        );


    if (input) {

        input.value =
            "";

    }


    const error =
        document.getElementById(
            "guardianPinError"
        );


    if (error) {

        error.textContent =
            "";

        error.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
   VALIDATE ADMIN PIN FORMAT
========================================================== */

function gkpValidPin(
    pin
) {

    return /^\d{4,12}$/.test(
        String(
            pin || ""
        )
    );

}


/* ==========================================================
   SHOW PIN ERROR
========================================================== */

function gkpShowPinError(
    message
) {

    const error =
        document.getElementById(
            "guardianPinError"
        );


    if (!error) {

        alert(
            message
        );

        return;

    }


    error.textContent =
        message;


    error.classList.remove(
        "d-none"
    );

}


/* ==========================================================
   SUBMIT ADMIN PIN
========================================================== */

function gkpSubmitPin() {

    const input =
        document.getElementById(
            "guardianPinInput"
        );


    const pin =
        input
            ? input.value.trim()
            : "";


    /*
     * Validasi format lokal.
     *
     * Ini BUKAN verifikasi keamanan.
     * Verifikasi sebenarnya dilakukan
     * oleh AdminPin.gs.
     */

    if (
        !gkpValidPin(
            pin
        )
    ) {

        gkpShowPinError(
            "PIN Admin harus terdiri dari 4–12 digit."
        );

        return;

    }


    /*
     * Pastikan Apps Script tersedia.
     */

    if (
        typeof google ===
            "undefined" ||

        !google.script ||

        !google.script.run
    ) {

        gkpShowPinError(
            "Koneksi ke server Admin PIN tidak tersedia."
        );

        return;

    }


    const submit =
        document.getElementById(
            "guardianPinSubmit"
        );


    if (submit) {

        submit.disabled =
            true;


        submit.dataset.originalText =
            submit.textContent;


        submit.textContent =
            "Memverifikasi...";

    }


    /*
     * SERVER-SIDE VERIFICATION
     *
     * PIN tidak disimpan di browser.
     */

    google.script.run

        .withSuccessHandler(
            function (result) {

                if (submit) {

                    submit.disabled =
                        false;


                    submit.textContent =
                        submit.dataset
                            .originalText ||
                        "Buka Settings";

                }


                if (
                    !result ||
                    !result.success
                ) {

                    gkpShowPinError(

                        result?.message ||
                        "PIN Admin salah."

                    );

                    return;

                }


                /*
                 * PIN BENAR
                 *
                 * Yang disimpan hanya status
                 * sesi sementara.
                 *
                 * PIN TIDAK disimpan.
                 */

                sessionStorage.setItem(

                    GKP_SETTINGS_SESSION,

                    "1"

                );


                if (input) {

                    input.value =
                        "";

                }


                gkpClosePinModal();


                /*
                 * Buka Settings.
                 */

                gkpLoadPage(
                    "setting"
                );

            }
        )


        .withFailureHandler(
            function (error) {

                if (submit) {

                    submit.disabled =
                        false;


                    submit.textContent =
                        submit.dataset
                            .originalText ||
                        "Buka Settings";

                }


                console.error(
                    "Guardian KPI verifyAdminPin:",
                    error
                );


                gkpShowPinError(

                    error?.message ||
                    "Gagal memverifikasi PIN Admin."

                );

            }
        )


        .verifyAdminPin(
            pin
        );

}


/* ==========================================================
   LOCK SETTINGS
========================================================== */

function gkpLockSettings() {

    /*
     * Hapus status sesi.
     *
     * PIN tetap tersimpan di server.
     */

    sessionStorage.removeItem(
        GKP_SETTINGS_SESSION
    );


    /*
     * Kembali ke Dashboard.
     */

    gkpLoadPage(
        "dashboard"
    );

}


/* ==========================================================
   CHANGE ADMIN PIN
========================================================== */

function guardianChangeAdminPin() {

    /*
     * PIN LAMA
     */

    const oldPin =
        window.prompt(
            "Masukkan PIN Admin lama:"
        );


    if (
        oldPin ===
        null
    ) {

        return;

    }


    if (
        !gkpValidPin(
            oldPin
        )
    ) {

        alert(
            "PIN lama harus terdiri dari 4–12 digit."
        );

        return;

    }


    /*
     * PIN BARU
     */

    const newPin =
        window.prompt(
            "Masukkan PIN Admin baru (4–12 digit):"
        );


    if (
        newPin ===
        null
    ) {

        return;

    }


    if (
        !gkpValidPin(
            newPin
        )
    ) {

        alert(
            "PIN baru harus terdiri dari 4–12 digit."
        );

        return;

    }


    /*
     * KONFIRMASI
     */

    const confirmPin =
        window.prompt(
            "Konfirmasi PIN Admin baru:"
        );


    if (
        confirmPin ===
        null
    ) {

        return;

    }


    if (
        newPin !==
        confirmPin
    ) {

        alert(
            "Konfirmasi PIN baru tidak sama."
        );

        return;

    }


    /*
     * SERVER APPS SCRIPT
     */

    if (
        typeof google ===
            "undefined" ||

        !google.script ||

        !google.script.run
    ) {

        alert(
            "Koneksi ke server Admin PIN tidak tersedia."
        );

        return;

    }


    google.script.run

        .withSuccessHandler(
            function (result) {

                if (
                    !result ||
                    !result.success
                ) {

                    alert(

                        result?.message ||
                        "Gagal mengubah PIN Admin."

                    );

                    return;

                }


                /*
                 * PIN berhasil diubah.
                 *
                 * Sesi lama kita hapus.
                 */

                sessionStorage.removeItem(
                    GKP_SETTINGS_SESSION
                );


                alert(

                    result.message ||
                    "PIN Admin berhasil diubah."

                );


                gkpLoadPage(
                    "dashboard"
                );

            }
        )


        .withFailureHandler(
            function (error) {

                console.error(
                    "Guardian KPI changeAdminPin:",
                    error
                );


                alert(

                    error?.message ||
                    "Gagal mengubah PIN Admin."

                );

            }
        )


        .changeAdminPin(

            oldPin,

            newPin

        );

}


/* ==========================================================
   THEME
========================================================== */

function gkpToggleTheme() {

    const current =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) ||
        "dark";


    const next =
        current === "dark"
            ? "light"
            : "dark";


    document.documentElement
        .setAttribute(
            "data-theme",
            next
        );


    localStorage.setItem(
        GKP_THEME_KEY,
        next
    );


    /*
     * Icon
     */

    const icon =
        document.getElementById(
            "themeIcon"
        ) ||
        document.getElementById(
            "guardianThemeIcon"
        );


    if (icon) {

        icon.className =
            next === "dark"

                ? "bi bi-sun-fill"

                : "bi bi-moon-stars-fill";

    }

}


/* ==========================================================
   MENU
========================================================== */

function gkpToggleMenu() {

    const menu =
        document.getElementById(
            "sidebar"
        ) ||
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    if (!menu) {

        return;

    }


    menu.classList.toggle(
        "show"
    );


    menu.classList.toggle(
        "open"
    );

}


/* ==========================================================
   CLOSE MENU
========================================================== */

function gkpCloseMenu() {

    const menu =
        document.getElementById(
            "sidebar"
        ) ||
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    if (!menu) {

        return;

    }


    menu.classList.remove(
        "show"
    );


    menu.classList.remove(
        "open"
    );

}


/* ==========================================================
   OPEN MENU
========================================================== */

function gkpOpenMenu() {

    const menu =
        document.getElementById(
            "sidebar"
        ) ||
        document.getElementById(
            "guardianMenu"
        ) ||
        document.getElementById(
            "mainMenu"
        );


    if (!menu) {

        return;

    }


    menu.classList.add(
        "show"
    );


    menu.classList.add(
        "open"
    );

}


/* ==========================================================
   GLOBAL COMPATIBILITY
========================================================== */

window.gkpSubmitPin =
    gkpSubmitPin;


window.gkpRequestSettings =
    gkpRequestSettings;


window.gkpClosePinModal =
    gkpClosePinModal;


window.gkpLockSettings =
    gkpLockSettings;


window.gkpToggleTheme =
    gkpToggleTheme;


window.gkpToggleMenu =
    gkpToggleMenu;


window.gkpOpenMenu =
    gkpOpenMenu;


window.gkpCloseMenu =
    gkpCloseMenu;


window.guardianChangeAdminPin =
    guardianChangeAdminPin;


window.guardianChangeAdminPin =
    guardianChangeAdminPin;


/* ==========================================================
   INITIAL THEME
========================================================== */

function gkpInitTheme() {

    const savedTheme =
        localStorage.getItem(
            GKP_THEME_KEY
        );


    const theme =
        savedTheme === "light"
            ? "light"
            : "dark";


    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );


    /*
     * Update icon.
     */

    const icon =
        document.getElementById(
            "themeIcon"
        ) ||
        document.getElementById(
            "guardianThemeIcon"
        );


    if (icon) {

        icon.className =
            theme === "dark"

                ? "bi bi-sun-fill"

                : "bi bi-moon-stars-fill";

    }

}


/* ==========================================================
   INITIAL MENU
========================================================== */

function gkpInitMenu() {

    /*
     * Tombol hamburger.
     */

    const menuButton =
        document.getElementById(
            "menuButton"
        ) ||
        document.getElementById(
            "guardianMenuButton"
        );


    if (menuButton) {

        menuButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                gkpToggleMenu();

            }
        );

    }


    /*
     * Theme button.
     */

    const themeButton =
        document.getElementById(
            "themeToggle"
        ) ||
        document.getElementById(
            "guardianThemeButton"
        );


    if (themeButton) {

        themeButton.addEventListener(
            "click",
            function () {

                gkpToggleTheme();

            }
        );

    }


    /*
     * Menu items.
     */

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        const page =
                            item.dataset.page;


                        /*
                         * Settings harus
                         * melalui PIN Admin.
                         */

                        if (
                            page ===
                            "setting"
                        ) {

                            gkpCloseMenu();

                            gkpRequestSettings();

                            return;

                        }


                        gkpCloseMenu();


                        gkpLoadPage(
                            page
                        );

                    }
                );

            }
        );


    /*
     * Click outside.
     */

    document.addEventListener(
        "click",
        function (event) {

            const menu =
                document.getElementById(
                    "sidebar"
                ) ||
                document.getElementById(
                    "guardianMenu"
                ) ||
                document.getElementById(
                    "mainMenu"
                );


            const button =
                document.getElementById(
                    "menuButton"
                ) ||
                document.getElementById(
                    "guardianMenuButton"
                );


            if (
                menu &&
                button &&
                !menu.contains(
                    event.target
                ) &&
                !button.contains(
                    event.target
                )
            ) {

                gkpCloseMenu();

            }

        }
    );

}


/* ==========================================================
   INITIAL APPLICATION
========================================================== */

function gkpInitializeApplication() {

    console.log(
        "========================================"
    );

    console.log(
        "Guardian KPI Web3"
    );

    console.log(
        "UI Controller initialized."
    );

    console.log(
        "Admin PIN: SERVER-SIDE"
    );

    console.log(
        "========================================"
    );


    gkpInitTheme();

    gkpInitMenu();

    gkpInitPin();


    /*
     * Dashboard sebagai halaman awal.
     */

    gkpLoadPage(
        "dashboard"
    );

}


/* ==========================================================
   DOM READY
========================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            gkpInitializeApplication();

        }
    );

} else {

    gkpInitializeApplication();

}


/* ==========================================================
   FINAL GLOBAL EXPORT
========================================================== */

window.gkpInitializeApplication =
    gkpInitializeApplication;


window.gkpInitializePage =
    gkpInitializePage;


window.gkpSettingsUnlocked =
    gkpSettingsUnlocked;


window.gkpValidPin =
    gkpValidPin;


window.gkpShowPinError =
    gkpShowPinError;


window.gkpEscape =
    gkpEscape;


window.gkpSetActiveMenu =
    gkpSetActiveMenu;


/* ==========================================================
   GUARDIAN COMPATIBILITY ALIAS
========================================================== */

window.guardianLoadPage =
    gkpLoadPage;


window.guardianRequestSettings =
    gkpRequestSettings;


window.guardianSubmitPin =
    gkpSubmitPin;


window.guardianClosePinModal =
    gkpClosePinModal;


window.guardianLockSettings =
    gkpLockSettings;


window.guardianToggleTheme =
    gkpToggleTheme;


window.guardianChangeAdminPin =
    guardianChangeAdminPin;


/* ==========================================================
   END APP.JS
========================================================== */
