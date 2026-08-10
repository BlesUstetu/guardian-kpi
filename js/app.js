/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/app.js
 * Module : UI Controller
 * Version : 3.2.0 STABLE
 * ==========================================================
 *
 * TANGGUNG JAWAB:
 * - Hamburger menu
 * - Navigasi halaman
 * - Dark / Light theme
 * - Admin PIN Settings
 * - Page loader
 * - Page initializer
 *
 * TIDAK MENGUBAH:
 * - js/api.js
 * - js/dashboard.js
 * - js/anggota.js
 * - js/group.js
 * - js/masterkpi.js
 * - js/penilaian.js
 * - js/laporan.js
 * - Apps Script backend
 * - Database
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * STORAGE
 * ==========================================================
 */

const GKP_THEME_KEY =
    "guardianKPI.theme";


const GKP_SETTINGS_SESSION =
    "guardianKPI.settingsUnlocked";


/* ==========================================================
 * STATE
 * ==========================================================
 */

let gkpCurrentPage =
    "dashboard";


/* ==========================================================
 * INITIAL APPLICATION
 * ==========================================================
 */

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
        "Admin PIN: SERVER-SIDE REST API"
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
 * DOM READY
 * ==========================================================
 */

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

}
else {

    gkpInitializeApplication();

}


/* ==========================================================
 * THEME
 * ==========================================================
 */

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


/* ==========================================================
 * APPLY THEME
 * ==========================================================
 */

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


    const icon =
        document.getElementById(
            "guardianThemeIcon"
        ) ||
        document.getElementById(
            "themeIcon"
        );


    if (icon) {

        icon.className =
            normalized === "dark"

                ? "bi bi-sun-fill"

                : "bi bi-moon-stars-fill";

    }


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


/* ==========================================================
 * TOGGLE THEME
 * ==========================================================
 */

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
 * MENU INITIALIZATION
 * ==========================================================
 */

function gkpInitMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        ) ||
        document.getElementById(
            "guardianMenuButton"
        );


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


    /*
     * HAMBURGER
     */

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
     * THEME
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
     * MENU ITEMS
     */

    if (menu) {

        menu
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(
                function (item) {

                    /*
                     * Hindari memasang
                     * listener dua kali.
                     */

                    if (
                        item.dataset
                            .gkpBound ===
                        "1"
                    ) {

                        return;

                    }


                    item.dataset
                        .gkpBound =
                        "1";


                    item.addEventListener(

                        "click",

                        function () {

                            const page =
                                item.dataset.page;


                            gkpCloseMenu();


                            /*
                             * Settings harus
                             * melalui PIN Admin.
                             */

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

    }


    /*
     * CLICK OUTSIDE
     */

    document.addEventListener(

        "click",

        function (event) {

            const currentMenu =
                document.getElementById(
                    "sidebar"
                ) ||
                document.getElementById(
                    "guardianMenu"
                ) ||
                document.getElementById(
                    "mainMenu"
                );


            const currentButton =
                document.getElementById(
                    "menuButton"
                ) ||
                document.getElementById(
                    "guardianMenuButton"
                );


            if (
                currentMenu &&
                currentButton &&
                !currentMenu.contains(
                    event.target
                ) &&
                !currentButton.contains(
                    event.target
                )
            ) {

                gkpCloseMenu();

            }

        }

    );

}


/* ==========================================================
 * TOGGLE MENU
 * ==========================================================
 */

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


    const isOpen =
        menu.classList.contains(
            "open"
        ) ||
        menu.classList.contains(
            "show"
        );


    if (isOpen) {

        gkpCloseMenu();

    }
    else {

        gkpOpenMenu();

    }

}


/* ==========================================================
 * OPEN MENU
 * ==========================================================
 */

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


    const button =
        document.getElementById(
            "menuButton"
        ) ||
        document.getElementById(
            "guardianMenuButton"
        );


    if (!menu) {

        return;

    }


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
 * CLOSE MENU
 * ==========================================================
 */

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


    const button =
        document.getElementById(
            "menuButton"
        ) ||
        document.getElementById(
            "guardianMenuButton"
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
 * PAGE LOADER
 * ==========================================================
 */

async function gkpLoadPage(
    page
) {

    if (!page) {

        page =
            "dashboard";

    }


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
     * Loading
     */

    container.innerHTML = `

        <div class="guardian-loading">

            <div class="guardian-spinner"></div>

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
         * Active menu.
         */

        gkpSetActiveMenu(
            page
        );


        /*
         * Jalankan initializer.
         */

        await gkpInitializePage(
            page
        );


        /*
         * Scroll ke atas.
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

            <div
                class="alert alert-danger">

                <strong>

                    Halaman gagal dimuat.

                </strong>

                <div class="mt-2">

                    ${gkpEscapeHtml(
                        error.message
                    )}

                </div>

            </div>

        `;

    }

}


/* ==========================================================
 * PAGE INITIALIZER
 * ==========================================================
 */

async function gkpInitializePage(
    page
) {

    try {

        switch (page) {


            /* ==================================================
             * DASHBOARD
             * ==================================================
             */

            case "dashboard":

                if (
                    typeof loadDashboard ===
                    "function"
                ) {

                    await loadDashboard();

                }

                break;


            /* ==================================================
             * ANGGOTA
             * ==================================================
             */

            case "anggota":

                if (
                    typeof loadAnggota ===
                    "function"
                ) {

                    await loadAnggota();

                }

                break;


            /* ==================================================
             * GROUP
             * ==================================================
             */

            case "group":

                if (
                    typeof loadGroup ===
                    "function"
                ) {

                    await loadGroup();

                }

                break;


            /* ==================================================
             * MASTER KPI
             * ==================================================
             */

            case "masterkpi":

                if (
                    typeof loadMasterKPI ===
                    "function"
                ) {

                    await loadMasterKPI();

                }

                break;


            /* ==================================================
             * PENILAIAN
             * ==================================================
             */

            case "penilaian":

                if (
                    typeof loadPenilaian ===
                    "function"
                ) {

                    await loadPenilaian();

                }

                break;


            /* ==================================================
             * LAPORAN
             * ==================================================
             */

            case "laporan":

                console.log(
                    "Guardian KPI: initializing Laporan..."
                );


                if (
                    typeof loadLaporan ===
                    "function"
                ) {

                    await loadLaporan();

                }
                else {

                    console.error(

                        "Guardian KPI: loadLaporan() tidak tersedia."

                    );

                }

                break;


            /* ==================================================
             * SETTINGS
             *
             * Halaman Settings bersifat
             * statis. Tidak memerlukan
             * loader backend.
             * ==================================================
             */

            case "setting":

                console.log(
                    "Guardian KPI: Settings loaded."
                );

                break;


            /* ==================================================
             * UNKNOWN
             * ==================================================
             */

            default:

                console.warn(
                    "Guardian KPI: tidak ada initializer untuk:",
                    page
                );

        }

    }

    catch (error) {

        console.error(
            "Guardian KPI page initializer error:",
            page,
            error
        );

    }

}


/* ==========================================================
 * ACTIVE MENU
 * ==========================================================
 */

function gkpSetActiveMenu(
    page
) {

    document
        .querySelectorAll(
            "[data-page]"
        )
        .forEach(
            function (item) {

                if (
                    item.classList.contains(
                        "guardian-menu-item"
                    ) ||
                    item.classList.contains(
                        "main-menu-item"
                    )
                ) {

                    item.classList.toggle(

                        "active",

                        item.dataset.page ===
                        page

                    );

                }

            }
        );

}


/* ==========================================================
 * HTML ESCAPE
 * ==========================================================
 */

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
 * SETTINGS SESSION
 * ==========================================================
 */

function gkpSettingsUnlocked() {

    return (

        sessionStorage.getItem(
            GKP_SETTINGS_SESSION
        ) ===
        "1"

    );

}


/* ==========================================================
 * ADMIN PIN INITIALIZATION
 * ==========================================================
 */

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
     * Submit button
     */

    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    if (
        submit &&
        submit.dataset
            .gkpPinBound !==
        "1"
    ) {

        submit.dataset
            .gkpPinBound =
            "1";


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


    if (
        input &&
        input.dataset
            .gkpPinBound !==
        "1"
    ) {

        input.dataset
            .gkpPinBound =
            "1";


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
     * CLOSE BUTTON
     */

    const closeButtons =
        modal.querySelectorAll(
            "[data-close-pin], .pin-modal-close, #guardianPinClose"
        );


    closeButtons.forEach(

        function (button) {

            if (
                button.dataset
                    .gkpPinCloseBound ===
                "1"
            ) {

                return;

            }


            button.dataset
                .gkpPinCloseBound =
                "1";


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
 * REQUEST SETTINGS
 * ==========================================================
 */

function gkpRequestSettings() {

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


    if (title) {

        title.textContent =
            "Settings Terkunci";

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
 * OPEN PIN MODAL
 * ==========================================================
 */

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
 * CLOSE PIN MODAL
 * ==========================================================
 */

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


    const error =
        document.getElementById(
            "guardianPinError"
        ) ||
        document.getElementById(
            "settingsPinError"
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
 * VALIDATE PIN FORMAT
 * ==========================================================
 */

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
 * SHOW PIN ERROR
 * ==========================================================
 */

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
 * SUBMIT ADMIN PIN
 *
 * GitHub Pages
 *      ↓
 * js/api.js
 *      ↓
 * Apps Script doPost()
 *      ↓
 * verifyAdminPin()
 * ==========================================================
 */

async function gkpSubmitPin() {

    const input =
        document.getElementById(
            "guardianPinInput"
        ) ||
        document.getElementById(
            "settingsPinInput"
        );


    const pin =
        input
            ? input.value.trim()
            : "";


    /*
     * Validasi format lokal.
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
     * API harus tersedia.
     */

    if (
        typeof API ===
        "undefined"
    ) {

        gkpShowPinError(
            "API Guardian KPI tidak tersedia."
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

        submit.dataset
            .originalText =
            submit.textContent;

        submit.textContent =
            "Memverifikasi...";

    }


    try {

        console.log(
            "========== VERIFY ADMIN PIN =========="
        );


        const result =
            await API.post({

                action:
                    "verifyAdminPin",

                pin:
                    pin

            });


        console.log(
            "VERIFY ADMIN PIN RESPONSE:",
            result
        );


        /*
         * PIN salah / server menolak.
         */

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
         * PIN BENAR.
         *
         * Hanya status sesi yang
         * disimpan di browser.
         *
         * PIN tidak disimpan.
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

        await gkpLoadPage(
            "setting"
        );

    }

    catch (error) {

        console.error(
            "VERIFY ADMIN PIN ERROR:",
            error
        );


        gkpShowPinError(

            error?.message ||
            "Gagal menghubungi server Admin PIN."

        );

    }

    finally {

        if (submit) {

            submit.disabled =
                false;

            submit.textContent =
                submit.dataset
                    .originalText ||
                "Buka Settings";

        }

    }

}


/* ==========================================================
 * LOCK SETTINGS
 * ==========================================================
 */

function gkpLockSettings() {

    sessionStorage.removeItem(
        GKP_SETTINGS_SESSION
    );


    gkpLoadPage(
        "dashboard"
    );

}


/* ==========================================================
 * CHANGE ADMIN PIN
 *
 * GitHub Pages
 *      ↓
 * js/api.js
 *      ↓
 * Apps Script doPost()
 *      ↓
 * changeAdminPin()
 * ==========================================================
 */

async function guardianChangeAdminPin() {

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


    const oldPinClean =
        oldPin.trim();


    if (
        !gkpValidPin(
            oldPinClean
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


    const newPinClean =
        newPin.trim();


    if (
        !gkpValidPin(
            newPinClean
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


    const confirmPinClean =
        confirmPin.trim();


    if (
        newPinClean !==
        confirmPinClean
    ) {

        alert(
            "Konfirmasi PIN baru tidak sama."
        );

        return;

    }


    /*
     * API
     */

    if (
        typeof API ===
        "undefined"
    ) {

        alert(
            "API Guardian KPI tidak tersedia."
        );

        return;

    }


    try {

        console.log(
            "========== CHANGE ADMIN PIN =========="
        );


        const result =
            await API.post({

                action:
                    "changeAdminPin",

                oldPin:
                    oldPinClean,

                newPin:
                    newPinClean

            });


        console.log(
            "CHANGE PIN RESPONSE:",
            result
        );


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
         * Hapus sesi Settings.
         */

        sessionStorage.removeItem(
            GKP_SETTINGS_SESSION
        );


        alert(

            result.message ||
            "PIN Admin berhasil diubah."

        );


        /*
         * Kembali Dashboard.
         */

        await gkpLoadPage(
            "dashboard"
        );

    }

    catch (error) {

        console.error(
            "Guardian KPI changeAdminPin:",
            error
        );


        alert(

            error?.message ||
            "Gagal menghubungi server Admin PIN."

        );

    }

}


/* ==========================================================
 * GLOBAL EXPORT
 *
 * Kompatibilitas dengan HTML
 * dan modul lain.
 * ==========================================================
 */

window.gkpInitializeApplication =
    gkpInitializeApplication;


window.gkpLoadPage =
    gkpLoadPage;


window.gkpInitializePage =
    gkpInitializePage;


window.gkpSettingsUnlocked =
    gkpSettingsUnlocked;


window.gkpValidPin =
    gkpValidPin;


window.gkpShowPinError =
    gkpShowPinError;


window.gkpOpenPinModal =
    gkpOpenPinModal;


window.gkpClosePinModal =
    gkpClosePinModal;


window.gkpSubmitPin =
    gkpSubmitPin;


window.gkpLockSettings =
    gkpLockSettings;


window.gkpToggleTheme =
    gkpToggleTheme;


window.gkpInitTheme =
    gkpInitTheme;


window.gkpApplyTheme =
    gkpApplyTheme;


window.gkpInitMenu =
    gkpInitMenu;


window.gkpToggleMenu =
    gkpToggleMenu;


window.gkpOpenMenu =
    gkpOpenMenu;


window.gkpCloseMenu =
    gkpCloseMenu;


window.gkpSetActiveMenu =
    gkpSetActiveMenu;


window.gkpEscapeHtml =
    gkpEscapeHtml;


/* ==========================================================
 * GUARDIAN COMPATIBILITY ALIAS
 * ==========================================================
 */

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
 * END APP.JS
 * ==========================================================
 */
