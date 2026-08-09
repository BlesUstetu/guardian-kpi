/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : dashboard.js
 * Version : 7.0.1 Enterprise FINAL
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL
 * ==========================================================
 */

let dashboardData = null;

const dashboardCharts = {};

let dashboardLoading = false;

let dashboardInitialized = false;

let dashboardRefreshTimer = null;


/* ==========================================================
 * INIT
 * ==========================================================
 */

function initDashboard() {

    if (dashboardInitialized) {
        return;
    }

    dashboardInitialized = true;

    console.log(
        "Guardian KPI Dashboard v7.0.1"
    );

    bindRefreshButton();

    loadDashboard();

    startAutoRefresh();
}


/* ==========================================================
 * DOM READY
 * ==========================================================
 */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initDashboard,
        {
            once: true
        }
    );

} else {

    initDashboard();

}


/* ==========================================================
 * LOAD DASHBOARD
 * ==========================================================
 */

async function loadDashboard() {

    if (dashboardLoading) {
        return;
    }

    dashboardLoading = true;

    setLoading(true);

    try {

        /*
         * Tunggu API.
         */

        const api = await waitForAPI();

        if (
            !api ||
            typeof api.getDashboard !== "function"
        ) {

            throw new Error(
                "API.getDashboard tidak tersedia."
            );

        }

        /*
         * Ambil data.
         */

        const result =
            await api.getDashboard();

        console.log(
            "Dashboard API Response:",
            result
        );

        /*
         * Validasi.
         */

        if (!result) {

            throw new Error(
                "Response Dashboard kosong."
            );

        }

        if (
            result.success === false
        ) {

            throw new Error(
                result.message ||
                "Dashboard API gagal."
            );

        }

        /*
         * Dashboard.gs menggunakan:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {...}
         * }
         */

        let data =
            result.data;

        /*
         * Antisipasi wrapper tambahan.
         */

        if (
            data &&
            data.data &&
            typeof data.data === "object"
        ) {

            data =
                data.data;

        }

        if (
            !data ||
            typeof data !== "object"
        ) {

            throw new Error(
                "Data Dashboard tidak valid."
            );

        }

        dashboardData =
            normalizeDashboardData(data);

        console.log(
            "Dashboard Data:",
            dashboardData
        );

        console.log(
            "Kategori Master KPI:",
            dashboardData.masterKPIKategori
        );

        console.log(
            "Indikator Master KPI:",
            dashboardData.masterKPIIndikator
        );

        renderDashboard(
            dashboardData
        );

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );

        showError(
            error.message
        );

    }

    finally {

        dashboardLoading = false;

        setLoading(false);

    }

}


/* ==========================================================
 * WAIT API
 * ==========================================================
 */

function waitForAPI(
    timeout = 15000
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const start =
                Date.now();

            function check() {

                if (
                    window.API &&
                    typeof window.API.getDashboard ===
                    "function"
                ) {

                    resolve(
                        window.API
                    );

                    return;

                }

                if (
                    Date.now() -
                    start >=
                    timeout
                ) {

                    reject(
                        new Error(
                            "API.getDashboard tidak tersedia setelah menunggu 15 detik."
                        )
                    );

                    return;

                }

                setTimeout(
                    check,
                    250
                );

            }

            check();

        }
    );

}


/* ==========================================================
 * NORMALIZE DATA
 * ==========================================================
 */

