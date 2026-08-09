/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : js/app.js
 * Version : Enterprise Shell FINAL
 * ==========================================================
 */

"use strict";

let currentPage = "dashboard";

const SETTINGS_PIN_KEY =
    "guardianKPI.settingsPinHash";

const SETTINGS_SESSION_KEY =
    "guardianKPI.settingsUnlocked";

const THEME_KEY =
    "guardianKPI.theme";


/* ==========================================================
 * PAGE META
 * ==========================================================
 */

function pageTitle(page) {

    const titles = {

        dashboard: {
            title: "Dashboard",
            subtitle: "Guardian KPI Web3"
        },

        setting: {
            title: "Settings",
            subtitle: "Konfigurasi Guardian KPI"
        },

        anggota: {
            title: "Anggota",
            subtitle: "Data anggota security"
        },

        group: {
            title: "Group",
            subtitle: "Manajemen group"
        },

        masterkpi: {
            title: "Master KPI",
            subtitle: "Indikator dan bobot KPI"
        },

        penilaian: {
            title: "Penilaian",
            subtitle: "Penilaian kinerja anggota"
        }

    };

    return titles[page] || {
        title: "Guardian KPI",
        subtitle: "Enterprise Security"
    };
}


/* ==========================================================
 * LOAD PAGE
 * ==========================================================
 */

async function loadPage(page) {

    if (
        page === "setting" &&
        !isSettingsUnlocked()
    ) {
        requestSettingsAccess();
        return;
    }

    currentPage = page;

    const app =
        document.getElementById("appContent");

    if (!app) return;

    app.innerHTML = `
        <div class="page-loading">
            <div class="spinner-border text-info"></div>
            <p>Loading...</p>
        </div>
    `;

    try {

        const response =
            await fetch(
                `pages/${page}.html`,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {
            throw new Error(
                `Halaman "${page}" tidak ditemukan.`
            );
        }

        const html =
            await response.text();

        app.innerHTML = html;

        updatePageHeader(page);

        activeMenu(page);

        initPage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Guardian KPI loadPage:",
            error
        );

        app.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle-fill me-2"></i>
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


/* ==========================================================
 * HEADER
 * ==========================================================
 */

function updatePageHeader(page) {

    const meta = pageTitle(page);

    const title =
        document.getElementById("pageTitle");

    const subtitle =
        document.getElementById("pageSubtitle");

    if (title) {
        title.textContent = meta.title;
    }

    if (subtitle) {
        subtitle.textContent = meta.subtitle;
    }
}


/* ==========================================================
 * PAGE INIT
 * ==========================================================
 */

function initPage(page) {

    switch (page) {

        case "dashboard":

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

            initSettingsPage();

            break;
    }
}


/* ==========================================================
 * SETTINGS
 * ==========================================================
 */

function initSettingsPage() {

    const status =
        document.getElementById(
            "settingsPinStatus"
        );

    if (status) {

        status.textContent =
            "Settings terbuka";

        status.className =
            "settings-access-badge";

    }
}


function openSettingsModule(page) {

    if (!isSettingsUnlocked()) {

        requestSettingsAccess();

        return;
    }

    loadPage(page);
}


/* ==========================================================
 * SETTINGS PIN MODAL
 * ==========================================================
 */

function requestSettingsAccess() {

    const modalElement =
        document.getElementById(
            "settingsPinModal"
        );

    if (!modalElement) {

        alert(
            "Modal Settings tidak ditemukan."
        );

        return;
    }

    prepareSettingsPinModal();

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

            const targetId =
                hasPin
                    ? "settingsPinInput"
                    : "settingsNewPin";

            document
                .getElementById(targetId)
                ?.focus();

        },
        300
    );
}


function prepareSettingsPinModal() {

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

    const submit =
        document.getElementById(
            "settingsPinSubmit"
        );

    const error =
        document.getElementById(
            "settingsPinError"
        );

    if (error) {

        error.classList.add("d-none");

        error.textContent = "";
    }


    [
        "settingsPinInput",
        "settingsNewPin",
        "settingsConfirmPin"
    ].forEach(
        function(id) {

            const input =
                document.getElementById(id);

            if (input) {
                input.value = "";
            }

        }
    );


    if (!hasPin) {

        if (title) {
            title.textContent =
                "Buat PIN Settings";
        }

        if (message) {
            message.textContent =
                "Buat PIN 4–12 digit untuk melindungi Settings.";
        }

        if (createGroup) {
            createGroup.classList.remove("d-none");
        }

        if (enterGroup) {
            enterGroup.classList.add("d-none");
        }

        if (submit) {
            submit.textContent =
                "Simpan PIN & Buka";
        }

    } else {

        if (title) {
            title.textContent =
                "Settings Terkunci";
        }

        if (message) {
            message.textContent =
                "Masukkan PIN untuk membuka Settings.";
        }

        if (createGroup) {
            createGroup.classList.add("d-none");
        }

        if (enterGroup) {
            enterGroup.classList.remove("d-none");
        }

        if (submit) {
            submit.textContent =
                "Buka Settings";
        }
    }
}


/* ==========================================================
 * PIN HASH
 * ==========================================================
 */

