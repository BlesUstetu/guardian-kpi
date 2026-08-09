/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : js/dashboard.js
 * Version : 4.0.0 Enterprise
 * Author  : BlesProduction
 * ==========================================================
 *
 * Dashboard Frontend Controller
 *
 * Backend response yang digunakan:
 *
 * {
 *   success: true,
 *   message: "Dashboard berhasil diambil.",
 *   data: {
 *      totalAnggota: 7,
 *      anggotaAktif: 7,
 *      anggotaNonAktif: 0,
 *      totalGroup: 5,
 *      totalMasterKPI: 9,
 *      totalPenilaian: 2
 *   }
 * }
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * DASHBOARD CONTROLLER
 * ==========================================================
 */

const Dashboard = {

    /* ======================================================
     * STATE
     * ======================================================
     */

    state: {

        data: {},

        loading: false,

        initialized: false,

        refreshTimer: null,

        chartRetryTimer: null,

        barChart: null,

        pieChart: null,

        counterTimers: {}

    },


    /* ======================================================
     * CONFIG
     * ======================================================
     */

    config: {

        autoRefreshMinutes: 5,

        chartRetryDelay: 500,

        chartRetryLimit: 10,

        counterDuration: 600

    },


    /* ======================================================
     * INIT
     * ======================================================
     */

    async init() {

        if (this.state.initialized) {

            /*
             * Jangan melakukan request ganda
             * jika init dipanggil kembali.
             */

            return this.refresh();

        }

        this.state.initialized = true;

        console.log(
            "Guardian KPI Dashboard v4 initialized."
        );

        await this.load();

        this.startAutoRefresh();

    },


    /* ======================================================
     * LOAD DATA
     * ======================================================
     */

    async load() {

        if (this.state.loading) {

            console.warn(
                "Dashboard request masih berjalan."
            );

            return;

        }

        if (
            typeof API === "undefined" ||
            typeof API.getDashboard !== "function"
        ) {

            console.error(
                "API.getDashboard() tidak tersedia."
            );

            this.showError(
                "API Dashboard tidak tersedia."
            );

            return;

        }

        this.state.loading = true;

        this.setLoading(true);

        try {

            console.log(
                "Dashboard: requesting data..."
            );

            const response =
                await API.getDashboard();

            console.log(
                "Dashboard API Response:",
                response
            );

            if (!response) {

                throw new Error(
                    "Response API kosong."
                );

            }

            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Gagal mengambil data Dashboard."
                );

            }

            /*
             * Data utama dari:
             *
             * response.data
             */

            this.state.data =
                this.normalizeData(
                    response.data
                );

            console.log(
                "Dashboard Data:",
                this.state.data
            );

            this.render();

        }

        catch (error) {

            console.error(
                "Dashboard Load Error:",
                error
            );

            this.showError(
                error.message ||
                "Gagal memuat Dashboard."
            );

        }

        finally {

            this.state.loading = false;

            this.setLoading(false);

        }

    },


    /* ======================================================
     * NORMALIZE DATA
     * ======================================================
     */

    normalizeData(data) {

        data = data || {};

        return {

            totalAnggota:
                this.toNumber(
                    data.totalAnggota
                ),

            anggotaAktif:
                this.toNumber(
                    data.anggotaAktif
                ),

            anggotaNonAktif:
                this.toNumber(
                    data.anggotaNonAktif
                ),

            totalGroup:
                this.toNumber(
                    data.totalGroup
                ),

            totalMasterKPI:
                this.toNumber(
                    data.totalMasterKPI
                ),

            totalPenilaian:
                this.toNumber(
                    data.totalPenilaian
                )

        };

    },


    /* ======================================================
     * MAIN RENDER
     * ======================================================
     */

    render() {

        const data = this.state.data;

        /*
         * 1. Statistik utama
         */

        this.renderCards(data);

        /*
         * 2. Ringkasan
         */

        this.renderSummary(data);

        /*
         * 3. Informasi database
         */

        this.renderDatabase(data);

        /*
         * 4. Aktivitas
         */

        this.renderActivity(data);

        /*
         * 5. Waktu refresh
         */

        this.renderLastRefresh();

        /*
         * 6. Grafik
         */

        this.renderCharts();

        /*
         * 7. Log
         */

        console.log(
            "Dashboard render selesai."
        );

    },


    /* ======================================================
     * RENDER CARDS
     * ======================================================
     */

    renderCards(data) {

        const cards = {

            totalAnggota:
                data.totalAnggota,

            anggotaAktif:
                data.anggotaAktif,

            anggotaNonAktif:
                data.anggotaNonAktif,

            totalGroup:
                data.totalGroup,

            totalMasterKPI:
                data.totalMasterKPI,

            totalPenilaian:
                data.totalPenilaian

        };

        Object.entries(cards)
            .forEach(
                ([id, value]) => {

                    this.animateCounter(
                        id,
                        value
                    );

                }
            );

    },


    /* ======================================================
     * RENDER SUMMARY
     * ======================================================
     */

    renderSummary(data) {

        const summary = {

            summaryTotalAnggota:
                data.totalAnggota,

            summaryAktif:
                data.anggotaAktif,

            summaryNonAktif:
                data.anggotaNonAktif,

            summaryGroup:
                data.totalGroup,

            summaryKPI:
                data.totalMasterKPI,

            summaryPenilaian:
                data.totalPenilaian

        };

        Object.entries(summary)
            .forEach(
                ([id, value]) => {

                    this.setText(
                        id,
                        value
                    );

                }
            );

    },


    /* ======================================================
     * RENDER DATABASE
     * ======================================================
     */

    renderDatabase(data) {

        const database = {

            dbAnggota:
                data.totalAnggota,

            dbGroup:
                data.totalGroup,

            dbKPI:
                data.totalMasterKPI,

            dbPenilaian:
                data.totalPenilaian

        };

        Object.entries(database)
            .forEach(
                ([id, value]) => {

                    this.setText(
                        id,
                        value
                    );

                }
            );

    },


    /* ======================================================
     * RENDER LAST REFRESH
     * ======================================================
 */

    renderLastRefresh() {

        const element =
            document.getElementById(
                "dashboardLastRefresh"
            );

        if (!element) {

            return;

        }

        element.textContent =
            new Date().toLocaleString(
                "id-ID"
            );

    },


    /* ======================================================
     * RENDER ACTIVITY
     * ======================================================
     */

    renderActivity(data) {

        const tbody =
            document.getElementById(
                "dashboardActivity"
            );

        if (!tbody) {

            return;

        }

        const now =
            new Date().toLocaleString(
                "id-ID"
            );

        tbody.innerHTML = `

            <tr>

                <td>
                    ${this.escapeHTML(now)}
                </td>

                <td>
                    Dashboard berhasil dimuat.
                </td>

                <td>

                    <span class="badge bg-success">

                        SUCCESS

                    </span>

                </td>

            </tr>

            <tr>

                <td>
                    ${this.escapeHTML(now)}
                </td>

                <td>
                    Total Anggota :
                    ${data.totalAnggota}
                </td>

                <td>

                    <span class="badge bg-info">

                        DATA

                    </span>

                </td>

            </tr>

            <tr>

                <td>
                    ${this.escapeHTML(now)}
                </td>

                <td>
                    Total Penilaian :
                    ${data.totalPenilaian}
                </td>

                <td>

                    <span class="badge bg-primary">

                        KPI

                    </span>

                </td>

            </tr>

        `;

    },


    /* ======================================================
     * CHART MANAGER
     * ======================================================
     */

    renderCharts() {

        /*
         * Chart.js mungkin dimuat setelah dashboard.js.
         * Karena itu kita tidak menganggap Chart selalu
         * tersedia pada saat render pertama.
         */

        if (
            typeof Chart === "undefined"
        ) {

            this.retryCharts();

            return;

        }

        this.renderBarChart();

        this.renderPieChart();

    },


    /* ======================================================
     * RETRY CHART
     * ======================================================
     */

    retryCharts() {

        if (
            this.state.chartRetryTimer
        ) {

            return;

        }

        let attempts = 0;

        this.state.chartRetryTimer =
            setInterval(() => {

                attempts++;

                if (
                    typeof Chart !==
                    "undefined"
                ) {

                    clearInterval(
                        this.state.chartRetryTimer
                    );

                    this.state.chartRetryTimer =
                        null;

                    this.renderCharts();

                    return;

                }

                if (
                    attempts >=
                    this.config.chartRetryLimit
                ) {

                    clearInterval(
                        this.state.chartRetryTimer
                    );

                    this.state.chartRetryTimer =
                        null;

                    console.warn(
                        "Chart.js tidak tersedia."
                    );

                }

            },
            this.config.chartRetryDelay);

    },


    /* ======================================================
     * BAR CHART
     * ======================================================
     */

    renderBarChart() {

        const canvas =
            document.getElementById(
                "dashboardChart"
            );

        if (!canvas) {

            return;

        }

        /*
         * Hancurkan chart lama.
         */

        if (
            this.state.barChart
        ) {

            this.state.barChart.destroy();

            this.state.barChart =
                null;

        }

        const data =
            this.state.data;

        this.state.barChart =
            new Chart(
                canvas,
                {

                    type: "bar",

                    data: {

                        labels: [

                            "Anggota",

                            "Group",

                            "Master KPI",

                            "Penilaian"

                        ],

                        datasets: [

                            {

                                label:
                                    "Guardian KPI",

                                data: [

                                    data.totalAnggota,

                                    data.totalGroup,

                                    data.totalMasterKPI,

                                    data.totalPenilaian

                                ],

                                backgroundColor: [

                                    "#0dcaf0",

                                    "#ffc107",

                                    "#0d6efd",

                                    "#198754"

                                ],

                                borderWidth: 0,

                                borderRadius: 6

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        animation: {

                            duration: 700

                        },

                        plugins: {

                            legend: {

                                display: false

                            }

                        },

                        scales: {

                            y: {

                                beginAtZero: true,

                                ticks: {

                                    precision: 0

                                }

                            }

                        }

                    }

                }
            );

    },


    /* ======================================================
     * PIE / DOUGHNUT CHART
     * ======================================================
     */

    renderPieChart() {

        const canvas =
            document.getElementById(
                "dashboardPieChart"
            );

        if (!canvas) {

            return;

        }

        if (
            this.state.pieChart
        ) {

            this.state.pieChart.destroy();

            this.state.pieChart =
                null;

        }

        const data =
            this.state.data;

        this.state.pieChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: [

                            "Aktif",

                            "Non Aktif"

                        ],

                        datasets: [

                            {

                                data: [

                                    data.anggotaAktif,

                                    data.anggotaNonAktif

                                ],

                                backgroundColor: [

                                    "#198754",

                                    "#dc3545"

                                ],

                                borderWidth: 0

                            }

                        ]

                    },

                    options: {

                        responsive: true,

                        maintainAspectRatio: false,

                        cutout: "65%",

                        plugins: {

                            legend: {

                                position: "bottom"

                            }

                        }

                    }

                }
            );

    },


    /* ======================================================
     * REFRESH
     * ======================================================
     */

    async refresh() {

        console.log(
            "Dashboard refresh..."
        );

        await this.load();

    },


    /* ======================================================
     * AUTO REFRESH
     * ======================================================
     */

    startAutoRefresh() {

        this.stopAutoRefresh();

        const minutes =
            Number(
                this.config.autoRefreshMinutes
            );

        if (
            !minutes ||
            minutes <= 0
        ) {

            return;

        }

        this.state.refreshTimer =
            setInterval(
                () => {

                    /*
                     * Hanya refresh jika halaman
                     * Dashboard masih aktif.
                     */

                    if (
                        this.isDashboardVisible()
                    ) {

                        this.refresh();

                    }
                    else {

                        this.stopAutoRefresh();

                    }

                },
                minutes * 60 * 1000
            );

        console.log(
            `Dashboard auto-refresh:
             ${minutes} menit`
        );

    },


    /* ======================================================
     * STOP AUTO REFRESH
     * ======================================================
     */

    stopAutoRefresh() {

        if (
            this.state.refreshTimer
        ) {

            clearInterval(
                this.state.refreshTimer
            );

            this.state.refreshTimer =
                null;

        }

    },


    /* ======================================================
     * CHECK DASHBOARD DOM
     * ======================================================
     */

    isDashboardVisible() {

        return Boolean(

            document.getElementById(
                "dashboardChart"
            )

        );

    },


    /* ======================================================
     * LOADING
     * ======================================================
     */

    setLoading(status) {

        const button =
            document.querySelector(
                'button[onclick="refreshDashboard()"]'
            );

        if (!button) {

            return;

        }

        if (status) {

            button.disabled = true;

            button.innerHTML = `

                <span
                    class="spinner-border
                           spinner-border-sm
                           me-2">
                </span>

                Memuat...

            `;

        }
        else {

            button.disabled = false;

            button.innerHTML = `

                <i class="bi bi-arrow-clockwise"></i>

                Refresh

            `;

        }

    },


    /* ======================================================
     * ERROR
     * ======================================================
     */

    showError(message) {

        console.error(
            "Dashboard Error:",
            message
        );

        /*
         * Jangan menggunakan alert untuk error normal
         * agar UX tidak terganggu.
         */

        const activity =
            document.getElementById(
                "dashboardActivity"
            );

        if (!activity) {

            return;

        }

        activity.innerHTML = `

            <tr>

                <td
                    colspan="3"
                    class="text-center text-danger">

                    <i
                        class="bi bi-exclamation-triangle me-2">
                    </i>

                    ${this.escapeHTML(
                        message
                    )}

                </td>

            </tr>

        `;

    },


    /* ======================================================
     * TEXT HELPER
     * ======================================================
     */

    setText(id, value) {

        const element =
            document.getElementById(id);

        if (!element) {

            return;

        }

        element.textContent =
            value ?? 0;

    },


    /* ======================================================
     * NUMBER HELPER
     * ======================================================
     */

    toNumber(value) {

        const number =
            Number(value);

        if (
            Number.isFinite(number)
        ) {

            return number;

        }

        return 0;

    },


    /* ======================================================
     * COUNTER ANIMATION
     * ======================================================
     */

    animateCounter(id, target) {

        const element =
            document.getElementById(id);

        if (!element) {

            return;

        }

        target =
            this.toNumber(target);

        /*
         * Hentikan animasi sebelumnya.
         */

        if (
            this.state.counterTimers[id]
        ) {

            clearInterval(
                this.state.counterTimers[id]
            );

        }

        /*
         * Jika 0 langsung tampilkan.
         */

        if (target === 0) {

            element.textContent = "0";

            return;

        }

        const start =
            0;

        let current =
            start;

        const duration =
            this.config.counterDuration;

        const steps =
            30;

        const increment =
            target / steps;

        const interval =
            duration / steps;

        this.state.counterTimers[id] =
            setInterval(
                () => {

                    current += increment;

                    if (
                        current >= target
                    ) {

                        current = target;

                        clearInterval(
                            this.state.counterTimers[id]
                        );

                        delete
                            this.state.counterTimers[id];

                    }

                    element.textContent =
                        Math.round(
                            current
                        );

                },
                interval
            );

    },


    /* ======================================================
     * DESTROY
     * ======================================================
     */

    destroy() {

        this.stopAutoRefresh();

        if (
            this.state.chartRetryTimer
        ) {

            clearInterval(
                this.state.chartRetryTimer
            );

            this.state.chartRetryTimer =
                null;

        }

        if (
            this.state.barChart
        ) {

            this.state.barChart.destroy();

            this.state.barChart =
                null;

        }

        if (
            this.state.pieChart
        ) {

            this.state.pieChart.destroy();

            this.state.pieChart =
                null;

        }

        Object.values(
            this.state.counterTimers
        ).forEach(
            timer => clearInterval(timer)
        );

        this.state.counterTimers = {};

        this.state.initialized =
            false;

        console.log(
            "Dashboard destroyed."
        );

    },


    /* ======================================================
     * HTML ESCAPE
     * ======================================================
     */

    escapeHTML(value) {

        return String(value ?? "")
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

};