function normalizeDashboardData(
    data
) {

    const d =
        data || {};

    d.totalAnggota =
        number(
            d.totalAnggota
        );

    d.totalGroup =
        number(
            d.totalGroup
        );

    d.totalMasterKPI =
        number(
            d.totalMasterKPI
        );

    d.totalPenilaian =
        number(
            d.totalPenilaian
        );

    d.anggotaAktif =
        number(
            d.anggotaAktif
        );

    d.anggotaNonAktif =
        number(
            d.anggotaNonAktif
        );

    d.masterKPIAktif =
        number(
            d.masterKPIAktif
        );

    d.masterKPINonAktif =
        number(
            d.masterKPINonAktif
        );

    d.averageKPI =
        number(
            d.averageKPI
        );


    /*
     * Statistik.
     */

    d.statistikKPI =
        normalizeArray(
            d.statistikKPI
        );


    if (
        d.statistikKPI.length === 0
    ) {

        d.statistikKPI = [

            {
                label:
                    "Anggota",

                value:
                    d.totalAnggota

            },

            {
                label:
                    "Group",

                value:
                    d.totalGroup

            },

            {
                label:
                    "Master KPI",

                value:
                    d.totalMasterKPI

            },

            {
                label:
                    "Penilaian",

                value:
                    d.totalPenilaian

            }

        ];

    }


    /*
     * Distribusi anggota.
     */

    d.distribusiAnggota =
        normalizeArray(
            d.distribusiAnggota ||
            d.anggotaDistribution ||
            []
        );


    /*
     * Kategori Master KPI.
     */

    d.masterKPIKategori =
        normalizeCategory(
            d.masterKPIKategori ||
            d.kategoriMasterKPI ||
            []
        );


    /*
     * Indikator Master KPI.
     */

    d.masterKPIIndikator =
        normalizeIndicators(
            d.masterKPIIndikator ||
            d.indikatorMasterKPI ||
            []
        );


    return d;

}


/* ==========================================================
 * NORMALIZE ARRAY
 * ==========================================================
 */

function normalizeArray(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }

    return source.map(
        function (item) {

            return {

                label:
                    String(
                        item.label ||
                        item.nama ||
                        item.status ||
                        ""
                    ),

                value:
                    number(
                        item.value ??
                        item.jumlah ??
                        item.count
                    )

            };

        }
    );

}


/* ==========================================================
 * NORMALIZE CATEGORY
 * ==========================================================
 */

function normalizeCategory(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }

    return source.map(
        function (item) {

            return {

                label:
                    String(
                        item.label ||
                        item.kategori ||
                        item.category ||
                        ""
                    ),

                value:
                    number(
                        item.value ??
                        item.jumlah ??
                        item.count
                    )

            };

        }
    )
    .filter(
        function (item) {

            return item.label !== "";

        }
    );

}


/* ==========================================================
 * NORMALIZE INDICATORS
 * ==========================================================
 */

function normalizeIndicators(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }

    return source.map(
        function (item) {

            const label =
                item.indicator ||
                item.indikator ||
                item.nama ||
                item.label ||
                item.id ||
                "";

            return {

                id:
                    String(
                        item.id ||
                        ""
                    ),

                label:
                    String(
                        label
                    ),

                indicator:
                    String(
                        label
                    ),

                kategori:
                    String(
                        item.kategori ||
                        item.category ||
                        ""
                    ),

                bobot:
                    number(
                        item.bobot
                    ),

                target:
                    number(
                        item.target
                    ),

                status:
                    String(
                        item.status ||
                        ""
                    )

            };

        }
    )
    .filter(
        function (item) {

            return item.label !== "";

        }
    );

}


/* ==========================================================
 * RENDER DASHBOARD
 * ==========================================================
 */

function renderDashboard(
    data
) {

    if (!data) {
        return;
    }

    renderCards(data);

    renderSummary(data);

    renderStatistikChart(
        data.statistikKPI
    );

    renderAnggotaChart(
        data.distribusiAnggota
    );

    renderKategoriChart(
        data.masterKPIKategori
    );

    renderIndikatorChart(
        data.masterKPIIndikator
    );

    renderSystem(data);

    console.log(
        "Dashboard render selesai."
    );

}


/* ==========================================================
 * CARDS
 * ==========================================================
 */