async function hashText(text) {

    if (
        window.crypto &&
        window.crypto.subtle
    ) {

        const data =
            new TextEncoder()
                .encode(text);

        const buffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );

        return Array.from(
            new Uint8Array(buffer)
        )
        .map(
            function(byte) {

                return byte
                    .toString(16)
                    .padStart(2, "0");

            }
        )
        .join("");
    }


    let hash = 0;

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
            text.charCodeAt(i);

        hash |= 0;
    }

    return String(hash);
}


function validPinFormat(pin) {

    return /^\d{4,12}$/.test(
        String(pin || "")
    );
}


/* ==========================================================
 * SUBMIT PIN
 * ==========================================================
 */

async function submitSettingsAccess() {

    const error =
        document.getElementById(
            "settingsPinError"
        );

    function showError(message) {

        if (!error) return;

        error.textContent =
            message;

        error.classList.remove(
            "d-none"
        );
    }


    const storedPin =
        localStorage.getItem(
            SETTINGS_PIN_KEY
        );


    /* FIRST USE */

    if (!storedPin) {

        const pin =
            document.getElementById(
                "settingsNewPin"
            )?.value
            .trim();

        const confirm =
            document.getElementById(
                "settingsConfirmPin"
            )?.value
            .trim();

        if (!validPinFormat(pin)) {

            showError(
                "PIN harus terdiri dari 4–12 digit."
            );

            return;
        }

        if (pin !== confirm) {

            showError(
                "Konfirmasi PIN tidak sama."
            );

            return;
        }

        const hash =
            await hashText(pin);

        localStorage.setItem(
            SETTINGS_PIN_KEY,
            hash
        );

        sessionStorage.setItem(
            SETTINGS_SESSION_KEY,
            "1"
        );

        closeSettingsModal();

        await loadPage("setting");

        return;
    }


    /* EXISTING PIN */

    const pin =
        document.getElementById(
            "settingsPinInput"
        )?.value
        .trim();

    if (!validPinFormat(pin)) {

        showError(
            "Masukkan PIN 4–12 digit."
        );

        return;
    }

    const hash =
        await hashText(pin);

    if (hash !== storedPin) {

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

    await loadPage("setting");
}


/* ==========================================================
 * SETTINGS LOCK
 * ==========================================================
 */

function isSettingsUnlocked() {

    return (
        sessionStorage.getItem(
            SETTINGS_SESSION_KEY
        ) === "1"
    );
}


function lockSettings() {

    sessionStorage.removeItem(
        SETTINGS_SESSION_KEY
    );

    loadPage("dashboard");
}


function closeSettingsModal() {

    const element =
        document.getElementById(
            "settingsPinModal"
        );

    if (!element) return;

    const modal =
        bootstrap.Modal.getInstance(
            element
        );

    if (modal) {
        modal.hide();
    }
}


/* ==========================================================
 * GLOBAL THEME
 * ==========================================================
 */

function applyTheme(theme) {

    theme =
        theme === "light"
            ? "light"
            : "dark";

    document.documentElement
        .setAttribute(
            "data-theme",
            theme
        );

    localStorage.setItem(
        THEME_KEY,
        theme
    );

    const label =
        document.getElementById(
            "themeLabel"
        );

    if (label) {

        label.textContent =
            theme === "light"
                ? "Light"
                : "Dark";
    }

    const knob =
        document.getElementById(
            "themeSwitchKnob"
        );

    if (knob) {

        knob.classList.toggle(
            "light",
            theme === "light"
        );
    }

    const toggle =
        document.getElementById(
            "themeToggle"
        );

    if (toggle) {

        toggle.setAttribute(
            "aria-pressed",
            theme === "light"
                ? "true"
                : "false"
        );
    }
}


function toggleTheme() {

    const current =
        document.documentElement
            .getAttribute(
                "data-theme"
            ) ||
        "dark";

    applyTheme(
        current === "dark"
            ? "light"
            : "dark"
    );
}


function initTheme() {

    const stored =
        localStorage.getItem(
            THEME_KEY
        );

    applyTheme(
        stored === "light"
            ? "light"
            : "dark"
    );
}


/* ==========================================================
 * SIDEBAR
 * ==========================================================
 */

function toggleSidebar() {

    document
        .getElementById(
            "mainSidebar"
        )
        ?.classList.toggle(
            "mobile-open"
        );
}


function activeMenu(page) {

    document
        .querySelectorAll(
            ".menu-item"
        )
        .forEach(
            function(item) {

                item.classList.remove(
                    "active"
                );

            }
        );

    const item =
        document.querySelector(
            `.menu-item[data-page="${page}"]`
        );

    if (item) {

        item.classList.add(
            "active"
        );
    }

    document
        .getElementById(
            "mainSidebar"
        )
        ?.classList.remove(
            "mobile-open"
        );
}


/* ==========================================================
 * SAFE HTML
 * ==========================================================
 */

function escapeHtml(value) {

    return String(
        value ?? ""
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


/* ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.loadPage =
    loadPage;

window.requestSettingsAccess =
    requestSettingsAccess;

window.submitSettingsAccess =
    submitSettingsAccess;

window.openSettingsModule =
    openSettingsModule;

window.lockSettings =
    lockSettings;

window.toggleTheme =
    toggleTheme;

window.applyTheme =
    applyTheme;

window.toggleSidebar =
    toggleSidebar;


/* ==========================================================
 * START
 * ==========================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initTheme();

        loadPage("dashboard");

    }
);
