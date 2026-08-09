/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : dashboard.js
 * Version : 6.0.0 Enterprise
 * ==========================================================
 *
 * Dashboard Frontend
 *
 * Fitur:
 * - API Dashboard
 * - Double-wrapper response support
 * - Statistik utama
 * - Distribusi Anggota
 * - Pie Kategori Master KPI
 * - Bar Indikator Master KPI
 * - Statistik KPI
 * - Ringkasan
 * - Chart.js auto loader
 * - Gradient / pseudo 3D visual
 * - Auto refresh
 * - Error handling
 * - Anti duplicate chart
 * - Anti duplicate interval
 * - Global Dashboard object
 *
 * ==========================================================
 */

(function () {

    "use strict";


    /* ======================================================
     * GLOBAL
     * ======================================================
     */

    const Dashboard = {

        version: "6.0.0 Enterprise",

        state: {

            initialized: false,

            loading: false,

            data: null,

            charts: {},

            refreshTimer: null,

            refreshMinutes: 5,

            chartReady: false

        }

    };


    window.Dashboard = Dashboard;


    /* ======================================================
     * LOG
     * ======================================================
     */

    function log() {

        try {

            console.log.apply(
                console,
                arguments
            );

        } catch (e) {}

    }


    function warn() {

        try {

            console.warn.apply(
                console,
                arguments
            );

        } catch (e) {}

    }


    function errorLog() {

        try {

            console.error.apply(
                console,
                arguments
            );

        } catch (e) {}

    }


    /* ======================================================
     * INIT
     * ======================================================
     */

    async function initDashboard() {

        if (
            Dashboard.state.initialized
        ) {

            log(
                "Guardian KPI Dashboard sudah initialized."
            );

            return;

        }


        Dashboard.state.initialized =
            true;


        log(
            "Guardian KPI Dashboard v6.0.0 Enterprise"
        );


        log(
            "Guardian KPI Dashboard initialized."
        );


        bindEvents();


        setupAutoRefresh();


        await renderDashboard();

    }


    /* ======================================================
     * BIND EVENTS
     * ======================================================
     */

    function bindEvents() {

        const buttons =
            document.querySelectorAll(
                "[data-dashboard-refresh]"
            );


        buttons.forEach(
            function (button) {

                button.onclick =
                    function () {

                        renderDashboard();

                    };

            }
        );


        const refreshButton =
            document.getElementById(
                "btnRefreshDashboard"
            );


        if (
            refreshButton
        ) {

            refreshButton.onclick =
                function () {

                    renderDashboard();

                };

        }

    }


    /* ======================================================
     * RENDER DASHBOARD
     * ======================================================
     */

    async function renderDashboard() {

        if (
            Dashboard.state.loading
        ) {

            log(
                "Dashboard sedang loading..."
            );

            return;

        }


        Dashboard.state.loading =
            true;


        setLoadingState();


        try {

            log(
                "Dashboard V6: requesting data..."
            );


            if (
                typeof window.API ===
                "undefined"
            ) {

                throw new Error(
                    "API tidak ditemukan. Pastikan api.js sudah dimuat."
                );

            }


            if (
                typeof API.getDashboard !==
                "function"
            ) {

                throw new Error(
                    "API.getDashboard() tidak tersedia."
                );

            }


            /*
             * ==============================================
             * API REQUEST
             * ==============================================
             */

            const response =
                await API.getDashboard();


            log(
                "Dashboard API Response:",
                response
            );


            /*
             * ==============================================
             * NORMALIZE RESPONSE
             * ==============================================
             */

            const data =
                normalizeDashboardResponse(
                    response
                );


            if (
                !data
            ) {

                throw new Error(
                    "Data Dashboard kosong."
                );

            }


            Dashboard.state.data =
                data;


            log(
                "Dashboard Data:",
                data
            );


            /*
             * ==============================================
             * RENDER
             * ==============================================
             */

            renderStatistics(
                data
            );


            renderSummary(
                data
            );


            renderStatisticsChart(
                data
            );


            await renderCharts(
                data
            );


            renderDatabaseInfo(
                data
            );


            renderSystemStatus(
                data
            );


            renderLastUpdate(
                data
            );


            clearLoadingState();


            log(
                "Dashboard v6 render selesai."
            );

        }


        catch (err) {

            errorLog(
                "Dashboard render error:",
                err
            );


            renderError(
                err
            );

        }


        finally {

            Dashboard.state.loading =
                false;

        }

    }


    /* ======================================================
     * NORMALIZE RESPONSE
     * ======================================================
     *
     * Mendukung:
     *
     * response.data
     *
     * dan:
     *
     * response.data.data
     *
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
         * Response:
         *
         * {
         *   success: true,
         *   data: {
         *      totalAnggota: 7
         *   }
         * }
         */

        if (
            response.data &&
            typeof response.data ===
                "object" &&
            response.data.totalAnggota !==
                undefined
        ) {

            return response.data;

        }


        /*
         * Double wrapper:
         *
         * {
         *   success: true,
         *   data: {
         *      success: true,
         *      data: {
         *          totalAnggota: 7
         *      }
         *   }
         * }
         */

        if (
            response.data &&
            response.data.data &&
            typeof response.data.data ===
                "object"
        ) {

            return response.data.data;

        }


        /*
         * Fallback:
         */

        if (
            response.data &&
            typeof response.data ===
                "object"
        ) {

            return response.data;

        }


        return response;

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


        /*
         * Master KPI aktif
         */

        setText(
            [
                "masterKPIAktif",
                "dashboardMasterKPIAktif"
            ],
            formatNumber(
                data.masterKPIAktif
            )
        );


        /*
         * Master KPI non aktif
         */

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
            data.ringkasan ||
            {};


        setText(
            [
                "summaryTotalAnggota"
            ],
            formatNumber(
                summary.totalAnggota ??
                data.totalAnggota
            )
        );


        setText(
            [
                "summaryAnggotaAktif"
            ],
            formatNumber(
                summary.anggotaAktif ??
                data.anggotaAktif
            )
        );


        setText(
            [
                "summaryAnggotaNonAktif"
            ],
            formatNumber(
                summary.anggotaNonAktif ??
                data.anggotaNonAktif
            )
        );


        setText(
            [
                "summaryTotalGroup"
            ],
            formatNumber(
                summary.totalGroup ??
                data.totalGroup
            )
        );


        setText(
            [
                "summaryMasterKPI"
            ],
            formatNumber(
                summary.totalMasterKPI ??
                data.totalMasterKPI
            )
        );


        setText(
            [
                "summaryTotalPenilaian"
            ],
            formatNumber(
                summary.totalPenilaian ??
                data.totalPenilaian
            )
        );


        setText(
            [
                "summaryAverageKPI"
            ],
            formatDecimal(
                summary.averageKPI ??
                data.averageKPI
            )
        );

    }


    /* ======================================================
     * STATISTICS CHART
     * ======================================================
     */

    function renderStatisticsChart(
        data
    ) {

        const stats =
            Array.isArray(
                data.statistikKPI
            )
                ? data.statistikKPI
                : [

                    {
                        label:
                            "Anggota",

                        value:
                            toNumber(
                                data.totalAnggota
                            )

                    },

                    {
                        label:
                            "Group",

                        value:
                            toNumber(
                                data.totalGroup
                            )

                    },

                    {
                        label:
                            "Master KPI",

                        value:
                            toNumber(
                                data.totalMasterKPI
                            )

                    },

                    {
                        label:
                            "Penilaian",

                        value:
                            toNumber(
                                data.totalPenilaian
                            )

                    }

                ];


        renderBarChart(
            "dashboardChart",
            stats.map(
                item =>
                    item.label
            ),
            stats.map(
                item =>
                    toNumber(
                        item.value
                    )
            ),
            "Statistik KPI",
            [
                "#00c6ff",
                "#ffbd00",
                "#1478ff",
                "#20a464"
            ]
        );

    }


    /* ======================================================
     * CHARTS
     * ======================================================
     */

    async function renderCharts(
        data
    ) {

        await loadChartJS();


        /*
         * Distribusi anggota
         */

        renderDistributionChart(
            data
        );


        /*
         * Kategori Master KPI
         */

        renderKategoriChart(
            data
        );


        /*
         * Indikator Master KPI
         */

        renderIndikatorChart(
            data
        );

    }


    /* ======================================================
     * LOAD CHART.JS
     * ======================================================
     */

    function loadChartJS() {

        if (
            window.Chart
        ) {

            Dashboard.state.chartReady =
                true;

            return Promise.resolve();

        }


        return new Promise(
            function (
                resolve,
                reject
            ) {

                /*
                 * Jangan membuat script ganda
                 */

                const existing =
                    document.querySelector(
                        'script[data-guardian-chartjs="true"]'
                    );


                if (
                    existing
                ) {

                    existing.addEventListener(
                        "load",
                        function () {

                            Dashboard.state.chartReady =
                                true;

                            resolve();

                        }
                    );


                    existing.addEventListener(
                        "error",
                        function () {

                            reject(
                                new Error(
                                    "Chart.js gagal dimuat."
                                )
                            );

                        }
                    );


                    return;

                }


                const script =
                    document.createElement(
                        "script"
                    );


                script.src =
                    "https://cdn.jsdelivr.net/npm/chart.js@4.4.9/dist/chart.umd.min.js";


                script.async =
                    true;


                script.dataset.guardianChartjs =
                    "true";


                script.onload =
                    function () {

                        if (
                            window.Chart
                        ) {

                            Dashboard.state.chartReady =
                                true;

                            log(
                                "Chart.js berhasil dimuat."
                            );

                            resolve();

                        } else {

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
                                "Gagal memuat Chart.js dari CDN."
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
     * DISTRIBUTION CHART
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
            )
        ) {

            distribution = [

                {
                    label: "Aktif",

                    value:
                        toNumber(
                            data.anggotaAktif
                        )

                },

                {
                    label: "Non Aktif",

                    value:
                        toNumber(
                            data.anggotaNonAktif
                        )

                }

            ];

        }


        const labels =
            distribution.map(
                item =>
                    item.label ||
                    item.nama ||
                    ""
            );


        const values =
            distribution.map(
                item =>
                    toNumber(
                        item.value ??
                        item.jumlah ??
                        item.count
                    )
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
     * KATEGORI MASTER KPI
     * ======================================================
     */

    function renderKategoriChart(
        data
    ) {

        let kategori =
            data.masterKPIKategori ||
            data.kategoriMasterKPI ||
            data.categoryData;


        /*
         * Fallback langsung dari raw Master KPI
         */

        if (
            !Array.isArray(kategori) ||
            kategori.length === 0
        ) {

            kategori =
                buildKategoriFromRaw(
                    data.masterKPI
                );

        }


        if (
            !Array.isArray(kategori) ||
            kategori.length === 0
        ) {

            showChartEmpty(
                [
                    "categoryMasterKPIChart",
                    "kategoriMasterKPIChart"
                ],
                "Data kategori Master KPI belum tersedia."
            );

            return;

        }


        const labels =
            kategori.map(
                item =>
                    item.kategori ||
                    item.label ||
                    ""
            );


        const values =
            kategori.map(
                item =>
                    toNumber(
                        item.jumlah ??
                        item.count ??
                        item.value
                    )
            );


        /*
         * Canvas:
         *
         * categoryMasterKPIChart
         * kategoriMasterKPIChart
         * masterKPIKategoriChart
         */

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


        markChartAvailable(
            [
                "categoryMasterKPIChart",
                "kategoriMasterKPIChart",
                "masterKPIKategoriChart"
            ]
        );

    }


    /* ======================================================
     * INDIKATOR MASTER KPI
     * ======================================================
     */

    function renderIndikatorChart(
        data
    ) {

        let indikator =
            data.masterKPIIndikator ||
            data.indikatorMasterKPI ||
            data.indicatorData;


        /*
         * Fallback raw
         */

        if (
            !Array.isArray(indikator) ||
            indikator.length === 0
        ) {

            indikator =
                Array.isArray(
                    data.masterKPI
                )
                    ? data.masterKPI
                    : [];

        }


        if (
            !indikator.length
        ) {

            showChartEmpty(
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
                item =>
                    item.indicator ||
                    item.indikator ||
                    item.nama ||
                    item.id ||
                    ""
            );


        const values =
            indikator.map(
                item =>
                    toNumber(
                        item.bobot
                    )
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
     * DOUGHNUT CHART
     * ======================================================
     */

    function renderDoughnutChart(
        canvasIds,
        labels,
        values,
        centerText
    ) {

        if (
            !window.Chart
        ) {

            warn(
                "Chart.js tidak tersedia."
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
                "Canvas tidak ditemukan:",
                canvasIds
            );

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        destroyChart(
            canvas
        );


        /*
         * Gradient
         */

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

                    return sum +
                        toNumber(
                            value
                        );

                },
                0
            );


        Dashboard.state.charts[
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

                                hoverOffset:
                                    14,

                                spacing:
                                    2

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
                                        16

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


                                            const percentage =
                                                total > 0
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
                                                percentage +
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
     * BAR CHART
     * ======================================================
     */

    function renderBarChart(
        canvasId,
        labels,
        values,
        title,
        colors
    ) {

        if (
            !window.Chart
        ) {

            return;

        }


        const canvas =
            findCanvas(
                Array.isArray(
                    canvasId
                )
                    ? canvasId
                    : [canvasId]
            );


        if (
            !canvas
        ) {

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        destroyChart(
            canvas
        );


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                canvas.height ||
                    300
            );


        gradient.addColorStop(
            0,
            "#00e5ff"
        );


        gradient.addColorStop(
            0.5,
            "#1478ff"
        );


        gradient.addColorStop(
            1,
            "#143a9a"
        );


        Dashboard.state.charts[
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
                                    colors &&
                                    colors.length
                                        ? colors
                                        : gradient,

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
                                        "#9fb0c0"

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
                                        "#9fb0c0"

                                },

                                grid: {

                                    color:
                                        "rgba(255,255,255,0.08)"

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
        label
    ) {

        if (
            !window.Chart
        ) {

            return;

        }


        const canvas =
            findCanvas(
                canvasIds
            );


        if (
            !canvas
        ) {

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        destroyChart(
            canvas
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
            "#7a4cff"
        );


        Dashboard.state.charts[
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
                                    label,

                                data:
                                    values,

                                backgroundColor:
                                    gradient,

                                borderColor:
                                    "#00c6ff",

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

                        indexAxis:
                            "y",

                        responsive:
                            true,

                        maintainAspectRatio:
                            false,

                        animation: {

                            duration:
                                1200,

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

                                max:
                                    20,

                                ticks: {

                                    color:
                                        "#9fb0c0",

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
                                        "rgba(255,255,255,0.08)"

                                }

                            },

                            y: {

                                ticks: {

                                    color:
                                        "#dce7f1",

                                    font: {

                                        size:
                                            12

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
            !Array.isArray(ids)
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
                element
            ) {

                if (
                    element.tagName
                        .toLowerCase() ===
                    "canvas"
                ) {

                    ensureCanvasSize(
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

                    ensureCanvasSize(
                        canvas
                    );

                    return canvas;

                }

            }

        }


        return null;

    }


    /* ======================================================
     * ENSURE CANVAS SIZE
     * ======================================================
     */

    function ensureCanvasSize(
        canvas
    ) {

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


        canvas.style.width =
            "100%";

        canvas.style.height =
            "100%";

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


        const existing =
            Dashboard.state.charts[
                canvas.id
            ];


        if (
            existing &&
            typeof existing.destroy ===
                "function"
        ) {

            try {

                existing.destroy();

            } catch (e) {}

        }


        delete Dashboard.state.charts[
            canvas.id
        ];

    }


    /* ======================================================
     * PIE GRADIENTS
     * ======================================================
     */

    function createPieGradients(
        ctx,
        count
    ) {

        const colors = [

            [
                "#00f5a0",
                "#00c6ff"
            ],

            [
                "#1478ff",
                "#6246ea"
            ],

            [
                "#ffbd00",
                "#ff6b00"
            ],

            [
                "#ff3d71",
                "#c9184a"
            ],

            [
                "#00d9ff",
                "#0077b6"
            ],

            [
                "#a855f7",
                "#6d28d9"
            ]

        ];


        const result = [];


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const pair =
                colors[
                    i %
                    colors.length
                ];


            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    250
                );


            gradient.addColorStop(
                0,
                pair[0]
            );


            gradient.addColorStop(
                1,
                pair[1]
            );


            result.push(
                gradient
            );

        }


        return result;

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

                    const ctx =
                        chart.ctx;


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


                    const first =
                        meta.data[0];


                    const x =
                        first.x;


                    const y =
                        first.y;


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


                    ctx.font =
                        "bold 22px Arial";


                    ctx.fillStyle =
                        "#ffffff";


                    ctx.shadowColor =
                        "rgba(0,0,0,0.8)";


                    ctx.shadowBlur =
                        8;


                    ctx.fillText(
                        String(total),
                        x,
                        y - 6
                    );


                    ctx.shadowBlur =
                        0;


                    ctx.font =
                        "10px Arial";


                    ctx.fillStyle =
                        "#9fb0c0";


                    ctx.fillText(
                        text || "",
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

                    const ctx =
                        chart.ctx;


                    ctx.save();


                    ctx.shadowColor =
                        "rgba(0,0,0,0.35)";


                    ctx.shadowBlur =
                        12;


                    ctx.shadowOffsetX =
                        3;


                    ctx.shadowOffsetY =
                        5;

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
     * BUILD KATEGORI FROM RAW
     * ======================================================
     */

    function buildKategoriFromRaw(
        raw
    ) {

        if (
            !Array.isArray(raw)
        ) {

            return [];

        }


        const map = {};


        raw.forEach(
            function (item) {

                const kategori =
                    String(
                        item.kategori ||
                        "Tanpa Kategori"
                    ).trim();


                if (
                    !map[kategori]
                ) {

                    map[kategori] =
                        0;

                }


                map[kategori]++;

            }
        );


        return Object.keys(
            map
        ).map(
            function (kategori) {

                return {

                    kategori:
                        kategori,

                    jumlah:
                        map[kategori]

                };

            }
        );

    }


    /* ======================================================
     * CHART EMPTY
     * ======================================================
     */

    function showChartEmpty(
        ids,
        message
    ) {

        const canvas =
            findCanvas(
                ids
            );


        if (
            canvas
        ) {

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


            ctx.fillStyle =
                "#6f7f8f";


            ctx.font =
                "14px Arial";


            ctx.textAlign =
                "center";


            ctx.textBaseline =
                "middle";


            ctx.fillText(
                message,
                canvas.width / 2,
                canvas.height / 2
            );


            ctx.restore();

            return;

        }


        /*
         * Kalau canvas belum ada,
         * coba cari host berdasarkan
         * ID panel.
         */

        const host =
            findChartHost(
                ids
            );


        if (
            host
        ) {

            host.innerHTML =
                '<div style="' +
                'display:flex;' +
                'align-items:center;' +
                'justify-content:center;' +
                'height:240px;' +
                'color:#718096;' +
                'font-size:14px;' +
                '">' +
                escapeHTML(
                    message
                ) +
                "</div>";

        }

    }


    /* ======================================================
     * MARK CHART AVAILABLE
     * ======================================================
     */

    function markChartAvailable(
        ids
    ) {

        ids.forEach(
            function (id) {

                const el =
                    document.getElementById(
                        id
                    );


                if (
                    el
                ) {

                    el.dataset.chartReady =
                        "true";

                }

            }
        );

    }


    /* ======================================================
     * FIND CHART HOST
     * ======================================================
     */

    function findChartHost(
        ids
    ) {

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
                element
            ) {

                return element;

            }

        }


        /*
         * Cari berdasarkan text heading
         */

        const headings =
            Array.from(
                document.querySelectorAll(
                    "h2,h3,h4,h5,.card-title"
                )
            );


        const keywords = [

            "kategori master kpi",

            "indikator master kpi",

            "distribusi data"

        ];


        for (
            let i = 0;
            i < headings.length;
            i++
        ) {

            const text =
                dashboardNormalize(
                    headings[i]
                        .textContent
                );


            for (
                let j = 0;
                j < keywords.length;
                j++
            ) {

                if (
                    text.indexOf(
                        keywords[j]
                    ) !== -1
                ) {

                    return (
                        headings[i]
                            .closest(
                                ".card,.dashboard-card,.chart-card"
                            ) ||
                        headings[i].parentElement
                    );

                }

            }

        }


        return null;

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
                "dbTotalKPI"
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
                "systemVersion",
                "dashboardSystemVersion"
            ],
            data.version ||
            Dashboard.version
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

    }


    /* ======================================================
     * LAST UPDATE
     * ======================================================
     */

    function renderLastUpdate(
        data
    ) {

        const value =
            data.generatedAt ||
            data.updatedAt ||
            new Date().toISOString();


        const formatted =
            formatDateTime(
                value
            );


        setText(
            [
                "lastUpdate",
                "dashboardLastUpdate",
                "lastRefresh"
            ],
            formatted
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


        warn(
            "Dashboard error:",
            message
        );


        setText(
            [
                "dashboardError"
            ],
            message
        );


        /*
         * Jangan menghapus data chart
         * yang sudah berhasil dirender.
         */

    }


    /* ======================================================
     * AUTO REFRESH
     * ======================================================
     */

    function setupAutoRefresh() {

        /*
         * Hapus timer lama
         */

        if (
            Dashboard.state.refreshTimer
        ) {

            clearInterval(
                Dashboard.state.refreshTimer
            );

        }


        const milliseconds =
            Dashboard.state.refreshMinutes *
            60 *
            1000;


        Dashboard.state.refreshTimer =
            setInterval(
                function () {

                    log(
                        "Dashboard auto-refresh:",
                        Dashboard.state.refreshMinutes,
                        "menit"
                    );


                    renderDashboard();

                },
                milliseconds
            );


        log(
            "Dashboard auto-refresh:",
            Dashboard.state.refreshMinutes,
            "menit"
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
            !Array.isArray(ids)
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
     * NUMBER
     * ======================================================
     */

    function toNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return 0;

        }


        const n =
            Number(
                String(value)
                    .replace(
                        "%",
                        ""
                    )
                    .replace(
                        ",",
                        "."
                    )
            );


        return isFinite(n)
            ? n
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

                return String(
                    value || "-"
                );

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

            return String(
                value || "-"
            );

        }

    }


    /* ======================================================
     * ESCAPE HTML
     * ======================================================
     */

    function escapeHTML(
        value
    ) {

        return String(
            value
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


    /* ======================================================
     * NORMALIZE TEXT
     * ======================================================
     */

    function dashboardNormalize(
        value
    ) {

        return String(
            value || ""
        )
            .trim()
            .toLowerCase();

    }


    /* ======================================================
     * PUBLIC API
     * ======================================================
     */

    window.renderDashboard =
        renderDashboard;


    window.initDashboard =
        initDashboard;


    window.refreshDashboard =
        function () {

            return renderDashboard();

        };


    window.getDashboardState =
        function () {

            return Dashboard.state;

        };


    /* ======================================================
     * DOM READY
     * ======================================================
     */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                initDashboard();

            },
            {
                once: true
            }
        );

    } else {

        initDashboard();

    }


})();
