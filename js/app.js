/**
 * ==========================================================
 * GUARDIAN KPI
 * UI CONTROLLER
 * ==========================================================
 *
 * Fungsi:
 *
 * 1. Hamburger dropdown
 * 2. Dashboard navigation
 * 3. Settings navigation
 * 4. PIN Settings
 * 5. Dark / Light mode
 * 6. Dynamic page loader
 *
 * PENTING:
 *
 * File ini TIDAK mengolah data KPI.
 *
 * Data tetap diproses oleh:
 *
 * dashboard.js
 * api.js
 * backend Google Apps Script
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
   STORAGE KEYS
========================================================== */

const THEME_KEY =
    "guardianKPI.theme";

const SETTINGS_PIN_KEY =
    "guardianKPI.settingsPinHash";

const SETTINGS_SESSION_KEY =
    "guardianKPI.settingsUnlocked";


/* ==========================================================
   GLOBAL
========================================================== */

let currentPage =
    "dashboard";


/* ==========================================================
   PAGE INFORMATION
========================================================== */

const PAGE_INFO = {

    dashboard: {

        title: "Dashboard"

    },

    setting: {

        title: "Settings"

    },

    anggota: {

        title: "Anggota"

    },

    group: {

        title: "Group"

    },

    masterkpi: {

        title: "Master KPI"

    },

    penilaian: {

        title: "Penilaian"

    }

};


/* ==========================================================
   DOM READY
========================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initTheme();

        initMenu();

        initSettings();

        loadPage("dashboard");

    }
);


/* ==========================================================
   MENU
========================================================== */

function initMenu() {

    const menuButton =
        document.getElementById(
            "menuButton"
        );


    const mainMenu =
        document.getElementById(
            "mainMenu"
        );


    if (!menuButton || !mainMenu) {

        return;

    }


    /* OPEN / CLOSE */

    menuButton.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            toggleMenu();

        }
    );


    /* MENU ITEMS */

    mainMenu
        .querySelectorAll(
            ".main-menu-item"
        )
        .forEach(
            function (item) {

                item.addEventListener(
                    "click",
                    function () {

                        const page =
                            item.dataset.page;


                        closeMenu();


                        if (
                            page ===
                            "setting"
                        ) {

                            requestSettingsAccess();

                            return;

                        }


                        loadPage(page);

                    }
                );

            }
        );


    /* CLICK OUTSIDE */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !mainMenu.contains(
                    event.target
                ) &&
                !menuButton.contains(
                    event.target
                )
            ) {

                closeMenu();

            }

        }
    );

}


/* ==========================================================
   TOGGLE MENU
========================================================== */

function toggleMenu() {

    const menu =
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "menuButton"
        );


    if (!menu || !button) {

        return;

    }


    const isOpen =
        menu.classList.contains(
            "show"
        );


    if (isOpen) {

        closeMenu();

    } else {

        openMenu();

    }

}


/* ==========================================================
   OPEN MENU
========================================================== */

function openMenu() {

    const menu =
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "menuButton"
        );


    if (!menu || !button) {

        return;

    }


    menu.classList.add(
        "show"
    );


    menu.setAttribute(
        "aria-hidden",
        "false"
    );


    button.classList.add(
        "active"
    );


    button.setAttribute(
        "aria-expanded",
        "true"
    );

}


/* ==========================================================
   CLOSE MENU
========================================================== */

function closeMenu() {

    const menu =
        document.getElementById(
            "mainMenu"
        );


    const button =
        document.getElementById(
            "menuButton"
        );


    if (!menu || !button) {

        return;

    }


    menu.classList.remove(
        "show"
    );


    menu.setAttribute(
        "aria-hidden",
        "true"
    );


    button.classList.remove(
        "active"
    );


    button.setAttribute(
        "aria-expanded",
        "false"
    );

}


/* ==========================================================
   ACTIVE MENU
========================================================== */

function setActiveMenu(
    page
) {

    document
        .querySelectorAll(
            ".main-menu-item"
        )
        .forEach(
            function (item) {

                item.classList.remove(
                    "active"
                );

            }
        );


    const item =
        document.querySelector(
            `.main-menu-item[data-page="${page}"]`
        );


    if (item) {

        item.classList.add(
            "active"
        );

    }

}


/* ==========================================================
   PAGE LOADER
========================================================== */