/* ==========================================================
 * GLOBAL COMPATIBILITY FUNCTIONS
 *
 * Tetap disediakan karena dashboard.html saat ini
 * menggunakan:
 *
 * onclick="refreshDashboard()"
 * ==========================================================
 */

function initDashboard() {

    return Dashboard.init();

}


function loadDashboard() {

    return Dashboard.load();

}


function refreshDashboard() {

    return Dashboard.refresh();

}


function startAutoRefresh(minutes) {

    if (
        minutes !== undefined
    ) {

        Dashboard.config.autoRefreshMinutes =
            Number(minutes);

    }

    Dashboard.startAutoRefresh();

}


function stopAutoRefresh() {

    Dashboard.stopAutoRefresh();

}


function destroyDashboard() {

    Dashboard.destroy();

}


/* ==========================================================
 * WINDOW EXPORT
 * ==========================================================
 */

window.Dashboard =
    Dashboard;

window.initDashboard =
    initDashboard;

window.loadDashboard =
    loadDashboard;

window.refreshDashboard =
    refreshDashboard;

window.startAutoRefresh =
    startAutoRefresh;

window.stopAutoRefresh =
    stopAutoRefresh;

window.destroyDashboard =
    destroyDashboard;


/* ==========================================================
 * DYNAMIC PAGE OBSERVER
 *
 * Guardian KPI menggunakan loadPage() untuk memasukkan
 * halaman secara dinamis.
 *
 * MutationObserver memastikan Dashboard otomatis
 * diinisialisasi setelah dashboard.html masuk ke DOM.
 * ==========================================================
 */