function renderCards(
    data
) {

    setText(
        [
            "totalAnggota",
            "dashboardTotalAnggota",
            "cardTotalAnggota"
        ],
        formatNumber(
            data.totalAnggota
        )
    );

    setText(
        [
            "anggotaAktif",
            "dashboardAnggotaAktif",
            "cardAnggotaAktif"
        ],
        formatNumber(
            data.anggotaAktif
        )
    );

    setText(
        [
            "anggotaNonAktif",
            "dashboardAnggotaNonAktif",
            "cardAnggotaNonAktif"
        ],
        formatNumber(
            data.anggotaNonAktif
        )
    );

    setText(
        [
            "totalGroup",
            "dashboardTotalGroup",
            "cardTotalGroup"
        ],
        formatNumber(
            data.totalGroup
        )
    );

    setText(
        [
            "totalMasterKPI",
            "dashboardTotalMasterKPI",
            "cardTotalMasterKPI"
        ],
        formatNumber(
            data.totalMasterKPI
        )
    );

    setText(
        [
            "totalPenilaian",
            "dashboardTotalPenilaian",
            "cardTotalPenilaian"
        ],
        formatNumber(
            data.totalPenilaian
        )
    );

    setText(
        [
            "averageKPI",
            "dashboardAverageKPI",
            "cardAverageKPI"
        ],
        formatDecimal(
            data.averageKPI
        )
    );

}


/* ==========================================================
 * SUMMARY
 * ==========================================================
 */

function renderSummary(
    data
) {

    setText(
        [
            "summaryTotalAnggota",
            "summary-totalAnggota"
        ],
        formatNumber(
            data.totalAnggota
        )
    );

    setText(
        [
            "summaryAnggotaAktif",
            "summary-anggotaAktif"
        ],
        formatNumber(
            data.anggotaAktif
        )
    );

    setText(
        [
            "summaryAnggotaNonAktif",
            "summary-anggotaNonAktif"
        ],
        formatNumber(
            data.anggotaNonAktif
        )
    );

    setText(
        [
            "summaryTotalGroup",
            "summary-totalGroup"
        ],
        formatNumber(
            data.totalGroup
        )
    );

    setText(
        [
            "summaryTotalMasterKPI",
            "summary-totalMasterKPI"
        ],
        formatNumber(
            data.totalMasterKPI
        )
    );

    setText(
        [
            "summaryTotalPenilaian",
            "summary-totalPenilaian"
        ],
        formatNumber(
            data.totalPenilaian
        )
    );

    setText(
        [
            "summaryAverageKPI",
            "summary-averageKPI"
        ],
        formatDecimal(
            data.averageKPI
        )
    );

}


/* ==========================================================
 * FIND CANVAS
 * ==========================================================
 */

function findCanvas(
    ids,
    containerIds
) {

    /*
     * Cari canvas berdasarkan ID.
     */

    for (
        let i = 0;
        i < ids.length;
        i++
    ) {

        const canvas =
            document.getElementById(
                ids[i]
            );

        if (
            canvas &&
            canvas.tagName ===
            "CANVAS"
        ) {

            return canvas;

        }

    }


    /*
     * Cari canvas di container.
     */

    for (
        let i = 0;
        i < containerIds.length;
        i++
    ) {

        const container =
            document.getElementById(
                containerIds[i]
            );

        if (
            container
        ) {

            const canvas =
                container.querySelector(
                    "canvas"
                );

            if (
                canvas
            ) {

                return canvas;

            }

        }

    }


    return null;

}


/* ==========================================================
 * STATISTIK KPI CHART
 * ==========================================================
 */

function renderStatistikChart(
    items
) {

    const canvas =
        findCanvas(
            [
                "dashboardChart",
                "statistikKPIChart",
                "chartStatistikKPI"
            ],
            [
                "statistikKPI",
                "dashboardChartContainer"
            ]
        );


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Statistik KPI tidak ditemukan."
        );

        return;

    }


    if (
        !chartAvailable()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    const labels =
        items.map(
            function (item) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return number(
                    item.value
                );

            }
        );


    const colors = [

        "#00d9ff",

        "#1677ff",

        "#00c878",

        "#ffb300",

        "#9b59ff",

        "#ff4d6d",

        "#ff8a00",

        "#00c7a7"

    ];


    const ctx =
        canvas.getContext(
            "2d"
        );


    const backgrounds =
        values.map(
            function (
                value,
                index
            ) {

                return makeGradient(
                    ctx,
                    colors[
                        index %
                        colors.length
                    ]
                );

            }
        );


    dashboardCharts[
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
                                "Jumlah",

                            data:
                                values,

                            backgroundColor:
                                backgrounds,

                            borderColor:
                                colors.slice(
                                    0,
                                    values.length
                                ),

                            borderWidth:
                                1.5,

                            borderRadius:
                                8,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                100

                        }

                    ]

                },

                options:
                    barOptions()

            }
        );

}


