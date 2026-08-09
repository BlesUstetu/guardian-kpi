/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : js/dashboard.js
 * Version : 5.0.0 Enterprise
 * Author  : BlesProduction
 * ==========================================================
 *
 * Dashboard Analytics Controller
 *
 * Chart:
 * 1. Statistik KPI
 * 2. Distribusi Anggota
 * 3. Kategori Master KPI
 * 4. Indikator Master KPI
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * DASHBOARD
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

        chartRetryCount: 0,

        charts: {

            statistics: null,

            distribution: null,

            category: null,

            indicator: null

        },

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

        counterDuration: 600,

        animationDuration: 900

    },


    /* ======================================================
     * INIT
     * ======================================================
     */

    async init() {

        if (this.state.initialized) {

            return this.refresh();

        }

        this.state.initialized = true;

        console.log(
            "Guardian KPI Dashboard v5 initialized."
        );

        await this.load();

        this.startAutoRefresh();

    },


    /* ======================================================
     * LOAD
     * ======================================================
     */

    async load() {

        if (this.state.loading) {

            console.warn(
                "Dashboard request sedang berjalan."
            );

            return;

        }


        if (
            typeof API === "undefined" ||
            typeof API.getDashboard !== "function"
        ) {

            this.showError(
                "API.getDashboard() tidak tersedia."
            );

            console.error(
                "API.getDashboard() tidak ditemukan."
            );

            return;

        }


        this.state.loading = true;

        this.setLoading(true);


        try {

            console.log(
                "Dashboard v5: requesting data..."
            );


            const response =
                await API.getDashboard();


            console.log(
                "Dashboard API Response:",
                response
            );


            if (!response) {

                throw new Error(
                    "Response Dashboard kosong."
                );

            }


            if (!response.success) {

                throw new Error(
                    response.message ||
                    "Gagal mengambil Dashboard."
                );

            }


            /*
             * SEMUA komponen Dashboard mengambil
             * data dari response.data yang sama.
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

        catch(error) {

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

            /* ----------------------------------------------
             * STATISTIK
             * ---------------------------------------------- */

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
                ),


            /* ----------------------------------------------
             * MASTER KPI
             * ---------------------------------------------- */

            masterKPIAktif:
                this.toNumber(
                    data.masterKPIAktif
                ),

            masterKPINonAktif:
                this.toNumber(
                    data.masterKPINonAktif
                ),


            /* ----------------------------------------------
             * CATEGORY
             * ---------------------------------------------- */

            categoryAvailable:
                Boolean(
                    data.categoryAvailable
                ),

            masterKPIKategori:
                Array.isArray(
                    data.masterKPIKategori
                )
                    ? data.masterKPIKategori
                    : [],


            /* ----------------------------------------------
             * INDICATOR
             * ---------------------------------------------- */

            masterKPIIndikator:
                Array.isArray(
                    data.masterKPIIndikator
                )
                    ? data.masterKPIIndikator
                    : [],


            /* ----------------------------------------------
             * METADATA
             * ---------------------------------------------- */

            generatedAt:
                data.generatedAt ||
                null

        };

    },


    /* ======================================================
     * MAIN RENDER
     * ======================================================
     */

    render() {

        const data =
            this.state.data;


        /*
         * Statistik
         */

        this.renderStatistics(
            data
        );


        /*
         * Distribusi anggota
         */

        this.renderDistribution(
            data
        );


        /*
         * Kategori Master KPI
         */

        this.renderCategory(
            data
        );


        /*
         * Indikator Master KPI
         */

        this.renderIndicators(
            data
        );


        /*
         * Ringkasan
         */

        this.renderSummary(
            data
        );


        /*
         * Aktivitas
         */

        this.renderActivity(
            data
        );


        /*
         * Sistem
         */

        this.renderSystemStatus();


        /*
         * Waktu generate
         */

        this.renderGeneratedAt(
            data
        );


        /*
         * Chart
         */

        this.renderCharts();


        console.log(
            "Dashboard v5 render selesai."
        );

    },


    /* ======================================================
     * STATISTICS CHART
     * ======================================================
     */

    renderStatistics(data) {

        const canvas =
            document.getElementById(
                "dashboardChart"
            );


        if (!canvas) {

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        this.destroyChart(
            "statistics"
        );


        /*
         * Gradient helper.
         */

        const gradient1 =
            this.createGradient(
                ctx,
                "#00d4ff",
                "#0066ff"
            );


        const gradient2 =
            this.createGradient(
                ctx,
                "#00ff9d",
                "#008f5a"
            );


        const gradient3 =
            this.createGradient(
                ctx,
                "#ffd166",
                "#d68b00"
            );


        const gradient4 =
            this.createGradient(
                ctx,
                "#a855f7",
                "#5b21b6"
            );


        this.state.charts.statistics =
            new Chart(

                ctx,

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
                                    "Jumlah",

                                data: [

                                    data.totalAnggota,

                                    data.totalGroup,

                                    data.totalMasterKPI,

                                    data.totalPenilaian

                                ],


                                backgroundColor: [

                                    gradient1,

                                    gradient2,

                                    gradient3,

                                    gradient4

                                ],


                                borderColor: [

                                    "#00d4ff",

                                    "#00ff9d",

                                    "#ffd166",

                                    "#a855f7"

                                ],


                                borderWidth: 1,


                                borderRadius: 10,


                                borderSkipped: false,


                                barPercentage: 0.65,


                                categoryPercentage: 0.7

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        animation: {

                            duration:
                                this.config.animationDuration,

                            easing:
                                "easeOutQuart"

                        },


                        plugins: {

                            legend: {

                                display: false

                            },


                            tooltip: {

                                enabled: true,

                                callbacks: {

                                    label:
                                        function(context) {

                                            return (
                                                " " +
                                                context.parsed.y
                                            );

                                        }

                                }

                            }

                        },


                        scales: {

                            x: {

                                grid: {

                                    display: false

                                },

                                ticks: {

                                    color: "#adb5bd",

                                    font: {

                                        weight:
                                            "600"

                                    }

                                }

                            },


                            y: {

                                beginAtZero: true,

                                ticks: {

                                    precision: 0,

                                    color: "#adb5bd"

                                },

                                grid: {

                                    color:
                                        "rgba(255,255,255,0.07)"

                                }

                            }

                        }

                    },


                    plugins: [

                        this.createBarValuePlugin()

                    ]

                }

            );

    },


    /* ======================================================
     * DISTRIBUTION CHART
     * ======================================================
     */

    renderDistribution(data) {

        const canvas =
            document.getElementById(
                "dashboardPieChart"
            );


        if (!canvas) {

            return;

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        this.destroyChart(
            "distribution"
        );


        const values = [

            data.anggotaAktif,

            data.anggotaNonAktif

        ];


        /*
         * Jika semuanya 0, tampilkan placeholder.
         */

        const total =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        if (total === 0) {

            this.renderEmptyChart(
                canvas,
                "Belum ada data anggota."
            );

            return;

        }


        this.state.charts.distribution =
            new Chart(

                ctx,

                {

                    type: "doughnut",


                    data: {

                        labels: [

                            "Aktif",

                            "Non Aktif"

                        ],


                        datasets: [

                            {

                                data: values,


                                backgroundColor: [

                                    this.createGradient(
                                        ctx,
                                        "#00ff9d",
                                        "#008f5a"
                                    ),

                                    this.createGradient(
                                        ctx,
                                        "#ff5c7a",
                                        "#a00025"
                                    )

                                ],


                                borderColor: "#111827",


                                borderWidth: 4,


                                hoverOffset: 12,


                                spacing: 2

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        cutout: "58%",


                        rotation:
                            -25,


                        animation: {

                            duration:
                                this.config.animationDuration,

                            animateRotate: true,

                            animateScale: true

                        },


                        plugins: {

                            legend: {

                                position: "bottom",


                                labels: {

                                    color: "#dee2e6",

                                    padding: 18,

                                    usePointStyle: true,

                                    pointStyle:
                                        "circle"

                                }

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(context) {

                                            const value =
                                                Number(
                                                    context.raw ||
                                                    0
                                                );

                                            const percent =
                                                total > 0
                                                    ? (
                                                        value /
                                                        total *
                                                        100
                                                    ).toFixed(1)
                                                    : 0;

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

                        this.createCenterTextPlugin(
                            "Anggota",
                            total
                        )

                    ]

                }

            );

    },


    /* ======================================================
     * CATEGORY PIE CHART
     * ======================================================
     */

    renderCategory(data) {

        const canvas =
            document.getElementById(
                "dashboardKategoriChart"
            );


        const status =
            document.getElementById(
                "kategoriKPIStatus"
            );


        const notice =
            document.getElementById(
                "kategoriKPINotice"
            );


        if (!canvas) {

            return;

        }


        this.destroyChart(
            "category"
        );


        const categories =
            Array.isArray(
                data.masterKPIKategori
            )
                ? data.masterKPIKategori
                : [];


        /*
         * Tidak ada data kategori.
         */

        if (
            !data.categoryAvailable ||
            categories.length === 0
        ) {

            if (status) {

                status.textContent =
                    "Belum tersedia";

                status.className =
                    "badge bg-secondary";

            }


            if (notice) {

                notice.classList.remove(
                    "d-none"
                );

            }


            canvas.style.display =
                "none";


            return;

        }


        canvas.style.display =
            "block";


        if (notice) {

            notice.classList.add(
                "d-none"
            );

        }


        if (status) {

            status.textContent =
                categories.length +
                " kategori";

            status.className =
                "badge bg-info";

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        const colors =
            this.getChartColors(
                categories.length
            );


        const background =
            colors.map(
                color => {

                    return this.createGradient(
                        ctx,
                        color.light,
                        color.dark
                    );

                }
            );


        const labels =
            categories.map(
                item =>
                    String(
                        item.kategori ||
                        "Tanpa Kategori"
                    )
            );


        const values =
            categories.map(
                item =>
                    this.toNumber(
                        item.jumlah
                    )
            );


        const total =
            values.reduce(
                (sum, value) =>
                    sum + value,
                0
            );


        this.state.charts.category =
            new Chart(

                ctx,

                {

                    type: "pie",


                    data: {

                        labels: labels,


                        datasets: [

                            {

                                data: values,


                                backgroundColor:
                                    background,


                                borderColor:
                                    "#111827",


                                borderWidth: 3,


                                hoverOffset: 15,


                                spacing: 2

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio: false,


                        animation: {

                            duration:
                                this.config.animationDuration,

                            animateRotate: true,

                            animateScale: true

                        },


                        plugins: {

                            legend: {

                                position: "right",


                                labels: {

                                    color: "#dee2e6",

                                    padding: 14,

                                    usePointStyle: true,

                                    pointStyle:
                                        "circle"

                                }

                            },


                            tooltip: {

                                callbacks: {

                                    label:
                                        function(context) {

                                            const value =
                                                Number(
                                                    context.raw ||
                                                    0
                                                );

                                            const percent =
                                                total > 0
                                                    ? (
                                                        value /
                                                        total *
                                                        100
                                                    ).toFixed(1)
                                                    : 0;

                                            return (
                                                " " +
                                                context.label +
                                                ": " +
                                                value +
                                                " KPI (" +
                                                percent +
                                                "%)"
                                            );

                                        }

                                }

                            }

                        }

                    },

                    plugins: [

                        this.createPieDepthPlugin()

                    ]

                }

            );

    },


    /* ======================================================
     * INDICATOR HORIZONTAL BAR
     * ======================================================
     */

    renderIndicators(data) {

        const canvas =
            document.getElementById(
                "dashboardIndikatorChart"
            );


        const status =
            document.getElementById(
                "indikatorKPIStatus"
            );


        if (!canvas) {

            return;

        }


        this.destroyChart(
            "indicator"
        );


        const indicators =
            Array.isArray(
                data.masterKPIIndikator
            )
                ? data.masterKPIIndikator
                : [];


        if (
            indicators.length === 0
        ) {

            if (status) {

                status.textContent =
                    "Belum ada data";

                status.className =
                    "badge bg-secondary";

            }


            this.renderEmptyChart(
                canvas,
                "Belum ada indikator Master KPI."
            );

            return;

        }


        if (status) {

            status.textContent =
                indicators.length +
                " indikator";

            status.className =
                "badge bg-info";

        }


        const ctx =
            canvas.getContext(
                "2d"
            );


        const labels =
            indicators.map(
                item => {

                    const id =
                        String(
                            item.id || ""
                        ).trim();


                    const name =
                        String(
                            item.indikator ||
                            "KPI Tanpa Nama"
                        ).trim();


                    if (id) {

                        return (
                            id +
                            " — " +
                            name
                        );

                    }


                    return name;

                }
            );


        const values =
            indicators.map(
                item =>
                    this.toNumber(
                        item.bobot
                    )
            );


        /*
         * Gradient horizontal.
         */

        const gradient =
            this.createGradient(
                ctx,
                "#00d4ff",
                "#7c3aed"
            );


        this.state.charts.indicator =
            new Chart(

                ctx,

                {

                    type: "bar",


                    data: {

                        labels: labels,


                        datasets: [

                            {

                                label:
                                    "Bobot (%)",

                                data: values,


                                backgroundColor:
                                    gradient,


                                borderColor:
                                    "#00d4ff",


                                borderWidth: 1,


                                borderRadius: 8,


                                borderSkipped: false

                            }

                        ]

                    },


                    options: {

                        indexAxis: "y",


                        responsive: true,

                        maintainAspectRatio: false,


                        animation: {

                            duration:
                                this.config.animationDuration,

                            easing:
                                "easeOutQuart"

                        },


                        plugins: {

                            legend: {

                                display: false

                            },


                            tooltip: {

                                callbacks: {

                                    title:
                                        function(items) {

                                            return items[0]
                                                ?.label ||
                                                "";

                                        },


                                    label:
                                        function(context) {

                                            return (
                                                " Bobot: " +
                                                context.parsed.x +
                                                "%"
                                            );

                                        }

                                }

                            }

                        },


                        scales: {

                            x: {

                                beginAtZero: true,

                                suggestedMax: 100,

                                ticks: {

                                    color: "#adb5bd",

                                    callback:
                                        function(value) {

                                            return value +
                                                "%";

                                        }

                                },

                                grid: {

                                    color:
                                        "rgba(255,255,255,0.07)"

                                }

                            },


                            y: {

                                ticks: {

                                    color: "#dee2e6",

                                    font: {

                                        size: 11

                                    }

                                },

                                grid: {

                                    display: false

                                }

                            }

                        }

                    },


                    plugins: [

                        this.createHorizontalValuePlugin()

                    ]

                }

            );

    },


    /* ======================================================
     * RENDER SUMMARY
     * ======================================================
     */

    renderSummary(data) {

        this.setText(
            "summaryTotalAnggota",
            data.totalAnggota
        );


        this.setText(
            "summaryAnggotaAktif",
            data.anggotaAktif
        );


        this.setText(
            "summaryTotalGroup",
            data.totalGroup
        );


        this.setText(
            "summaryTotalMasterKPI",
            data.totalMasterKPI
        );


        this.setText(
            "summaryTotalPenilaian",
            data.totalPenilaian
        );

    },


    /* ======================================================
     * RENDER ACTIVITY
     * ======================================================
     */

    renderActivity(data) {

        const element =
            document.getElementById(
                "dashboardActivity"
            );


        if (!element) {

            return;

        }


        const now =
            new Date().toLocaleString(
                "id-ID"
            );


        /*
         * dashboard.html v5 menggunakan DIV,
         * bukan tbody.
         */

        element.innerHTML = `

            <div class="d-flex
                        justify-content-between
                        align-items-center
                        border-bottom
                        border-secondary
                        py-2">

                <div>

                    <i class="bi
                              bi-check-circle-fill
                              text-success
                              me-2"></i>

                    Dashboard berhasil diperbarui.

                </div>

                <small class="text-secondary">

                    ${this.escapeHTML(now)}

                </small>

            </div>


            <div class="d-flex
                        justify-content-between
                        align-items-center
                        border-bottom
                        border-secondary
                        py-2">

                <div>

                    <i class="bi
                              bi-people-fill
                              text-info
                              me-2"></i>

                    Total Anggota

                </div>

                <strong>

                    ${data.totalAnggota}

                </strong>

            </div>


            <div class="d-flex
                        justify-content-between
                        align-items-center
                        border-bottom
                        border-secondary
                        py-2">

                <div>

                    <i class="bi
                              bi-bar-chart-fill
                              text-warning
                              me-2"></i>

                    Master KPI

                </div>

                <strong>

                    ${data.totalMasterKPI}

                </strong>

            </div>


            <div class="d-flex
                        justify-content-between
                        align-items-center
                        py-2">

                <div>

                    <i class="bi
                              bi-clipboard-check-fill
                              text-primary
                              me-2"></i>

                    Total Penilaian

                </div>

                <strong>

                    ${data.totalPenilaian}

                </strong>

            </div>

        `;

    },


    /* ======================================================
     * SYSTEM STATUS
     * ======================================================
     */

    renderSystemStatus() {

        this.setBadge(
            "systemAPIStatus",
            "Online",
            "bg-success"
        );


        this.setBadge(
            "systemDatabaseStatus",
            "Online",
            "bg-success"
        );


        this.setBadge(
            "systemDashboardStatus",
            "Online",
            "bg-success"
        );

    },


    /* ======================================================
     * GENERATED AT
     * ======================================================
     */

    renderGeneratedAt(data) {

        const element =
            document.getElementById(
                "dashboardGeneratedAt"
            );


        if (!element) {

            return;

        }


        let date;


        if (data.generatedAt) {

            date =
                new Date(
                    data.generatedAt
                );

        }
        else {

            date =
                new Date();

        }


        if (
            isNaN(
                date.getTime()
            )
        ) {

            date =
                new Date();

        }


        element.textContent =
            "Update: " +
            date.toLocaleString(
                "id-ID"
            );

    },


    /* ======================================================
     * RENDER ALL CHARTS
     * ======================================================
     */

    renderCharts() {

        if (
            typeof Chart ===
            "undefined"
        ) {

            console.warn(
                "Chart.js belum tersedia."
            );

            this.retryCharts();

            return;

        }


        this.stopChartRetry();


        this.renderStatistics(
            this.state.data
        );


        this.renderDistribution(
            this.state.data
        );


        this.renderCategory(
            this.state.data
        );


        this.renderIndicators(
            this.state.data
        );

    },


    /* ======================================================
     * CHART RETRY
     * ======================================================
     */

    retryCharts() {

        if (
            this.state.chartRetryTimer
        ) {

            return;

        }


        this.state.chartRetryCount = 0;


        this.state.chartRetryTimer =
            setInterval(
                () => {

                    this.state.chartRetryCount++;


                    if (
                        typeof Chart !==
                        "undefined"
                    ) {

                        this.stopChartRetry();

                        this.renderCharts();

                        return;

                    }


                    if (
                        this.state.chartRetryCount >=
                        this.config.chartRetryLimit
                    ) {

                        this.stopChartRetry();

                        console.warn(
                            "Chart.js tidak tersedia."
                        );

                    }

                },

                this.config.chartRetryDelay

            );

    },


    /* ======================================================
     * STOP CHART RETRY
     * ======================================================
     */

    stopChartRetry() {

        if (
            this.state.chartRetryTimer
        ) {

            clearInterval(
                this.state.chartRetryTimer
            );

            this.state.chartRetryTimer =
                null;

        }

        this.state.chartRetryCount =
            0;

    },


    /* ======================================================
     * CREATE GRADIENT
     * ======================================================
     */

    createGradient(
        ctx,
        start,
        end
    ) {

        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                350
            );


        gradient.addColorStop(
            0,
            start
        );


        gradient.addColorStop(
            0.45,
            start
        );


        gradient.addColorStop(
            1,
            end
        );


        return gradient;

    },


    /* ======================================================
     * CHART COLORS
     * ======================================================
     */

    getChartColors(count) {

        const palette = [

            {
                light: "#00d4ff",
                dark: "#0066ff"
            },

            {
                light: "#00ff9d",
                dark: "#008f5a"
            },

            {
                light: "#ffd166",
                dark: "#d68b00"
            },

            {
                light: "#ff5c8a",
                dark: "#a00035"
            },

            {
                light: "#a855f7",
                dark: "#5b21b6"
            },

            {
                light: "#ff8a3d",
                dark: "#b23c00"
            },

            {
                light: "#38bdf8",
                dark: "#075985"
            },

            {
                light: "#f472b6",
                dark: "#9d174d"
            },

            {
                light: "#4ade80",
                dark: "#166534"
            },

            {
                light: "#facc15",
                dark: "#854d0e"
            }

        ];


        const result = [];


        for(
            let i = 0;
            i < count;
            i++
        ){

            result.push(
                palette[
                    i %
                    palette.length
                ]
            );

        }


        return result;

    },


    /* ======================================================
     * BAR VALUE PLUGIN
     * ======================================================
     */

    createBarValuePlugin() {

        return {

            id:
                "guardianBarValue",


            afterDatasetsDraw:
                function(chart) {

                    const ctx =
                        chart.ctx;


                    ctx.save();


                    chart.data.datasets
                        .forEach(
                            function(dataset, datasetIndex) {

                                const meta =
                                    chart.getDatasetMeta(
                                        datasetIndex
                                    );


                                meta.data.forEach(
                                    function(
                                        bar,
                                        index
                                    ){

                                        const value =
                                            dataset.data[
                                                index
                                            ];


                                        if (
                                            value ===
                                            undefined
                                        ) {

                                            return;

                                        }


                                        ctx.fillStyle =
                                            "#ffffff";


                                        ctx.font =
                                            "600 12px Arial";


                                        ctx.textAlign =
                                            "center";


                                        ctx.textBaseline =
                                            "bottom";


                                        ctx.shadowColor =
                                            "rgba(0,0,0,0.8)";


                                        ctx.shadowBlur =
                                            4;


                                        ctx.fillText(

                                            String(
                                                value
                                            ),

                                            bar.x,

                                            bar.y - 8

                                        );

                                    }
                                );

                            }
                        );


                    ctx.restore();

                }

        };

    },


    /* ======================================================
     * HORIZONTAL VALUE PLUGIN
     * ======================================================
     */

    createHorizontalValuePlugin() {

        return {

            id:
                "guardianHorizontalValue",


            afterDatasetsDraw:
                function(chart) {

                    const ctx =
                        chart.ctx;


                    ctx.save();


                    const meta =
                        chart.getDatasetMeta(
                            0
                        );


                    meta.data.forEach(
                        function(
                            bar,
                            index
                        ){

                            const value =
                                chart.data
                                    .datasets[0]
                                    .data[index];


                            ctx.fillStyle =
                                "#ffffff";


                            ctx.font =
                                "600 11px Arial";


                            ctx.textAlign =
                                "left";


                            ctx.textBaseline =
                                "middle";


                            ctx.shadowColor =
                                "rgba(0,0,0,0.8)";


                            ctx.shadowBlur =
                                4;


                            ctx.fillText(

                                String(
                                    value
                                ) +
                                "%",

                                bar.x + 8,

                                bar.y

                            );

                        }
                    );


                    ctx.restore();

                }

        };

    },


    /* ======================================================
     * CENTER TEXT PLUGIN
     * ======================================================
     */

    createCenterTextPlugin(
        title,
        value
    ) {

        return {

            id:
                "guardianCenterText",


            afterDraw:
                function(chart) {

                    const ctx =
                        chart.ctx;


                    const area =
                        chart.chartArea;


                    if (!area) {

                        return;

                    }


                    const x =
                        (
                            area.left +
                            area.right
                        ) / 2;


                    const y =
                        (
                            area.top +
                            area.bottom
                        ) / 2;


                    ctx.save();


                    ctx.textAlign =
                        "center";


                    ctx.textBaseline =
                        "middle";


                    ctx.fillStyle =
                        "#ffffff";


                    ctx.font =
                        "700 28px Arial";


                    ctx.shadowColor =
                        "rgba(0,0,0,0.8)";


                    ctx.shadowBlur =
                        5;


                    ctx.fillText(
                        String(value),
                        x,
                        y - 7
                    );


                    ctx.fillStyle =
                        "#adb5bd";


                    ctx.font =
                        "500 11px Arial";


                    ctx.fillText(
                        title,
                        x,
                        y + 18
                    );


                    ctx.restore();

                }

        };

    },


    /* ======================================================
     * PIE DEPTH / 3D LOOK
     * ======================================================
     */

    createPieDepthPlugin() {

        return {

            id:
                "guardianPieDepth",


            beforeDatasetDraw:
                function(chart) {

                    const ctx =
                        chart.ctx;


                    const meta =
                        chart.getDatasetMeta(
                            0
                        );


                    if (
                        !meta ||
                        !meta.data
                    ) {

                        return;

                    }


                    /*
                     * Efek depth halus.
                     *
                     * Chart.js tetap merender
                     * pie utama. Kita hanya memberikan
                     * shadow/depth pada canvas.
                     */

                    ctx.save();


                    ctx.shadowColor =
                        "rgba(0,0,0,0.55)";


                    ctx.shadowBlur =
                        12;


                    ctx.shadowOffsetY =
                        7;


                    ctx.shadowOffsetX =
                        0;


                    ctx.restore();

                }

        };

    },


    /* ======================================================
     * EMPTY CHART
     * ======================================================
     */

    renderEmptyChart(
        canvas,
        message
    ) {

        if (!canvas) {

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


        const width =
            canvas.clientWidth ||
            400;


        const height =
            canvas.clientHeight ||
            250;


        ctx.save();


        ctx.fillStyle =
            "#6c757d";


        ctx.font =
            "500 14px Arial";


        ctx.textAlign =
            "center";


        ctx.textBaseline =
            "middle";


        ctx.fillText(

            message,

            width / 2,

            height / 2

        );


        ctx.restore();

    },


    /* ======================================================
     * DESTROY ONE CHART
     * ======================================================
     */

    destroyChart(name) {

        const chart =
            this.state.charts[name];


        if (chart) {

            try {

                chart.destroy();

            }
            catch(error) {

                console.warn(
                    "Chart destroy error:",
                    error
                );

            }

        }


        this.state.charts[name] =
            null;

    },


    /* ======================================================
     * DESTROY ALL CHARTS
     * ======================================================
     */

    destroyCharts() {

        Object.keys(
            this.state.charts
        )
        .forEach(
            name => {

                this.destroyChart(
                    name
                );

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

                    if (
                        this.isDashboardVisible()
                    ) {

                        this.refresh();

                    }
                    else {

                        this.stopAutoRefresh();

                    }

                },

                minutes *
                60 *
                1000

            );


        console.log(

            "Dashboard auto-refresh:",
            minutes,
            "menit"

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
     * DASHBOARD VISIBLE
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

            button.disabled =
                true;


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

            button.disabled =
                false;


            button.innerHTML = `

                <i
                    class="bi bi-arrow-clockwise">
                </i>

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


        const activity =
            document.getElementById(
                "dashboardActivity"
            );


        if (activity) {

            activity.innerHTML = `

                <div class="alert
                            alert-danger
                            mb-0">

                    <i class="bi
                              bi-exclamation-triangle-fill
                              me-2"></i>

                    ${this.escapeHTML(
                        message
                    )}

                </div>

            `;

        }


        this.setBadge(
            "systemAPIStatus",
            "Error",
            "bg-danger"
        );


        this.setBadge(
            "systemDashboardStatus",
            "Error",
            "bg-danger"
        );

    },


    /* ======================================================
     * SET TEXT
     * ======================================================
     */

    setText(id, value) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {

            return;

        }


        element.textContent =
            value ?? 0;

    },


    /* ======================================================
     * SET BADGE
     * ======================================================
     */

    setBadge(
        id,
        text,
        className
    ) {

        const element =
            document.getElementById(
                id
            );


        if (!element) {

            return;

        }


        element.textContent =
            text;


        element.className =
            "badge " +
            className;

    },


    /* ======================================================
     * NUMBER
     * ======================================================
     */

    toNumber(value) {

        const number =
            Number(value);


        return Number.isFinite(
            number
        )
            ? number
            : 0;

    },


    /* ======================================================
     * ESCAPE HTML
     * ======================================================
     */

    escapeHTML(value) {

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

    },


    /* ======================================================
     * DESTROY DASHBOARD
     * ======================================================
     */

    destroy() {

        this.stopAutoRefresh();

        this.stopChartRetry();

        this.destroyCharts();


        Object.values(
            this.state.counterTimers
        )
        .forEach(
            timer =>
                clearInterval(timer)
        );


        this.state.counterTimers =
            {};


        this.state.initialized =
            false;


        this.state.data =
            {};


        console.log(
            "Dashboard v5 destroyed."
        );

    }

};


/* ==========================================================
 * GLOBAL COMPATIBILITY FUNCTIONS
 *
 * Tetap dipertahankan karena dashboard.html dan
 * app.js mungkin memanggil fungsi global.
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

        Dashboard.config
            .autoRefreshMinutes =
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
 * Guardian KPI menggunakan loadPage().
 * Dashboard bisa dimasukkan ke DOM setelah DOMContentLoaded.
 * ==========================================================
 */

let dashboardObserver =
    null;


function startDashboardObserver() {

    if (
        Dashboard.isDashboardVisible()
    ) {

        Dashboard.init();

        return;

    }


    if (dashboardObserver) {

        return;

    }


    dashboardObserver =
        new MutationObserver(
            function() {

                if (
                    Dashboard.isDashboardVisible()
                ) {

                    Dashboard.init();


                    dashboardObserver
                        .disconnect();


                    dashboardObserver =
                        null;

                }

            }
        );


    if (document.body) {

        dashboardObserver.observe(

            document.body,

            {

                childList: true,

                subtree: true

            }

        );

    }

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
        function() {

            startDashboardObserver();

        }
    );

}
else {

    startDashboardObserver();

}


/* ==========================================================
 * PAGE SHOW
 * ==========================================================
 */

window.addEventListener(
    "pageshow",
    function() {

        if (
            Dashboard.isDashboardVisible() &&
            !Dashboard.state.initialized
        ) {

            Dashboard.init();

        }

    }
);


/* ==========================================================
 * PAGE HIDE
 * ==========================================================
 */

window.addEventListener(
    "pagehide",
    function() {

        Dashboard.stopAutoRefresh();

    }
);


/* ==========================================================
 * VERSION
 * ==========================================================
 */

console.log(
    "%cGuardian KPI Dashboard v5.0.0 Enterprise",
    "color:#00d4ff;font-weight:bold;font-size:14px"
);