let dashboardObserver = null;

function startDashboardObserver() {

    /*
     * Jika Dashboard sudah ada saat script dijalankan,
     * langsung initialize.
     */

    if (
        Dashboard.isDashboardVisible()
    ) {

        Dashboard.init();

        return;

    }

    /*
     * Hindari membuat observer lebih dari satu.
     */

    if (dashboardObserver) {

        return;

    }

    dashboardObserver =
        new MutationObserver(
            function() {

                if (
                    Dashboard.isDashboardVisible()
                ) {

                    /*
                     * Dashboard sudah masuk DOM.
                     */

                    Dashboard.init();

                    /*
                     * Tidak perlu terus mengamati
                     * setelah Dashboard berhasil ditemukan.
                     */

                    if (dashboardObserver) {

                        dashboardObserver.disconnect();

                        dashboardObserver =
                            null;

                    }

                }

            }
        );

    dashboardObserver.observe(

        document.body,

        {

            childList: true,

            subtree: true

        }

    );

}


/* ==========================================================
 * START OBSERVER
 * ==========================================================
 */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            startDashboardObserver();

        }
    );

}
else {

    startDashboardObserver();

}


/* ==========================================================
 * DEBUG INFORMATION
 * ==========================================================
 */

console.log(
    "%cGuardian KPI Dashboard v4.0.0 Enterprise",
    "color:#0dcaf0;font-weight:bold;font-size:14px"
);
