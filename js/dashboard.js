/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : dashboard.js
 * Version : 6.2.0 Enterprise FINAL
 * ==========================================================
 *
 * Dashboard Frontend Enterprise
 *
 * ==========================================================
 * FEATURES
 * ==========================================================
 *
 * 1. API resolver yang aman
 * 2. Menunggu api.js siap
 * 3. Mendukung window.API
 * 4. Mendukung global API
 * 5. Mendukung globalThis.API
 * 6. Dashboard API
 * 7. Double wrapper response
 * 8. Statistik anggota
 * 9. Statistik group
 * 10. Statistik Master KPI
 * 11. Statistik penilaian
 * 12. Average KPI
 * 13. Pie distribusi anggota
 * 14. Pie kategori Master KPI
 * 15. Bar indikator Master KPI
 * 16. Bar statistik KPI
 * 17. Ringkasan
 * 18. Database info
 * 19. System status
 * 20. Chart.js loader
 * 21. Gradient chart
 * 22. Pseudo 3D visual
 * 23. Auto refresh
 * 24. Anti duplicate chart
 * 25. Anti duplicate timer
 *
 * ==========================================================
 */

(function () {

    "use strict";


    /* ======================================================
     * CONFIG
     * ======================================================
     */

    const CONFIG = {

        version:
            "6.2.0 Enterprise FINAL",

        refreshMinutes:
            5,

        apiTimeout:
            15000,

        apiRetryDelay:
            100,

        chartTimeout:
            10000,

        chartJsUrl:
            "https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js"

    };


    /* ======================================================
     * STATE
     * ======================================================
     */

    const state = {

        initialized:
            false,

        initializing:
            false,

        loading:
            false,

        data:
            null,

        charts:
            {},

        refreshTimer:
            null,

        lastRefresh:
            null,

        chartReady:
            false,

        apiReady:
            false

    };


    /* ======================================================
     * GLOBAL DASHBOARD OBJECT
     * ======================================================
     */

    const Dashboard = {

        version:
            CONFIG.version,

        state:
            state,

        init:
            initDashboard,

        render:
            renderDashboard,

        refresh:
            renderDashboard,

        getData:
            function () {

                return state.data;

            },

        getAPI:
            function () {

                return resolveAPI();

            }

    };


    window.Dashboard =
        Dashboard;


    /* ======================================================
     * LOGGER
     * ======================================================
     */

    function log() {

        try {

            console.log.apply(
                console,
                arguments
            );

        }

        catch (e) {}

    }


    function warn() {

        try {

            console.warn.apply(
                console,
                arguments
            );

        }

        catch (e) {}

    }


    function logError() {

        try {

            console.error.apply(
                console,
                arguments
            );

        }

        catch (e) {}

    }


    /* ======================================================
     * INIT
     * ======================================================
     */

    async function initDashboard() {

        if (
            state.initialized
        ) {

            log(
                "Dashboard sudah initialized."
            );

            return;

        }


        if (
            state.initializing
        ) {

            return;

        }


        state.initializing =
            true;


        log(
            "Guardian KPI Dashboard " +
            CONFIG.version
        );


        try {

            bindRefreshEvents();


            setupAutoRefresh();


            await renderDashboard();


            state.initialized =
                true;


            log(
                "Guardian KPI Dashboard initialized."
            );

        }

        catch (err) {

            logError(
                "Dashboard initialization error:",
                err
            );

        }

        finally {

            state.initializing =
                false;

        }

    }


    /* ======================================================
     * BIND REFRESH EVENTS
     * ======================================================
     */

    function bindRefreshEvents() {

        const selectors = [

            "[data-dashboard-refresh]",

            "#btnRefreshDashboard",

            "#refreshDashboard",

            "#btnRefresh"

        ];


        selectors.forEach(
            function (selector) {

                const elements =
                    document.querySelectorAll(
                        selector
                    );


                elements.forEach(
                    function (element) {

                        if (
                            element.dataset.dashboardBound ===
                            "true"
                        ) {

                            return;

                        }


                        element.dataset.dashboardBound =
                            "true";


                        element.addEventListener(
                            "click",
                            function () {

                                renderDashboard();

                            }
                        );

                    }
                );

            }
        );

    }


    /* ======================================================
     * MAIN DASHBOARD RENDER
     * ======================================================
     */

    async function renderDashboard() {

        if (
            state.loading
        ) {

            log(
                "Dashboard masih loading."
            );

            return;

        }


        state.loading =
            true;


        setLoadingState();


        try {

            log(
                "Dashboard V6.2: requesting data..."
            );


            /*
             * ==========================================
             * RESOLVE API
             * ==========================================
             */

            const api =
                await waitForAPI(
                    CONFIG.apiTimeout
                );


            if (
                !api
            ) {

                throw new Error(
                    "API tidak tersedia."
                );

            }


            if (
                typeof api.getDashboard !==
                "function"
            ) {

                throw new Error(
                    "API.getDashboard() tidak tersedia."
                );

            }


            state.apiReady =
                true;


            /*
             * ==========================================
             * REQUEST
             * ==========================================
             */

            const response =
                await api.getDashboard();


            log(
                "Dashboard API Response:",
                response
            );


            /*
             * ==========================================
             * NORMALIZE
             * ==========================================
             */

            const data =
                normalizeDashboardResponse(
                    response
                );


            if (
                !data ||
                typeof data !==
                "object"
            ) {

                throw new Error(
                    "Data Dashboard tidak valid."
                );

            }


            state.data =
                data;


            state.lastRefresh =
                new Date();


            /*
             * ==========================================
             * LOG DATA UTAMA
             * ==========================================
             */

            log(
                "Dashboard Data:",
                data
            );


            log(
                "Dashboard Statistics:",
                {

                    totalAnggota:
                        data.totalAnggota,

                    totalGroup:
                        data.totalGroup,

                    totalMasterKPI:
                        data.totalMasterKPI,

                    totalPenilaian:
                        data.totalPenilaian,

                    anggotaAktif:
                        data.anggotaAktif,

                    anggotaNonAktif:
                        data.anggotaNonAktif,

                    averageKPI:
                        data.averageKPI

                }
            );


            /*
             * ==========================================
             * RENDER CARDS
             * ==========================================
             */

            renderStatistics(
                data
            );


            /*
             * ==========================================
             * RENDER SUMMARY
             * ==========================================
             */

            renderSummary(
                data
            );


            /*
             * ==========================================
             * RENDER STATISTICS CHART
             * ==========================================
             */

            renderStatisticsChart(
                data
            );


            /*
             * ==========================================
             * RENDER DISTRIBUTION
             * ==========================================
             */

            renderDistributionChart(
                data
            );


            /*
             * ==========================================
             * RENDER MASTER KPI CATEGORY
             * ==========================================
             */

            renderMasterKPICategoryChart(
                data
            );


            /*
             * ==========================================
             * RENDER MASTER KPI INDICATOR
             * ==========================================
             */

            renderMasterKPIIndicatorChart(
                data
            );


            /*
             * ==========================================
             * DATABASE
             * ==========================================
             */

            renderDatabaseInfo(
                data
            );


            /*
             * ==========================================
             * SYSTEM
             * ==========================================
             */

            renderSystemStatus(
                data
            );


            /*
             * ==========================================
             * LAST UPDATE
             * ==========================================
             */

            renderLastUpdate(
                data
            );


            clearLoadingState();


            log(
                "Dashboard v6.2 render selesai."
            );

        }

        catch (err) {

            logError(
                "Dashboard render error:",
                err
            );


            renderError(
                err
            );

        }

        finally {

            state.loading =
                false;

        }

    }


    /* ======================================================
     * API RESOLVER
     * ======================================================
     *
     * Mencoba beberapa kemungkinan:
     *
     * 1. window.API
     * 2. globalThis.API
     * 3. global API
     * 4. Function global scope
     *
     * ======================================================
     */

    function resolveAPI() {

        /*
         * ----------------------------------------------
         * 1. window.API
         * ----------------------------------------------
         */

        try {

            if (
                window.API &&
                typeof window.API.getDashboard ===
                "function"
            ) {

                return window.API;

            }

        }

        catch (e) {}


        /*
         * ----------------------------------------------
         * 2. globalThis.API
         * ----------------------------------------------
         */

        try {

            if (
                globalThis.API &&
                typeof globalThis.API.getDashboard ===
                "function"
            ) {

                return globalThis.API;

            }

        }

        catch (e) {}


        /*
         * ----------------------------------------------
         * 3. Global lexical API
         *
         * Jika api.js menggunakan:
         *
         * const API = {...}
         *
         * ----------------------------------------------
         */

        try {

            if (
                typeof API !==
                "undefined"
            ) {

                if (
                    API &&
                    typeof API.getDashboard ===
                    "function"
                ) {

                    return API;

                }

            }

        }

        catch (e) {}


        /*
         * ----------------------------------------------
         * 4. Function global scope
         *
         * Dipakai sebagai fallback untuk
         * global lexical binding.
         * ----------------------------------------------
         */

        try {

            const globalAPI =
                Function(
                    "return typeof API !== 'undefined' ? API : null;"
                )();


            if (
                globalAPI &&
                typeof globalAPI.getDashboard ===
                "function"
            ) {

                return globalAPI;

            }

        }

        catch (e) {}


        /*
         * ----------------------------------------------
         * Tidak ditemukan.
         * ----------------------------------------------
         */

        return null;

    }


    /* ======================================================
     * WAIT FOR API
     * ======================================================
     */

    function waitForAPI(
        timeout
    ) {

        timeout =
            Number(
                timeout ||
                CONFIG.apiTimeout
            );


        return new Promise(
            function (
                resolve,
                reject
            ) {

                const started =
                    Date.now();


                let lastLog =
                    0;


                function check() {

                    const api =
                        resolveAPI();


                    if (
                        api &&
                        typeof api.getDashboard ===
                        "function"
                    ) {

                        log(
                            "API berhasil ditemukan."
                        );


                        resolve(
                            api
                        );


                        return;

                    }


                    const elapsed =
                        Date.now() -
                        started;


                    /*
                     * Log setiap 2 detik.
                     */

                    if (
                        elapsed -
                        lastLog >=
                        2000
                    ) {

                        lastLog =
                            elapsed;


                        log(
                            "Menunggu API...",
                            Math.round(
                                elapsed /
                                1000
                            ),
                            "detik"
                        );

                    }


                    if (
                        elapsed >=
                        timeout
                    ) {

                        reject(
                            new Error(
                                "API tidak tersedia setelah menunggu " +
                                Math.round(
                                    timeout /
                                    1000
                                ) +
                                " detik. Pastikan api.js sudah dimuat."
                            )
                        );


                        return;

                    }


                    setTimeout(
                        check,
                        CONFIG.apiRetryDelay
                    );

                }


                check();

            }
        );

    }


    /* ======================================================
     * NORMALIZE API RESPONSE
     * ======================================================
     */

    function normalizeDashboardResponse(
        response
    ) {

        if (
            !response
        ) {

            return null;

        }


        /*
         * ----------------------------------------------
         * Wrapper pertama
         * ----------------------------------------------
         */

        if (
            response.data &&
            typeof response.data ===
            "object"
        ) {

            /*
             * ------------------------------------------
             * Double wrapper:
             *
             * response.data.data
             * ------------------------------------------
             */

            if (
                response.data.data &&
                typeof response.data.data ===
                "object"
            ) {

                return response.data.data;

            }


            /*
             * ------------------------------------------
             * Single wrapper:
             *
             * response.data
             * ------------------------------------------
             */

            return response.data;

        }


        /*
         * ----------------------------------------------
         * Direct response
         * ----------------------------------------------
         */

        if (
            typeof response ===
            "object"
        ) {

            return response;

        }


        return null;

    }


    /* ======================================================
     * STATISTICS
     * ======================================================
     */

    function renderStatistics(
        data
    ) {

        setText(
            [
                "totalAnggota",
                "dashboardTotalAnggota",
                "statTotalAnggota"
            ],
            formatNumber(
                data.totalAnggota
            )
        );


        setText(
            [
                "anggotaAktif",
                "dashboardAnggotaAktif",
                "statAnggotaAktif"
            ],
            formatNumber(
                data.anggotaAktif
            )
        );


        setText(
            [
                "anggotaNonAktif",
                "dashboardAnggotaNonAktif",
                "statAnggotaNonAktif"
            ],
            formatNumber(
                data.anggotaNonAktif
            )
        );


        setText(
            [
                "totalGroup",
                "dashboardTotalGroup",
                "statTotalGroup"
            ],
            formatNumber(
                data.totalGroup
            )
        );


        setText(
            [
                "totalMasterKPI",
                "dashboardTotalMasterKPI",
                "statTotalMasterKPI"
            ],
            formatNumber(
                data.totalMasterKPI
            )
        );


        setText(
            [
                "totalPenilaian",
                "dashboardTotalPenilaian",
                "statTotalPenilaian"
            ],
            formatNumber(
                data.totalPenilaian
            )
        );


        setText(
            [
                "averageKPI",
                "dashboardAverageKPI",
                "statAverageKPI"
            ],
            formatDecimal(
                data.averageKPI
            )
        );


        setText(
            [
                "masterKPIAktif",
                "dashboardMasterKPIAktif"
            ],
            formatNumber(
                data.masterKPIAktif
            )
        );


        setText(
            [
                "masterKPINonAktif",
                "dashboardMasterKPINonAktif"
            ],
            formatNumber(
                data.masterKPINonAktif
            )
        );

    }


    /* ======================================================
     * SUMMARY
     * ======================================================
     */

    function renderSummary(
        data
    ) {

        const summary =
            data.ringkasan &&
            typeof data.ringkasan ===
            "object"
                ? data.ringkasan
                : {};


        setText(
            [
                "summaryTotalAnggota"
            ],
            formatNumber(
                valueOr(
                    summary.totalAnggota,
                    data.totalAnggota
                )
            )
        );


        setText(
            [
                "summaryAnggotaAktif"
            ],
            formatNumber(
                valueOr(
                    summary.anggotaAktif,
                    data.anggotaAktif
                )
            )
        );


        setText(
            [
                "summaryAnggotaNonAktif"
            ],
            formatNumber(
                valueOr(
                    summary.anggotaNonAktif,
                    data.anggotaNonAktif
                )
            )
        );


        setText(
            [
                "summaryTotalGroup"
            ],
            formatNumber(
                valueOr(
                    summary.totalGroup,
                    data.totalGroup
                )
            )
        );


        setText(
            [
                "summaryMasterKPI"
            ],
            formatNumber(
                valueOr(
                    summary.totalMasterKPI,
                    data.totalMasterKPI
                )
            )
        );


        setText(
            [
                "summaryTotalPenilaian"
            ],
            formatNumber(
                valueOr(
                    summary.totalPenilaian,
                    data.totalPenilaian
                )
            )
        );


        setText(
            [
                "summaryAverageKPI"
            ],
            formatDecimal(
                valueOr(
                    summary.averageKPI,
                    data.averageKPI
                )
            )
        );

    }


    /* ======================================================
     * STATISTICS BAR
     * ======================================================
     */

    function renderStatisticsChart(
        data
    ) {

        let stats =
            data.statistikKPI;


        if (
            !Array.isArray(
                stats
            ) ||
            stats.length ===
            0
        ) {

            stats = [

                {
                    label:
                        "Anggota",

                    value:
                        data.totalAnggota

                },

                {
                    label:
                        "Group",

                    value:
                        data.totalGroup

                },

                {
                    label:
                        "Master KPI",

                    value:
                        data.totalMasterKPI

                },

                {
                    label:
                        "Penilaian",

                    value:
                        data.totalPenilaian

                }

            ];

        }


        const labels =
            stats.map(
                function (item) {

                    return (
                        item.label ||
                        item.nama ||
                        ""
                    );

                }
            );


        const values =
            stats.map(
                function (item) {

                    return toNumber(
                        item.value ??
                        item.jumlah ??
                        item.count
                    );

                }
            );


        renderBarChart(
            [
                "dashboardChart",
                "statistikKPIChart"
            ],
            labels,
            values,
            "Statistik KPI"
        );

    }


    /* ======================================================
     * DISTRIBUTION ANGGOTA
     * ======================================================
     */

    function renderDistributionChart(
        data
    ) {

        let distribution =
            data.distribusiAnggota ||
            data.anggotaDistribution ||
            data.distribution;


        if (
            !Array.isArray(
                distribution
            ) ||
            distribution.length ===
            0
        ) {

            distribution = [

                {
                    label:
                        "Aktif",

                    value:
                        data.anggotaAktif

                },

                {
                    label:
                        "Non Aktif",

                    value:
                        data.anggotaNonAktif

                }

            ];

        }


        const labels =
            distribution.map(
                function (item) {

                    return (
                        item.label ||
                        item.nama ||
                        item.status ||
                        ""
                    );

                }
            );


        const values =
            distribution.map(
                function (item) {

                    return toNumber(
                        item.value ??
                        item.jumlah ??
                        item.count
                    );

                }
            );


        renderDoughnutChart(
            [
                "distributionChart",
                "distribusiChart",
                "dashboardPieChart"
            ],
            labels,
            values,
            "Anggota"
        );

    }


    /* ======================================================
     * MASTER KPI CATEGORY
     * ======================================================
     */

    function renderMasterKPICategoryChart(
        data
    ) {

        let kategori =
            data.masterKPIKategori ||
            data.kategoriMasterKPI ||
            data.categoryData ||
            data.kategori;


        /*
         * Fallback dari raw Master KPI.
         */

        if (
            !Array.isArray(
                kategori
            ) ||
            kategori.length ===
            0
        ) {

            kategori =
                buildCategoryFromRaw(
                    data.masterKPI ||
                    data.masterKPIData ||
                    data.kpi
                );

        }


        /*
         * Jika masih kosong.
         */

        if (
            !Array.isArray(
                kategori
            ) ||
            kategori.length ===
            0
        ) {

            log(
                "Kategori Master KPI belum tersedia."
            );


            showEmptyChart(
                [
                    "categoryMasterKPIChart",
                    "kategoriMasterKPIChart",
                    "masterKPIKategoriChart"
                ],
                "Data kategori Master KPI belum tersedia."
            );


            return;

        }


        const labels =
            kategori.map(
                function (item) {

                    return (
                        item.kategori ||
                        item.category ||
                        item.label ||
                        item.nama ||
                        ""
                    );

                }
            );


        const values =
            kategori.map(
                function (item) {

                    return toNumber(
                        item.jumlah ??
                        item.count ??
                        item.value ??
                        item.total
                    );

                }
            );


        log(
            "Master KPI kategori:",
            kategori
        );


        renderDoughnutChart(
            [
                "categoryMasterKPIChart",
                "kategoriMasterKPIChart",
                "masterKPIKategoriChart"
            ],
            labels,
            values,
            "Master KPI"
        );

    }


    /* ======================================================
     * MASTER KPI INDICATOR
     * ======================================================
     */

    function renderMasterKPIIndicatorChart(
        data
    ) {

        let indikator =
            data.masterKPIIndikator ||
            data.indikatorMasterKPI ||
            data.indicatorData ||
            data.indikator;


        /*
         * Fallback raw.
         */

        if (
            !Array.isArray(
                indikator
            ) ||
            indikator.length ===
            0
        ) {

            indikator =
                Array.isArray(
                    data.masterKPI
                )
                    ? data.masterKPI
                    : [];

        }


        if (
            !Array.isArray(
                indikator
            ) ||
            indikator.length ===
            0
        ) {

            log(
                "Indikator Master KPI belum tersedia."
            );


            showEmptyChart(
                [
                    "indicatorMasterKPIChart",
                    "indikatorMasterKPIChart",
                    "kpiChart"
                ],
                "Data indikator Master KPI belum tersedia."
            );


            return;

        }


        const labels =
            indikator.map(
                function (item) {

                    return (
                        item.indicator ||
                        item.indikator ||
                        item.nama ||
                        item.label ||
                        item.id ||
                        ""
                    );

                }
            );


        const values =
            indikator.map(
                function (item) {

                    return toNumber(
                        item.bobot ??
                        item.value ??
                        item.jumlah ??
                        item.count
                    );

                }
            );


        log(
            "Master KPI indikator:",
            indikator
        );


        renderHorizontalBarChart(
            [
                "indicatorMasterKPIChart",
                "indikatorMasterKPIChart",
                "kpiChart"
            ],
            labels,
            values,
            "Bobot KPI (%)"
        );

    }


    /* ======================================================
     * CHART.JS LOADER
     * ======================================================
     */

    function loadChartJS() {

        if (
            window.Chart
        ) {

            state.chartReady =
                true;


            return Promise.resolve(
                window.Chart
            );

        }


        return new Promise(
            function (
                resolve,
                reject
            ) {

                /*
                 * Jika script sudah ada.
                 */

                const existing =
                    document.querySelector(
                        'script[data-guardian-chartjs="true"]'
                    );


                if (
                    existing
                ) {

                    const started =
                        Date.now();


                    const timer =
                        setInterval(
                            function () {

                                if (
                                    window.Chart
                                ) {

                                    clearInterval(
                                        timer
                                    );


                                    state.chartReady =
                                        true;


                                    resolve(
                                        window.Chart
                                    );


                                    return;

                                }


                                if (
                                    Date.now() -
                                    started >
                                    CONFIG.chartTimeout
                                ) {

                                    clearInterval(
                                        timer
                                    );


                                    reject(
                                        new Error(
                                            "Chart.js tidak berhasil dimuat."
                                        )
                                    );

                                }

                            },
                            100
                        );


                    return;

                }


                /*
                 * Buat script.
                 */

                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    CONFIG.chartJsUrl;


                script.async =
                    true;


                script.dataset.guardianChartjs =
                    "true";


                script.onload =
                    function () {

                        if (
                            window.Chart
                        ) {

                            state.chartReady =
                                true;


                            log(
                                "Chart.js berhasil dimuat."
                            );


                            resolve(
                                window.Chart
                            );

                        }

                        else {

                            reject(
                                new Error(
                                    "Chart.js tidak tersedia."
                                )
                            );

                        }

                    };


                script.onerror =
                    function () {

                        reject(
                            new Error(
                                "Gagal memuat Chart.js."
                            )
                        );

                    };


                document.head.appendChild(
                    script
                );

            }
        );

    }


    /* ======================================================
     * DOUGHNUT
     * ======================================================
     */

    function renderDoughnutChart(
        canvasIds,
        labels,
        values,
        centerText
    ) {

        /*
         * Pastikan Chart.js.
         */

        if (
            !window.Chart
        ) {

            loadChartJS()
                .then(
                    function () {

                        renderDoughnutChart(
                            canvasIds,
                            labels,
                            values,
                            centerText
                        );

                    }
                )
                .catch(
                    function (err) {

                        warn(
                            err
                        );

                    }
                );


            return;

        }


        const canvas =
            findCanvas(
                canvasIds
            );


        if (
            !canvas
        ) {

            warn(
                "Canvas doughnut tidak ditemukan:",
                canvasIds
            );


            return;

        }


        destroyChart(
            canvas
        );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const gradients =
            createPieGradients(
                ctx,
                values.length
            );


        const total =
            values.reduce(
                function (
                    sum,
                    value
                ) {

                    return (
                        sum +
                        toNumber(
                            value
                        )
                    );

                },
                0
            );


        state.charts[
            canvas.id
        ] =
            new Chart(
                ctx,
                {

                    type:
                        "doughnut",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                data:
                                    values,

                                backgroundColor:
                                    gradients,

                                borderColor:
                                    "#07101f",

                                borderWidth:
                                    4,

                                spacing:
                                    2,

                                hoverOffset:
                                    14

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        cutout:
                            "56%",

                        animation: {

                            duration:
                                1200,

                            easing:
                                "easeOutQuart"

                        },

                        plugins: {

                            legend: {

                                position:
                                    "bottom",

                                labels: {

                                    color:
                                        "#d8e4ef",

                                    usePointStyle:
                                        true,

                                    pointStyle:
                                        "circle",

                                    padding:
                                        15

                                }

                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            const value =
                                                toNumber(
                                                    context.raw
                                                );


                                            const percent =
                                                total >
                                                0
                                                    ? (
                                                        value /
                                                        total *
                                                        100
                                                    ).toFixed(
                                                        1
                                                    )
                                                    : "0.0";


                                            return (
                                                " " +
                                                context.label +
                                                ": " +
                                                value +
                                                " (" +
                                                percent +
                                                "%)"
                                            );

                                        }

                                }

                            }

                        }

                    },

                    plugins: [

                        createCenterTextPlugin(
                            centerText
                        ),

                        createShadowPlugin()

                    ]

                }
            );

    }


    /* ======================================================
     * BAR
     * ======================================================
     */

    function renderBarChart(
        canvasIds,
        labels,
        values,
        title
    ) {

        if (
            !window.Chart
        ) {

            loadChartJS()
                .then(
                    function () {

                        renderBarChart(
                            canvasIds,
                            labels,
                            values,
                            title
                        );

                    }
                )
                .catch(
                    function (err) {

                        warn(
                            err
                        );

                    }
                );


            return;

        }


        const canvas =
            findCanvas(
                canvasIds
            );


        if (
            !canvas
        ) {

            warn(
                "Canvas bar tidak ditemukan:",
                canvasIds
            );


            return;

        }


        destroyChart(
            canvas
        );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                320
            );


        gradient.addColorStop(
            0,
            "#00e5ff"
        );


        gradient.addColorStop(
            0.45,
            "#1478ff"
        );


        gradient.addColorStop(
            1,
            "#163c9c"
        );


        state.charts[
            canvas.id
        ] =
            new Chart(
                ctx,
                {

                    type:
                        "bar",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                label:
                                    title,

                                data:
                                    values,

                                backgroundColor:
                                    gradient,

                                borderColor:
                                    "#00d9ff",

                                borderWidth:
                                    1,

                                borderRadius:
                                    8,

                                borderSkipped:
                                    false

                            }

                        ]

                    },

                    options: {

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        animation: {

                            duration:
                                1000,

                            easing:
                                "easeOutQuart"

                        },

                        plugins: {

                            legend: {

                                display:
                                    false

                            }

                        },

                        scales: {

                            x: {

                                ticks: {

                                    color:
                                        "#9baebe"

                                },

                                grid: {

                                    display:
                                        false

                                }

                            },

                            y: {

                                beginAtZero:
                                    true,

                                ticks: {

                                    color:
                                        "#9baebe"

                                },

                                grid: {

                                    color:
                                        "rgba(255,255,255,.07)"

                                }

                            }

                        }

                    },

                    plugins: [

                        createShadowPlugin()

                    ]

                }
            );

    }


    /* ======================================================
     * HORIZONTAL BAR
     * ======================================================
     */

    function renderHorizontalBarChart(
        canvasIds,
        labels,
        values,
        title
    ) {

        if (
            !window.Chart
        ) {

            loadChartJS()
                .then(
                    function () {

                        renderHorizontalBarChart(
                            canvasIds,
                            labels,
                            values,
                            title
                        );

                    }
                )
                .catch(
                    function (err) {

                        warn(
                            err
                        );

                    }
                );


            return;

        }


        const canvas =
            findCanvas(
                canvasIds
            );


        if (
            !canvas
        ) {

            warn(
                "Canvas horizontal bar tidak ditemukan:",
                canvasIds
            );


            return;

        }


        destroyChart(
            canvas
        );


        const ctx =
            canvas.getContext(
                "2d"
            );


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                canvas.width ||
                800,
                0
            );


        gradient.addColorStop(
            0,
            "#00c6ff"
        );


        gradient.addColorStop(
            0.5,
            "#1478ff"
        );


        gradient.addColorStop(
            1,
            "#7b4dff"
        );


        state.charts[
            canvas.id
        ] =
            new Chart(
                ctx,
                {

                    type:
                        "bar",

                    data: {

                        labels:
                            labels,

                        datasets: [

                            {

                                label:
                                    title,

                                data:
                                    values,

                                backgroundColor:
                                    gradient,

                                borderColor:
                                    "#00d9ff",

                                borderWidth:
                                    1,

                                borderRadius:
                                    7,

                                borderSkipped:
                                    false

                            }

                        ]

                    },

                    options: {

                        indexAxis:
                            "y",

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        animation: {

                            duration:
                                1100,

                            easing:
                                "easeOutQuart"

                        },

                        plugins: {

                            legend: {

                                display:
                                    false

                            },

                            tooltip: {

                                callbacks: {

                                    label:
                                        function (
                                            context
                                        ) {

                                            return (
                                                " Bobot: " +
                                                toNumber(
                                                    context.raw
                                                ) +
                                                "%"
                                            );

                                        }

                                }

                            }

                        },

                        scales: {

                            x: {

                                beginAtZero:
                                    true,

                                ticks: {

                                    color:
                                        "#9baebe",

                                    callback:
                                        function (
                                            value
                                        ) {

                                            return (
                                                value +
                                                "%"
                                            );

                                        }

                                },

                                grid: {

                                    color:
                                        "rgba(255,255,255,.07)"

                                }

                            },

                            y: {

                                ticks: {

                                    color:
                                        "#dce7f1",

                                    font: {

                                        size:
                                            11

                                    }

                                },

                                grid: {

                                    display:
                                        false

                                }

                            }

                        }

                    },

                    plugins: [

                        createShadowPlugin()

                    ]

                }
            );

    }


    /* ======================================================
     * FIND CANVAS
     * ======================================================
     */

    function findCanvas(
        ids
    ) {

        if (
            !Array.isArray(
                ids
            )
        ) {

            ids =
                [ids];

        }


        for (
            let i = 0;
            i < ids.length;
            i++
        ) {

            const element =
                document.getElementById(
                    ids[i]
                );


            if (
                !element
            ) {

                continue;

            }


            if (
                element.tagName &&
                element.tagName.toLowerCase() ===
                "canvas"
            ) {

                prepareCanvas(
                    element
                );


                return element;

            }


            const canvas =
                element.querySelector(
                    "canvas"
                );


            if (
                canvas
            ) {

                prepareCanvas(
                    canvas
                );


                return canvas;

            }

        }


        return null;

    }


    /* ======================================================
     * PREPARE CANVAS
     * ======================================================
     */

    function prepareCanvas(
        canvas
    ) {

        if (
            !canvas
        ) {

            return;

        }


        canvas.style.width =
            "100%";


        canvas.style.height =
            "100%";


        const parent =
            canvas.parentElement;


        if (
            parent &&
            parent.clientHeight <
            200
        ) {

            parent.style.minHeight =
                "280px";

        }

    }


    /* ======================================================
     * DESTROY CHART
     * ======================================================
     */

    function destroyChart(
        canvas
    ) {

        if (
            !canvas
        ) {

            return;

        }


        const chart =
            state.charts[
                canvas.id
            ];


        if (
            chart &&
            typeof chart.destroy ===
            "function"
        ) {

            try {

                chart.destroy();

            }

            catch (e) {}

        }


        delete state.charts[
            canvas.id
        ];

    }


    /* ======================================================
     * PIE GRADIENT
     * ======================================================
     */

    function createPieGradients(
        ctx,
        count
    ) {

        const palettes = [

            [
                "#00f5a0",
                "#00b894"
            ],

            [
                "#00c6ff",
                "#1478ff"
            ],

            [
                "#ffcf33",
                "#ff9800"
            ],

            [
                "#ff4d6d",
                "#d90429"
            ],

            [
                "#a855f7",
                "#6d28d9"
            ],

            [
                "#22d3ee",
                "#0284c7"
            ]

        ];


        const gradients =
            [];


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const palette =
                palettes[
                    i %
                    palettes.length
                ];


            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    280
                );


            gradient.addColorStop(
                0,
                palette[0]
            );


            gradient.addColorStop(
                1,
                palette[1]
            );


            gradients.push(
                gradient
            );

        }


        return gradients;

    }


    /* ======================================================
     * CENTER TEXT PLUGIN
     * ======================================================
     */

    function createCenterTextPlugin(
        text
    ) {

        return {

            id:
                "guardianCenterText",

            afterDraw:
                function (
                    chart
                ) {

                    if (
                        !chart.data.datasets.length
                    ) {

                        return;

                    }


                    const meta =
                        chart.getDatasetMeta(
                            0
                        );


                    if (
                        !meta ||
                        !meta.data ||
                        !meta.data.length
                    ) {

                        return;

                    }


                    const point =
                        meta.data[0];


                    const ctx =
                        chart.ctx;


                    const x =
                        point.x;


                    const y =
                        point.y;


                    const total =
                        chart.data.datasets[
                            0
                        ].data.reduce(
                            function (
                                sum,
                                value
                            ) {

                                return (
                                    sum +
                                    toNumber(
                                        value
                                    )
                                );

                            },
                            0
                        );


                    ctx.save();


                    ctx.textAlign =
                        "center";


                    ctx.textBaseline =
                        "middle";


                    ctx.shadowColor =
                        "rgba(0,0,0,.85)";


                    ctx.shadowBlur =
                        8;


                    ctx.font =
                        "bold 22px Arial";


                    ctx.fillStyle =
                        "#ffffff";


                    ctx.fillText(
                        String(
                            total
                        ),
                        x,
                        y - 7
                    );


                    ctx.shadowBlur =
                        0;


                    ctx.font =
                        "10px Arial";


                    ctx.fillStyle =
                        "#aab7c4";


                    ctx.fillText(
                        text ||
                        "",
                        x,
                        y + 14
                    );


                    ctx.restore();

                }

        };

    }


    /* ======================================================
     * SHADOW PLUGIN
     * ======================================================
     */

    function createShadowPlugin() {

        return {

            id:
                "guardianShadow",

            beforeDatasetsDraw:
                function (
                    chart
                ) {

                    chart.ctx.save();


                    chart.ctx.shadowColor =
                        "rgba(0,0,0,.35)";


                    chart.ctx.shadowBlur =
                        10;


                    chart.ctx.shadowOffsetX =
                        3;


                    chart.ctx.shadowOffsetY =
                        4;

                },


            afterDatasetsDraw:
                function (
                    chart
                ) {

                    chart.ctx.restore();

                }

        };

    }


    /* ======================================================
     * BUILD CATEGORY
     * ======================================================
     */

    function buildCategoryFromRaw(
        raw
    ) {

        if (
            !Array.isArray(
                raw
            )
        ) {

            return [];

        }


        const map =
            {};


        raw.forEach(
            function (item) {

                if (
                    !item ||
                    typeof item !==
                    "object"
                ) {

                    return;

                }


                const category =
                    String(
                        item.kategori ||
                        item.category ||
                        "Tanpa Kategori"
                    ).trim();


                if (
                    !map[category]
                ) {

                    map[category] =
                        0;

                }


                map[category]++;

            }
        );


        return Object.keys(
            map
        ).map(
            function (category) {

                return {

                    label:
                        category,

                    kategori:
                        category,

                    value:
                        map[category],

                    jumlah:
                        map[category]

                };

            }
        );

    }


    /* ======================================================
     * EMPTY CHART
     * ======================================================
     */

    function showEmptyChart(
        ids,
        message
    ) {

        const canvas =
            findCanvas(
                ids
            );


        if (
            !canvas
        ) {

            warn(
                message,
                ids
            );


            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        ctx.save();


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.font =
            "13px Arial";


        ctx.fillStyle =
            "#6f7f8f";


        ctx.fillText(
            message,
            canvas.width /
            2,
            canvas.height /
            2
        );


        ctx.restore();

    }


    /* ======================================================
     * DATABASE INFO
     * ======================================================
     */

    function renderDatabaseInfo(
        data
    ) {

        setText(
            [
                "dbTotalAnggota"
            ],
            formatNumber(
                data.totalAnggota
            )
        );


        setText(
            [
                "dbTotalGroup"
            ],
            formatNumber(
                data.totalGroup
            )
        );


        setText(
            [
                "dbTotalKPI",
                "dbTotalMasterKPI"
            ],
            formatNumber(
                data.totalMasterKPI
            )
        );


        setText(
            [
                "dbTotalPenilaian"
            ],
            formatNumber(
                data.totalPenilaian
            )
        );

    }


    /* ======================================================
     * SYSTEM STATUS
     * ======================================================
     */

    function renderSystemStatus(
        data
    ) {

        setText(
            [
                "systemStatus",
                "dashboardSystemStatus"
            ],
            "Online"
        );


        setText(
            [
                "systemDatabase",
                "dashboardDatabaseStatus"
            ],
            "Connected"
        );


        setText(
            [
                "systemAPI",
                "dashboardAPIStatus"
            ],
            "Connected"
        );


        setText(
            [
                "systemVersion",
                "dashboardSystemVersion"
            ],
            data.version ||
            CONFIG.version
        );

    }


    /* ======================================================
     * LAST UPDATE
     * ======================================================
     */

    function renderLastUpdate(
        data
    ) {

        const timestamp =
            data.generatedAt ||
            data.updatedAt ||
            new Date();


        setText(
            [
                "lastUpdate",
                "dashboardLastUpdate",
                "lastRefresh"
            ],
            formatDateTime(
                timestamp
            )
        );

    }


    /* ======================================================
     * AUTO REFRESH
     * ======================================================
     */

    function setupAutoRefresh() {

        /*
         * Clear timer sebelumnya.
         */

        if (
            state.refreshTimer
        ) {

            clearInterval(
                state.refreshTimer
            );


            state.refreshTimer =
                null;

        }


        const interval =
            CONFIG.refreshMinutes *
            60 *
            1000;


        state.refreshTimer =
            setInterval(
                function () {

                    log(
                        "Dashboard auto-refresh:",
                        CONFIG.refreshMinutes,
                        "menit"
                    );


                    renderDashboard();

                },
                interval
            );


        log(
            "Dashboard auto-refresh:",
            CONFIG.refreshMinutes,
            "menit"
        );

    }


    /* ======================================================
     * LOADING
     * ======================================================
     */

    function setLoadingState() {

        setText(
            [
                "dashboardLoading"
            ],
            "Memuat..."
        );

    }


    function clearLoadingState() {

        setText(
            [
                "dashboardLoading"
            ],
            ""
        );

    }


    /* ======================================================
     * ERROR
     * ======================================================
     */

    function renderError(
        err
    ) {

        const message =
            err &&
            err.message
                ? err.message
                : "Gagal memuat Dashboard.";


        setText(
            [
                "dashboardError"
            ],
            message
        );


        warn(
            "Dashboard error:",
            message
        );

    }


    /* ======================================================
     * SET TEXT
     * ======================================================
     */

    function setText(
        ids,
        value
    ) {

        if (
            !Array.isArray(
                ids
            )
        ) {

            ids =
                [ids];

        }


        ids.forEach(
            function (id) {

                const element =
                    document.getElementById(
                        id
                    );


                if (
                    element
                ) {

                    element.textContent =
                        value;

                }

            }
        );

    }


    /* ======================================================
     * VALUE OR
     * ======================================================
     */

    function valueOr(
        value,
        fallback
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return fallback;

        }


        return value;

    }


    /* ======================================================
     * NUMBER
     * ======================================================
     */

    function toNumber(
        value
    ) {

        if (
            value === undefined ||
            value === null ||
            value === ""
        ) {

            return 0;

        }


        if (
            typeof value ===
            "number"
        ) {

            return isFinite(
                value
            )
                ? value
                : 0;

        }


        let text =
            String(
                value
            ).trim();


        text =
            text.replace(
                "%",
                ""
            );


        if (
            text.indexOf(",") !==
            -1 &&
            text.indexOf(".") ===
            -1
        ) {

            text =
                text.replace(
                    ",",
                    "."
                );

        }


        const number =
            Number(
                text
            );


        return isFinite(
            number
        )
            ? number
            : 0;

    }


    /* ======================================================
     * FORMAT NUMBER
     * ======================================================
     */

    function formatNumber(
        value
    ) {

        return toNumber(
            value
        ).toLocaleString(
            "id-ID"
        );

    }


    /* ======================================================
     * FORMAT DECIMAL
     * ======================================================
     */

    function formatDecimal(
        value
    ) {

        return toNumber(
            value
        ).toLocaleString(
            "id-ID",
            {

                minimumFractionDigits:
                    2,

                maximumFractionDigits:
                    2

            }
        );

    }


    /* ======================================================
     * FORMAT DATE
     * ======================================================
     */

    function formatDateTime(
        value
    ) {

        try {

            const date =
                new Date(
                    value
                );


            if (
                isNaN(
                    date.getTime()
                )
            ) {

                return "-";

            }


            return date.toLocaleString(
                "id-ID",
                {

                    day:
                        "2-digit",

                    month:
                        "2-digit",

                    year:
                        "numeric",

                    hour:
                        "2-digit",

                    minute:
                        "2-digit",

                    second:
                        "2-digit"

                }
            );

        }

        catch (e) {

            return "-";

        }

    }


    /* ======================================================
     * PUBLIC GLOBAL FUNCTIONS
     * ======================================================
     */

    window.renderDashboard =
        renderDashboard;


    window.initDashboard =
        initDashboard;


    window.refreshDashboard =
        renderDashboard;


    window.getDashboardData =
        function () {

            return state.data;

        };


    window.getDashboardAPI =
        function () {

            return resolveAPI();

        };


    /* ======================================================
     * BOOT
     * ======================================================
     */

    function bootDashboard() {

        /*
         * Buffer kecil agar api.js
         * mempunyai waktu initialization.
         */

        setTimeout(
            function () {

                initDashboard();

            },
            150
        );

    }


    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            bootDashboard,
            {
                once: true
            }
        );

    }

    else {

        bootDashboard();

    }


})();