async function loadPage(
    page
) {

    /* ------------------------------------------
       SETTINGS PROTECTION
    ------------------------------------------ */

    if (
        page ===
        "setting" &&
        !isSettingsUnlocked()
    ) {

        requestSettingsAccess();

        return;

    }


    currentPage =
        page;


    const app =
        document.getElementById(
            "appContent"
        );


    if (!app) {

        return;

    }


    /* ------------------------------------------
       LOADING
    ------------------------------------------ */

    app.innerHTML = `

        <div class="page-loading">

            <div class="loading-ring"></div>

        </div>

    `;


    try {

        const response =
            await fetch(
                `pages/${page}.html`,
                {
                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Halaman ${page}.html tidak ditemukan.`
            );

        }


        const html =
            await response.text();


        app.innerHTML =
            html;


        setActiveMenu(
            page
        );


        initializePage(
            page
        );


        window.scrollTo(
            0,
            0
        );

    }


    catch (error) {

        console.error(
            "Guardian KPI page error:",
            error
        );


        app.innerHTML = `

            <div class="ui-error">

                <i class="bi bi-exclamation-triangle"></i>

                <div>

                    <strong>
                        Halaman gagal dimuat
                    </strong>

                    <p>
                        ${escapeHtml(
                            error.message
                        )}
                    </p>

                </div>

            </div>

        `;

    }

}


/* ==========================================================
   PAGE INITIALIZER
========================================================== */

function initializePage(
    page
) {

    switch (
        page
    ) {


        case "dashboard":

            /*
             * dashboard.js
             * sudah memiliki init()
             */

            if (
                typeof init ===
                "function"
            ) {

                init();

            }

            break;


        case "anggota":

            if (
                typeof initAnggota ===
                "function"
            ) {

                initAnggota();

            }

            break;


        case "group":

            if (
                typeof initGroup ===
                "function"
            ) {

                initGroup();

            }

            break;


        case "masterkpi":

            if (
                typeof initMasterKPI ===
                "function"
            ) {

                initMasterKPI();

            }

            break;


        case "penilaian":

            if (
                typeof initPenilaian ===
                "function"
            ) {

                initPenilaian();

            }

            break;


        case "setting":

            initializeSettingsPage();

            break;

    }

}


/* ==========================================================
   SETTINGS
========================================================== */

function initSettings() {

    const submitButton =
        document.getElementById(
            "settingsPinSubmit"
        );


    if (!submitButton) {

        return;

    }


    submitButton.addEventListener(
        "click",
        submitSettingsAccess
    );


    [
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

                        submitSettingsAccess();

                    }

                }
            );

        }
    );

}


/* ==========================================================
   REQUEST SETTINGS
========================================================== */

function requestSettingsAccess() {

    const modalElement =
        document.getElementById(
            "settingsPinModal"
        );


    if (!modalElement) {

        return;

    }


    prepareSettingsModal();


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            modalElement
        );


    modal.show();


    setTimeout(
        function () {

            const hasPin =
                Boolean(
                    localStorage.getItem(
                        SETTINGS_PIN_KEY
                    )
                );


            const inputId =
                hasPin
                    ? "settingsPinInput"
                    : "settingsNewPin";


            document
                .getElementById(
                    inputId
                )
                ?.focus();

        },
        350
    );

}


/* ==========================================================
   PREPARE SETTINGS MODAL
========================================================== */

function prepareSettingsModal() {

    const hasPin =
        Boolean(
            localStorage.getItem(
                SETTINGS_PIN_KEY
            )
        );


    const title =
        document.getElementById(
            "settingsPinTitle"
        );


    const message =
        document.getElementById(
            "settingsPinMessage"
        );


    const createGroup =
        document.getElementById(
            "settingsCreatePinGroup"
        );


    const enterGroup =
        document.getElementById(
            "settingsEnterPinGroup"
        );


    const submitButton =
        document.getElementById(
            "settingsPinSubmit"
        );


    const error =
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


    [
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


    if (!hasPin) {

        title.textContent =
            "Buat PIN Settings";


        message.textContent =
            "Buat PIN 4–12 digit untuk melindungi Settings.";


        createGroup
            .classList.remove(
                "d-none"
            );


        enterGroup
            .classList.add(
                "d-none"
            );


        submitButton.textContent =
            "Simpan PIN & Buka";

    }


    else {

        title.textContent =
            "Settings Terkunci";


        message.textContent =
            "Masukkan PIN untuk membuka Settings.";


        createGroup
            .classList.add(
                "d-none"
            );


        enterGroup
            .classList.remove(
                "d-none"
            );


        submitButton.textContent =
            "Buka Settings";

    }

}


/* ==========================================================
   PIN FORMAT
========================================================== */

function validPin(
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

async function hashText(
    text
) {

    if (
        window.crypto &&
        window.crypto.subtle
    ) {

        const data =
            new TextEncoder()
                .encode(
                    text
                );


        const buffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        return Array
            .from(
                new Uint8Array(
                    buffer
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


    /* Fallback */

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
   SUBMIT SETTINGS PIN
========================================================== */

async function submitSettingsAccess() {

    const error =
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


    const storedHash =
        localStorage.getItem(
            SETTINGS_PIN_KEY
        );


    /* ======================================================
       FIRST TIME
    ====================================================== */

    if (!storedHash) {

        const pin =
            document.getElementById(
                "settingsNewPin"
            )
            ?.value
            .trim();


        const confirmPin =
            document.getElementById(
                "settingsConfirmPin"
            )
            ?.value
            .trim();


        if (
            !validPin(
                pin
            )
        ) {

            showError(
                "PIN harus terdiri dari 4–12 digit."
            );

            return;

        }


        if (
            pin !==
            confirmPin
        ) {

            showError(
                "Konfirmasi PIN tidak sama."
            );

            return;

        }


        const hash =
            await hashText(
                pin
            );


        localStorage.setItem(
            SETTINGS_PIN_KEY,
            hash
        );


        sessionStorage.setItem(
            SETTINGS_SESSION_KEY,
            "1"
        );


        closeSettingsModal();


        loadPage(
            "setting"
        );


        return;

    }


    /* ======================================================
       EXISTING PIN
    ====================================================== */

    const pin =
        document.getElementById(
            "settingsPinInput"
        )
        ?.value
        .trim();


    if (
        !validPin(
            pin
        )
    ) {

        showError(
            "Masukkan PIN 4–12 digit."
        );

        return;

    }


    const hash =
        await hashText(
            pin
        );


    if (
        hash !==
        storedHash
    ) {

        showError(
            "PIN salah."
        );

        return;

    }


    sessionStorage.setItem(
        SETTINGS_SESSION_KEY,
        "1"
    );


    closeSettingsModal();


    loadPage(
        "setting"
    );

}


/* ==========================================================
   SETTINGS SESSION
========================================================== */

function isSettingsUnlocked() {

    return (
        sessionStorage.getItem(
            SETTINGS_SESSION_KEY
        ) ===
        "1"
    );

}


/* ==========================================================
   CLOSE MODAL
========================================================== */

function closeSettingsModal() {

    const element =
        document.getElementById(
            "settingsPinModal"
        );


    if (!element) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            element
        );


    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
   LOCK SETTINGS
========================================================== */

function lockSettings() {

    sessionStorage.removeItem(
        SETTINGS_SESSION_KEY
    );


    loadPage(
        "dashboard"
    );

}


/* ==========================================================
   SETTINGS PAGE
========================================================== */

function initializeSettingsPage() {

    /*
     * Tidak ada header tambahan.
     * Halaman Settings menggunakan
     * layout miliknya sendiri.
     */

}


/* ==========================================================
   THEME
========================================================== */

function initTheme() {

    const savedTheme =
        localStorage.getItem(
            THEME_KEY
        );


    const theme =
        savedTheme ===
        "light"
            ? "light"
            : "dark";


    applyTheme(
        theme
    );


    const toggle =
        document.getElementById(
            "themeToggle"
        );


    if (toggle) {

        toggle.addEventListener(
            "click",
            function () {

                const current =
                    document.documentElement
                        .getAttribute(
                            "data-theme"
                        ) ||
                    "dark";


                applyTheme(
                    current ===
                    "dark"
                        ? "light"
                        : "dark"
                );

            }
        );

    }

}


/* ==========================================================
   APPLY THEME
========================================================== */

function applyTheme(
    theme
) {

    const normalized =
        theme ===
        "light"
            ? "light"
            : "dark";


    document.documentElement
        .setAttribute(
            "data-theme",
            normalized
        );


    localStorage.setItem(
        THEME_KEY,
        normalized
    );


    const icon =
        document.getElementById(
            "themeIcon"
        );


    if (!icon) {

        return;

    }


    /*
     * Dark mode:
     * icon SUN
     *
     * Light mode:
     * icon MOON
     */

    if (
        normalized ===
        "dark"
    ) {

        icon.className =
            "bi bi-sun-fill";

    }

    else {

        icon.className =
            "bi bi-moon-stars-fill";

    }

}


/* ==========================================================
   ESCAPE HTML
========================================================== */

function escapeHtml(
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
   GLOBAL FUNCTIONS
========================================================== */

window.loadPage =
    loadPage;

window.requestSettingsAccess =
    requestSettingsAccess;

window.submitSettingsAccess =
    submitSettingsAccess;

window.lockSettings =
    lockSettings;

window.toggleMenu =
    toggleMenu;

window.closeMenu =
    closeMenu;

window.applyTheme =
    applyTheme;

window.isSettingsUnlocked =
    isSettingsUnlocked;