/* ==========================================================
 * DISTRIBUSI ANGGOTA
 * ==========================================================
 */

function renderAnggotaChart(
    items
) {

    const canvas =
        findCanvas(
            [
                "dashboardPieChart",
                "distribusiAnggotaChart",
                "anggotaPieChart"
            ],
            [
                "distribusiData",
                "distribusiAnggota",
                "dashboardPieChartContainer"
            ]
        );


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Distribusi Anggota tidak ditemukan."
        );

        return;

    }


    if (
        !chartAvailable()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    if (
        !items.length
    ) {

        return;

    }


    const labels =
        items.map(
            function (item) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return number(
                    item.value
                );

            }
        );


    const colors = [

        "#00c878",

        "#ff334d",

        "#1677ff",

        "#ffc400",

        "#9b59ff"

    ];


    dashboardCharts[
        canvas.id
    ] =
        new Chart(
            canvas.getContext(
                "2d"
            ),
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
                                colors,

                            borderColor:
                                "#101722",

                            borderWidth:
                                4,

                            hoverOffset:
                                12,

                            spacing:
                                3

                        }

                    ]

                },

                options:
                    doughnutOptions()

            }
        );

}


/* ==========================================================
 * KATEGORI MASTER KPI
 * ==========================================================
 */

function renderKategoriChart(
    items
) {

    const canvas =
        findCanvas(
            [
                "distributionChart",
                "kategoriMasterKPIChart",
                "masterKPIKategoriChart",
                "categoryChart"
            ],
            [
                "kategoriMasterKPI",
                "masterKPIKategori",
                "kategoriMasterKPIContainer"
            ]
        );


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Kategori Master KPI tidak ditemukan."
        );

        return;

    }


    if (
        !chartAvailable()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    if (
        !items.length
    ) {

        console.warn(
            "Data kategori Master KPI kosong."
        );

        return;

    }


    console.log(
        "Render Kategori Master KPI:",
        items
    );


    const labels =
        items.map(
            function (item) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return number(
                    item.value
                );

            }
        );


    const colors = [

        "#00e5a8",

        "#1677ff",

        "#ffb300",

        "#ff4d6d",

        "#9b59ff",

        "#00c7ff",

        "#ff8a00",

        "#ff4da6"

    ];


    dashboardCharts[
        canvas.id
    ] =
        new Chart(
            canvas.getContext(
                "2d"
            ),
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
                                colors.slice(
                                    0,
                                    values.length
                                ),

                            borderColor:
                                "#111821",

                            borderWidth:
                                4,

                            hoverOffset:
                                14,

                            spacing:
                                4

                        }

                    ]

                },

                options:
                    doughnutOptions()

            }
        );

}


/* ==========================================================
 * INDIKATOR MASTER KPI
 * ==========================================================
 */

