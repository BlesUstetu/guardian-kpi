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
 * - Settings PIN
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

const GKP_PIN_KEY =
    "guardianKPI.settingsPinHash";

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
     * Gunakan dashboard.js yang sudah ada.
     */

    if (
        page === "dashboard"
    ) {

        if (
            typeof window.init ===
            "function"
        ) {

            try {

                window.init();

            }

            catch (error) {

                console.error(
                    "Dashboard init error:",
                    error
                );

            }

        }

        else {

            console.warn(
                "Dashboard: fungsi init() tidak ditemukan."
            );

        }

    }


    /*
     * ANGGOTA
     */

    if (
        page === "anggota"
    ) {

        if (
            typeof window.initAnggota ===
            "function"
        ) {

            window.initAnggota();

        }

    }


    /*
     * GROUP
     */

    if (
        page === "group"
    ) {

        if (
            typeof window.initGroup ===
            "function"
        ) {

            window.initGroup();

        }

    }


    /*
     * MASTER KPI
     */

    if (
        page === "masterkpi"
    ) {

        if (
            typeof window.initMasterKPI ===
            "function"
        ) {

            window.initMasterKPI();

        }

    }


    /*
     * PENILAIAN
     */

    if (
        page === "penilaian"
    ) {

        if (
            typeof window.initPenilaian ===
            "function"
        ) {

            window.initPenilaian();

        }

    }


    /*
     * SETTINGS
     */

    if (
        page === "setting"
    ) {

        gkpInitializeSettings();

    }

}


/* ==========================================================
   SETTINGS
========================================================== */

function gkpSettingsUnlocked() {

    return (
        sessionStorage.getItem(
            GKP_SETTINGS_SESSION
        ) === "1"
    );

}


/* ==========================================================
   PIN INITIALIZATION
========================================================== */

function gkpInitPin() {

    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    if (!submit) {

        return;

    }


    submit.addEventListener(
        "click",
        gkpSubmitPin
    );


    const inputs = [

        "guardianPinInput",
        "guardianNewPin",
        "guardianConfirmPin",

        "settingsPinInput",
        "settingsNewPin",
        "settingsConfirmPin"

    ];


    inputs.forEach(
        function (id) {

            const input =
                document.getElementById(
                    id
                );


            if (!input) {

                return;

            }


            input.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        gkpSubmitPin();

                    }

                }
            );

        }
    );

}


/* ==========================================================
   REQUEST SETTINGS
========================================================== */

function gkpRequestSettings() {

    const modal =
        document.getElementById(
            "guardianPinModal"
        ) ||
        document.getElementById(
            "settingsPinModal"
        );


    if (!modal) {

        /*
         * Jika modal belum tersedia,
         * buat fallback sederhana.
         */

        console.error(
            "Guardian KPI: PIN modal tidak ditemukan."
        );

        return;

    }


    const storedPin =
        localStorage.getItem(
            GKP_PIN_KEY
        );


    const title =
        document.getElementById(
            "guardianPinTitle"
        ) ||
        document.getElementById(
            "settingsPinTitle"
        );


    const message =
        document.getElementById(
            "guardianPinMessage"
        ) ||
        document.getElementById(
            "settingsPinMessage"
        );


    const createGroup =
        document.getElementById(
            "guardianCreatePin"
        ) ||
        document.getElementById(
            "settingsCreatePinGroup"
        );


    const enterGroup =
        document.getElementById(
            "guardianEnterPin"
        ) ||
        document.getElementById(
            "settingsEnterPinGroup"
        );


    const submit =
        document.getElementById(
            "guardianPinSubmit"
        ) ||
        document.getElementById(
            "settingsPinSubmit"
        );


    const error =
        document.getElementById(
            "guardianPinError"
        ) ||
        document.getElementById(
            "settingsPinError"
        );


    /*
     * CLEAR
     */

    if (error) {

        error.textContent =
            "";

        error.classList.add(
            "d-none"
        );

    }


    [
        "guardianPinInput",
        "guardianNewPin",
        "guardianConfirmPin",
        "settingsPinInput",
        "settingsNewPin",
        "settingsConfirmPin"
    ]
    .forEach(
        function (id) {

            const input =
                document.getElementById(
                    id
                );


            if (input) {

                input.value =
                    "";

            }

        }
    );


    /*
     * FIRST TIME
     */

    if (!storedPin) {

        if (title) {

            title.textContent =
                "Buat PIN Settings";

        }


        if (message) {

            message.textContent =
                "Buat PIN 4–12 digit untuk melindungi Settings.";

        }


        if (createGroup) {

            createGroup.classList.remove(
                "d-none"
            );

        }


        if (enterGroup) {

            enterGroup.classList.add(
                "d-none"
            );

        }


        if (submit) {

            submit.textContent =
                "Simpan PIN & Buka";

        }

    }


    /*
     * EXISTING PIN
     */

    else {

        if (title) {

            title.textContent =
                "Settings Terkunci";

        }


        if (message) {

            message.textContent =
                "Masukkan PIN untuk membuka Settings.";

        }


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

    }


    /*
     * SHOW MODAL
     */

    if (
        typeof bootstrap !==
        "undefined" &&
        bootstrap.Modal
    ) {

        const instance =
            bootstrap.Modal
                .getOrCreateInstance(
                    modal
                );


        instance.show();

    }


    /*
     * FOCUS
     */

    setTimeout(
        function () {

            const target =
                storedPin
                    ? (
                        document.getElementById(
                            "guardianPinInput"
                        ) ||
                        document.getElementById(
                            "settingsPinInput"
                        )
                    )
                    : (
                        document.getElementById(
                            "guardianNewPin"
                        ) ||
                        document.getElementById(
                            "settingsNewPin"
                        )
                    );


            if (target) {

                target.focus();

            }

        },
        350
    );

}