function renderIndikatorChart(
    items
) {

    const canvas =
        findCanvas(
            [
                "kpiChart",
                "indikatorMasterKPIChart",
                "masterKPIIndikatorChart",
                "indicatorChart"
            ],
            [
                "indikatorMasterKPI",
                "masterKPIIndikator",
                "indikatorMasterKPIContainer"
            ]
        );


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Indikator Master KPI tidak ditemukan."
        );

        return;

    }


    if (
        !chartAvailable()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    if (
        !items.length
    ) {

        console.warn(
            "Data indikator Master KPI kosong."
        );

        return;

    }


    console.log(
        "Render Indikator Master KPI:",
        items
    );


    const labels =
        items.map(
            function (item) {

                if (
                    item.id
                ) {

                    return (
                        item.id +
                        " - " +
                        item.label
                    );

                }

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return number(
                    item.bobot
                );

            }
        );


    const colors = [

        "#00d9ff",

        "#1677ff",

        "#00c878",

        "#ffc400",

        "#9b59ff",

        "#ff4d6d",

        "#ff8a00",

        "#00c7a7",

        "#ff4da6"

    ];


    const ctx =
        canvas.getContext(
            "2d"
        );


    const backgrounds =
        values.map(
            function (
                value,
                index
            ) {

                return makeGradient(
                    ctx,
                    colors[
                        index %
                        colors.length
                    ]
                );

            }
        );


    dashboardCharts[
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
                                "Bobot KPI (%)",

                            data:
                                values,

                            backgroundColor:
                                backgrounds,

                            borderColor:
                                colors.slice(
                                    0,
                                    values.length
                                ),

                            borderWidth:
                                1.5,

                            borderRadius:
                                8,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                65

                        }

                    ]

                },

                options:
                    indicatorOptions()

            }
        );

}


/* ==========================================================
 * CHART AVAILABLE
 * ==========================================================
 */

function chartAvailable() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js belum dimuat."
        );

        return false;

    }

    return true;

}


/* ==========================================================
 * DESTROY CHART
 * ==========================================================
 */

function destroyChart(
    canvas
) {

    if (
        !canvas
    ) {

        return;

    }


    const id =
        canvas.id;


    if (
        dashboardCharts[id]
    ) {

        try {

            dashboardCharts[id]
                .destroy();

        }

        catch (error) {

            console.warn(
                error
            );

        }

        delete dashboardCharts[id];

    }


    /*
     * Chart.js 3/4.
     */

    if (
        typeof Chart !==
        "undefined" &&
        typeof Chart.getChart ===
        "function"
    ) {

        const chart =
            Chart.getChart(
                canvas
            );

        if (
            chart
        ) {

            chart.destroy();

        }

    }

}


/* ==========================================================
 * BAR OPTIONS
 * ==========================================================
 */

function barOptions() {

    return {

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

            },

            tooltip: {

                backgroundColor:
                    "rgba(10,16,28,.96)",

                titleColor:
                    "#ffffff",

                bodyColor:
                    "#d7e5ef",

                padding:
                    12,

                callbacks: {

                    label:
                        function (
                            context
                        ) {

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

                    display:
                        false

                },

                ticks: {

                    color:
                        "#8fa1b5"

                }

            },

            y: {

                beginAtZero:
                    true,

                grid: {

                    color:
                        "rgba(255,255,255,.07)"

                },

                ticks: {

                    color:
                        "#8fa1b5",

                    precision:
                        0

                }

            }

        }

    };

}


/* ==========================================================
 * INDICATOR OPTIONS
 * ==========================================================
 */

function indicatorOptions() {

    return {

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

            },

            tooltip: {

                backgroundColor:
                    "rgba(10,16,28,.96)",

                titleColor:
                    "#ffffff",

                bodyColor:
                    "#d7e5ef",

                padding:
                    12,

                callbacks: {

                    label:
                        function (
                            context
                        ) {

                            return (
                                " Bobot: " +
                                context.parsed.y +
                                "%"
                            );

                        }

                }

            }

        },

        scales: {

            x: {

                grid: {

                    display:
                        false

                },

                ticks: {

                    color:
                        "#8fa1b5",

                    maxRotation:
                        45,

                    minRotation:
                        0,

                    font: {

                        size:
                            9

                    }

                }

            },

            y: {

                beginAtZero:
                    true,

                suggestedMax:
                    20,

                grid: {

                    color:
                        "rgba(255,255,255,.07)"

                },

                ticks: {

                    color:
                        "#8fa1b5",

                    callback:
                        function (
                            value
                        ) {

                            return (
                                value +
                                "%"
                            );

                        }

                }

            }

        }

    };

}


/* ==========================================================
 * DOUGHNUT OPTIONS
 * ==========================================================
 */