/* ==========================================================
   PIN VALIDATION
========================================================== */

function gkpValidPin(
    pin
) {

    return /^\d{4,12}$/
        .test(
            String(
                pin || ""
            )
        );

}


/* ==========================================================
   HASH
========================================================== */

async function gkpHash(
    text
) {

    /*
     * SHA-256
     */

    if (
        window.crypto &&
        window.crypto.subtle
    ) {

        const data =
            new TextEncoder()
                .encode(
                    text
                );


        const hashBuffer =
            await window.crypto.subtle
                .digest(
                    "SHA-256",
                    data
                );


        return Array
            .from(
                new Uint8Array(
                    hashBuffer
                )
            )
            .map(
                function (byte) {

                    return byte
                        .toString(16)
                        .padStart(
                            2,
                            "0"
                        );

                }
            )
            .join("");

    }


    /*
     * Fallback sederhana
     */

    let hash =
        0;


    for (
        let i = 0;
        i < text.length;
        i++
    ) {

        hash =
            (
                (
                    hash << 5
                ) -
                hash
            ) +
            text.charCodeAt(
                i
            );


        hash |=
            0;

    }


    return String(
        hash
    );

}


/* ==========================================================
   SUBMIT PIN
========================================================== */

async function gkpSubmitPin() {

    const error =
        document.getElementById(
            "guardianPinError"
        ) ||
        document.getElementById(
            "settingsPinError"
        );


    function showError(
        message
    ) {

        if (!error) {

            return;

        }


        error.textContent =
            message;


        error.classList.remove(
            "d-none"
        );

    }


    const storedPin =
        localStorage.getItem(
            GKP_PIN_KEY
        );


    /*
     * FIRST TIME
     */

    if (!storedPin) {

        const newPin =
            (
                document.getElementById(
                    "guardianNewPin"
                ) ||
                document.getElementById(
                    "settingsNewPin"
                )
            )
            ?.value
            .trim();


        const confirmPin =
            (
                document.getElementById(
                    "guardianConfirmPin"
                ) ||
                document.getElementById(
                    "settingsConfirmPin"
                )
            )
            ?.value
            .trim();


        if (
            !gkpValidPin(
                newPin
            )
        ) {

            showError(
                "PIN harus terdiri dari 4–12 digit."
            );

            return;

        }


        if (
            newPin !==
            confirmPin
        ) {

            showError(
                "Konfirmasi PIN tidak sama."
            );

            return;

        }


        const hash =
            await gkpHash(
                newPin
            );


        localStorage.setItem(
            GKP_PIN_KEY,
            hash
        );


        sessionStorage.setItem(
            GKP_SETTINGS_SESSION,
            "1"
        );


        gkpClosePinModal();


        gkpLoadPage(
            "setting"
        );


        return;

    }


    /*
     * EXISTING PIN
     */

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

        showError(
            "Masukkan PIN 4–12 digit."
        );

        return;

    }


    const hash =
        await gkpHash(
            pin
        );


    if (
        hash !==
        storedPin
    ) {

        showError(
            "PIN salah."
        );

        return;

    }


    sessionStorage.setItem(
        GKP_SETTINGS_SESSION,
        "1"
    );


    gkpClosePinModal();


    gkpLoadPage(
        "setting"
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


    if (
        typeof bootstrap !==
        "undefined" &&
        bootstrap.Modal
    ) {

        const instance =
            bootstrap.Modal
                .getInstance(
                    modal
                );


        if (instance) {

            instance.hide();

        }

    }

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
   SETTINGS INITIALIZER
========================================================== */

function gkpInitializeSettings() {

    console.log(
        "Guardian KPI Settings initialized."
    );

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function gkpEscape(
    value
) {

    return String(
        value ?? ""
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
   GLOBAL
========================================================== */

window.gkpLoadPage =
    gkpLoadPage;

window.gkpToggleTheme =
    gkpToggleTheme;

window.gkpApplyTheme =
    gkpApplyTheme;

window.gkpRequestSettings =
    gkpRequestSettings;

window.gkpLockSettings =
    gkpLockSettings;