function doughnutOptions() {

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        cutout:
            "60%",

        animation: {

            animateRotate:
                true,

            animateScale:
                true,

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
                        "#b9c8d8",

                    padding:
                        14,

                    usePointStyle:
                        true,

                    pointStyle:
                        "circle"

                }

            },

            tooltip: {

                backgroundColor:
                    "rgba(10,16,28,.96)",

                titleColor:
                    "#ffffff",

                bodyColor:
                    "#d7e5ef",

                padding:
                    12,

                callbacks: {

                    label:
                        function (
                            context
                        ) {

                            const value =
                                Number(
                                    context.parsed ||
                                    0
                                );


                            const data =
                                context.dataset.data;


                            const total =
                                data.reduce(
                                    function (
                                        a,
                                        b
                                    ) {

                                        return (
                                            a +
                                            Number(
                                                b ||
                                                0
                                            )
                                        );

                                    },
                                    0
                                );


                            const percentage =
                                total
                                    ? (
                                        value /
                                        total *
                                        100
                                    )
                                    : 0;


                            return (
                                " " +
                                context.label +
                                ": " +
                                value +
                                " (" +
                                percentage.toFixed(
                                    1
                                ) +
                                "%)"
                            );

                        }

                }

            }

        }

    };

}


/* ==========================================================
 * GRADIENT
 * ==========================================================
 */

function makeGradient(
    ctx,
    color
) {

    if (
        !ctx
    ) {

        return color;

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            400
        );


    const rgb =
        hexToRgb(
            color
        );


    if (
        !rgb
    ) {

        return color;

    }


    gradient.addColorStop(
        0,
        "rgba(" +
        rgb.r +
        "," +
        rgb.g +
        "," +
        rgb.b +
        ",0.98)"
    );


    gradient.addColorStop(
        0.55,
        "rgba(" +
        rgb.r +
        "," +
        rgb.g +
        "," +
        rgb.b +
        ",0.78)"
    );


    gradient.addColorStop(
        1,
        "rgba(" +
        Math.max(
            rgb.r - 55,
            0
        ) +
        "," +
        Math.max(
            rgb.g - 55,
            0
        ) +
        "," +
        Math.max(
            rgb.b - 55,
            0
        ) +
        ",0.98)"
    );


    return gradient;

}


/* ==========================================================
 * HEX TO RGB
 * ==========================================================
 */

function hexToRgb(
    hex
) {

    const value =
        String(
            hex || ""
        )
        .replace(
            "#",
            ""
        );


    if (
        value.length !== 6
    ) {

        return null;

    }


    const n =
        parseInt(
            value,
            16
        );


    if (
        Number.isNaN(n)
    ) {

        return null;

    }


    return {

        r:
            (n >> 16) &
            255,

        g:
            (n >> 8) &
            255,

        b:
            n &
            255

    };

}


/* ==========================================================
 * SYSTEM INFO
 * ==========================================================
 */

function renderSystem(
    data
) {

    const system =
        data.system ||
        {};


    setText(
        [
            "systemStatus",
            "dashboardSystemStatus"
        ],
        system.status ||
        "Online"
    );


    setText(
        [
            "systemDatabase",
            "dashboardSystemDatabase"
        ],
        system.database ||
        "Connected"
    );


    setText(
        [
            "systemAPI",
            "dashboardSystemAPI"
        ],
        system.api ||
        "Connected"
    );


    setText(
        [
            "systemVersion",
            "dashboardSystemVersion"
        ],
        system.version ||
        "7.0.1"
    );


    setText(
        [
            "lastRefresh",
            "dashboardLastRefresh",
            "lastUpdated"
        ],
        formatDate(
            data.generatedAt ||
            system.generatedAt
        )
    );

}


/* ==========================================================
 * SET TEXT
 * ==========================================================
 */

function setText(
    ids,
    value
) {

    if (
        !Array.isArray(ids)
    ) {

        ids = [
            ids
        ];

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

            element.textContent =
                value;

            return;

        }

    }

}


/* ==========================================================
 * NUMBER
 * ==========================================================
 */

function number(
    value
) {

    if (
        value === null ||
        value === undefined ||
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
        )
        .trim();


    text =
        text.replace(
            "%",
            ""
        );


    if (
        text.includes(",") &&
        !text.includes(".")
    ) {

        text =
            text.replace(
                ",",
                "."
            );

    }


    const n =
        Number(
            text
        );


    return isFinite(n)
        ? n
        : 0;

}


/* ==========================================================
 * FORMAT NUMBER
 * ==========================================================
 */

function formatNumber(
    value
) {

    return number(
        value
    )
    .toLocaleString(
        "id-ID"
    );

}


/* ==========================================================
 * FORMAT DECIMAL
 * ==========================================================
 */

function formatDecimal(
    value
) {

    return number(
        value
    )
    .toLocaleString(
        "id-ID",
        {

            minimumFractionDigits:
                2,

            maximumFractionDigits:
                2

        }
    );

}


/* ==========================================================
 * FORMAT DATE
 * ==========================================================
 */

function formatDate(
    value
) {

    if (
        !value
    ) {

        return "-";

    }


    const date =
        new Date(
            value
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            value
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
                "2-digit"

        }
    );

}


/* ==========================================================
 * REFRESH BUTTON
 * ==========================================================
 */

function bindRefreshButton() {

    const buttons =
        document.querySelectorAll(
            "#btnRefreshDashboard, " +
            "#refreshDashboard, " +
            "[data-dashboard-refresh]"
        );


    buttons.forEach(
        function (
            button
        ) {

            button.addEventListener(
                "click",
                function () {

                    loadDashboard();

                }
            );

        }
    );

}


/* ==========================================================
 * LOADING
 * ==========================================================
 */

function setLoading(
    loading
) {

    const buttons =
        document.querySelectorAll(
            "#btnRefreshDashboard, " +
            "#refreshDashboard, " +
            "[data-dashboard-refresh]"
        );


    buttons.forEach(
        function (
            button
        ) {

            button.disabled =
                loading;

        }
    );

}


/* ==========================================================
 * AUTO REFRESH
 * ==========================================================
 */

function startAutoRefresh() {

    if (
        dashboardRefreshTimer
    ) {

        clearInterval(
            dashboardRefreshTimer
        );

    }


    dashboardRefreshTimer =
        setInterval(
            function () {

                loadDashboard();

            },
            5 *
            60 *
            1000
        );

}


/* ==========================================================
 * ERROR
 * ==========================================================
 */

function showError(
    message
) {

    console.error(
        "Guardian KPI Dashboard:",
        message
    );


    const elements =
        document.querySelectorAll(
            ".dashboard-error-message"
        );


    elements.forEach(
        function (
            element
        ) {

            element.textContent =
                message;

        }
    );

}


/* ==========================================================
 * DEBUG
 * ==========================================================
 */

function dashboardDebug() {

    console.log(
        "========== GUARDIAN KPI DEBUG =========="
    );

    console.log(
        "Data:",
        dashboardData
    );

    console.log(
        "Statistik:",
        dashboardData &&
        dashboardData.statistikKPI
    );

    console.log(
        "Distribusi:",
        dashboardData &&
        dashboardData.distribusiAnggota
    );

    console.log(
        "Kategori:",
        dashboardData &&
        dashboardData.masterKPIKategori
    );

    console.log(
        "Indikator:",
        dashboardData &&
        dashboardData.masterKPIIndikator
    );

    console.log(
        "Charts:",
        dashboardCharts
    );

    console.log(
        "========================================="
    );

}


/* ==========================================================
 * MANUAL REFRESH
 * ==========================================================
 */

function dashboardRefresh() {

    return loadDashboard();

}


/* ==========================================================
 * GLOBAL EXPORT
 * ==========================================================
 */

window.GuardianDashboard = {

    load:
        loadDashboard,

    refresh:
        dashboardRefresh,

    debug:
        dashboardDebug,

    render:
        renderDashboard,

    getData:
        function () {

            return dashboardData;

        },

    getCharts:
        function () {

            return dashboardCharts;

        }

};
