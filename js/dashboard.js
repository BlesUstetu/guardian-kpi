/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : js/dashboard.js
 * Version : 8.0.0 Enterprise FINAL
 * ==========================================================
 * FINAL dashboard renderer for the current project structure.
 *
 * IMPORTANT:
 * - Dashboard page is loaded dynamically by app.js.
 * - app.js calls init() after pages/dashboard.html is injected.
 * - Therefore this file DOES NOT initialize itself on
 *   DOMContentLoaded.
 * - Canvas IDs:
 *     dashboardChart
 *     dashboardPieChart
 *     dashboardKategoriChart
 *     dashboardIndikatorChart
 * - API source remains API.getDashboard().
 * - No Dashboard.gs / api.js changes are required.
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let dashboardData = null;

const dashboardCharts = {};

let dashboardLoading = false;

let dashboardRefreshTimer = null;

const DASHBOARD_VERSION =
    "8.0.0 Enterprise FINAL";

const DASHBOARD_REFRESH_MS =
    5 * 60 * 1000;


/* ==========================================================
 * PUBLIC INIT
 * ==========================================================
 */

function init() {

    console.log(
        "=========================================="
    );

    console.log(
        "Guardian KPI Dashboard " +
        DASHBOARD_VERSION
    );

    console.log(
        "Dashboard init() called by app.js"
    );

    bindDashboardRefresh();

    loadDashboard();

    startDashboardAutoRefresh();

}


/* ==========================================================
 * BACKWARD COMPATIBILITY
 * ==========================================================
 */

function initDashboard() {

    init();

}


/* ==========================================================
 * API RESOLUTION
 * ==========================================================
 */

function getDashboardAPI() {

    try {

        if (
            typeof API !== "undefined" &&
            API &&
            typeof API.getDashboard === "function"
        ) {

            return API;

        }

    }

    catch (error) {

        console.warn(
            "API check error:",
            error
        );

    }


    if (
        typeof window !== "undefined" &&
        window.API &&
        typeof window.API.getDashboard === "function"
    ) {

        return window.API;

    }


    return null;

}


/* ==========================================================
 * WAIT API
 * ==========================================================
 */

function waitForDashboardAPI(
    timeout = 15000
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const started =
                Date.now();


            function check() {

                const api =
                    getDashboardAPI();


                if (api) {

                    resolve(api);

                    return;

                }


                if (
                    Date.now() -
                    started >=
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
 * LOAD DASHBOARD DATA
 * ==========================================================
 */

async function loadDashboard() {

    if (
        dashboardLoading
    ) {

        return;

    }


    dashboardLoading =
        true;


    setDashboardLoading(
        true
    );


    try {

        console.log(
            "Dashboard: requesting data..."
        );


        const api =
            await waitForDashboardAPI();


        console.log(
            "Dashboard API:",
            api
        );


        const response =
            await api.getDashboard();


        console.log(
            "Dashboard API Response:",
            response
        );


        if (!response) {

            throw new Error(
                "Response Dashboard kosong."
            );

        }


        if (
            response.success ===
            false
        ) {

            throw new Error(
                response.message ||
                "Dashboard API gagal."
            );

        }


        let data =
            response.data;


        /*
         * Support nested:
         *
         * response.data.data
         */

        if (
            data &&
            data.data &&
            typeof data.data ===
            "object"
        ) {

            data =
                data.data;

        }


        if (
            !data ||
            typeof data !==
            "object"
        ) {

            throw new Error(
                "Data Dashboard tidak valid."
            );

        }


        dashboardData =
            normalizeDashboardData(
                data
            );


        console.log(
            "Dashboard Data:",
            dashboardData
        );


        console.log(
            "Master KPI kategori:",
            dashboardData.masterKPIKategori
        );


        console.log(
            "Master KPI indikator:",
            dashboardData.masterKPIIndikator
        );


        renderDashboard(
            dashboardData
        );


        console.log(
            "Dashboard render selesai."
        );

    }

    catch (error) {

        console.error(
            "Dashboard Error:",
            error
        );


        showDashboardError(
            error.message ||
            "Gagal memuat dashboard."
        );

    }

    finally {

        dashboardLoading =
            false;


        setDashboardLoading(
            false
        );

    }

}


/* ==========================================================
 * NORMALIZATION
 * ==========================================================
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


    if (
        typeof value ===
        "number"
    ) {

        return Number.isFinite(
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
            /%/g,
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


    const result =
        Number(
            text
        );


    return Number.isFinite(
        result
    )
        ? result
        : 0;

}


/* ==========================================================
 * FORMAT NUMBER
 * ==========================================================
 */

function formatNumber(
    value
) {

    return toNumber(
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

    return toNumber(
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
 * NORMALIZE SIMPLE LIST
 * ==========================================================
 */

function normalizeSimpleList(
    source
) {

    if (
        !Array.isArray(
            source
        )
    ) {

        return [];

    }


    return source
        .map(
            function (
                item
            ) {

                return {

                    label:
                        String(
                            item?.label ??
                            item?.nama ??
                            item?.status ??
                            item?.kategori ??
                            item?.category ??
                            ""
                        )
                        .trim(),

                    value:
                        toNumber(
                            item?.value ??
                            item?.jumlah ??
                            item?.count
                        ),

                    color:
                        item?.color ||
                        null

                };

            }
        )
        .filter(
            function (
                item
            ) {

                return (
                    item.label !==
                    ""
                );

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
        !Array.isArray(
            source
        )
    ) {

        return [];

    }


    return source
        .map(
            function (
                item
            ) {

                const label =
                    String(
                        item?.label ??
                        item?.indicator ??
                        item?.indikator ??
                        item?.nama ??
                        item?.id ??
                        ""
                    )
                    .trim();


                return {

                    id:
                        String(
                            item?.id ??
                            ""
                        )
                        .trim(),

                    label:
                        label,

                    indicator:
                        String(
                            item?.indicator ??
                            item?.indikator ??
                            item?.nama ??
                            label
                        )
                        .trim(),

                    kategori:
                        String(
                            item?.kategori ??
                            item?.category ??
                            ""
                        )
                        .trim(),

                    bobot:
                        toNumber(
                            item?.bobot
                        ),

                    target:
                        toNumber(
                            item?.target
                        ),

                    status:
                        String(
                            item?.status ??
                            ""
                        )
                        .trim()

                };

            }
        )
        .filter(
            function (
                item
            ) {

                return (
                    item.label !==
                    ""
                );

            }
        );

}


/* ==========================================================
 * NORMALIZE DASHBOARD
 * ==========================================================
 */

function normalizeDashboardData(
    raw
) {

    const data =
        raw || {};


    data.totalAnggota =
        toNumber(
            data.totalAnggota
        );


    data.anggotaAktif =
        toNumber(
            data.anggotaAktif
        );


    data.anggotaNonAktif =
        toNumber(
            data.anggotaNonAktif
        );


    data.totalGroup =
        toNumber(
            data.totalGroup
        );


    data.totalMasterKPI =
        toNumber(
            data.totalMasterKPI
        );


    data.totalPenilaian =
        toNumber(
            data.totalPenilaian
        );


    data.masterKPIAktif =
        toNumber(
            data.masterKPIAktif
        );


    data.masterKPINonAktif =
        toNumber(
            data.masterKPINonAktif
        );


    data.averageKPI =
        toNumber(
            data.averageKPI
        );


    /*
     * DISTRIBUSI ANGGOTA
     */

    data.distribusiAnggota =
        normalizeSimpleList(
            data.distribusiAnggota ||
            data.anggotaDistribution ||
            data.anggotaDistribusi ||
            []
        );


    if (
        !data.distribusiAnggota.length
    ) {

        data.distribusiAnggota = [

            {

                label:
                    "Aktif",

                value:
                    data.anggotaAktif,

                color:
                    "#00c878"

            },

            {

                label:
                    "Non Aktif",

                value:
                    data.anggotaNonAktif,

                color:
                    "#ff334d"

            }

        ];

    }


    /*
     * KATEGORI MASTER KPI
     */

    data.masterKPIKategori =
        normalizeSimpleList(
            data.masterKPIKategori ||
            data.kategoriMasterKPI ||
            []
        );


    /*
     * INDIKATOR MASTER KPI
     */

    data.masterKPIIndikator =
        normalizeIndicators(
            data.masterKPIIndikator ||
            data.indikatorMasterKPI ||
            []
        );


    /*
     * STATISTIK KPI
     */

    data.statistikKPI =
        normalizeSimpleList(
            data.statistikKPI ||
            []
        );


    /*
     * FALLBACK STATISTIK
     */

    if (
        !data.statistikKPI.length
    ) {

        data.statistikKPI = [

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


    return data;

}


/* ==========================================================
 * MAIN RENDER
 * ==========================================================
 */

function renderDashboard(
    data
) {

    if (!data) {

        return;

    }


    renderSummary(
        data
    );


    renderGeneratedAt(
        data.generatedAt
    );


    renderStatuses(
        data
    );


    renderStatistikKPIChart(
        data.statistikKPI
    );


    renderDistribusiAnggotaChart(
        data.distribusiAnggota
    );


    renderKategoriMasterKPIChart(
        data.masterKPIKategori
    );


    renderIndikatorMasterKPIChart(
        data.masterKPIIndikator
    );


    renderActivity(
        data
    );

}


/* ==========================================================
 * SET TEXT
 * ==========================================================
 */

function setText(
    id,
    value
) {

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


/* ==========================================================
 * SUMMARY
 * ==========================================================
 */

function renderSummary(
    data
) {

    setText(
        "summaryTotalAnggota",
        formatNumber(
            data.totalAnggota
        )
    );


    setText(
        "summaryAnggotaAktif",
        formatNumber(
            data.anggotaAktif
        )
    );


    setText(
        "summaryTotalGroup",
        formatNumber(
            data.totalGroup
        )
    );


    setText(
        "summaryTotalMasterKPI",
        formatNumber(
            data.totalMasterKPI
        )
    );


    setText(
        "summaryTotalPenilaian",
        formatNumber(
            data.totalPenilaian
        )
    );

}


/* ==========================================================
 * GENERATED AT
 * ==========================================================
 */

function renderGeneratedAt(
    value
) {

    const element =
        document.getElementById(
            "dashboardGeneratedAt"
        );


    if (!element) {

        return;

    }


    if (!value) {

        element.textContent =
            "--";

        return;

    }


    const date =
        new Date(
            value
        );


    element.textContent =
        Number.isNaN(
            date.getTime()
        )
            ? String(
                value
            )
            : date.toLocaleString(
                "id-ID"
            );

}


/* ==========================================================
 * STATUS
 * ==========================================================
 */

function renderStatuses(
    data
) {

    const categoryStatus =
        document.getElementById(
            "kategoriKPIStatus"
        );


    const categoryNotice =
        document.getElementById(
            "kategoriKPINotice"
        );


    const indicatorStatus =
        document.getElementById(
            "indikatorKPIStatus"
        );


    const categoryCount =
        data.masterKPIKategori.length;


    const indicatorCount =
        data.masterKPIIndikator.length;


    if (
        categoryStatus
    ) {

        categoryStatus.textContent =
            categoryCount
                ? `${categoryCount} kategori`
                : "Tidak ada data";


        categoryStatus.className =
            categoryCount
                ? "badge bg-success"
                : "badge bg-secondary";

    }


    if (
        categoryNotice
    ) {

        categoryNotice.classList.toggle(
            "d-none",
            categoryCount > 0
        );

    }


    if (
        indicatorStatus
    ) {

        indicatorStatus.textContent =
            indicatorCount
                ? `${indicatorCount} indikator`
                : "Tidak ada data";


        indicatorStatus.className =
            indicatorCount
                ? "badge bg-info"
                : "badge bg-secondary";

    }

}


/* ==========================================================
 * ACTIVITY
 * ==========================================================
 */

function renderActivity(
    data
) {

    const element =
        document.getElementById(
            "dashboardActivity"
        );


    if (!element) {

        return;

    }


    const now =
        new Date()
            .toLocaleString(
                "id-ID"
            );


    element.innerHTML = `

        <div class="text-start small">

            <div class="d-flex justify-content-between border-bottom border-secondary py-2">

                <span>
                    Dashboard berhasil diperbarui
                </span>

                <span class="text-info">
                    ${now}
                </span>

            </div>


            <div class="d-flex justify-content-between border-bottom border-secondary py-2">

                <span>
                    Total Anggota
                </span>

                <span class="text-info">
                    ${formatNumber(
                        data.totalAnggota
                    )}
                </span>

            </div>


            <div class="d-flex justify-content-between border-bottom border-secondary py-2">

                <span>
                    Total Master KPI
                </span>

                <span class="text-info">
                    ${formatNumber(
                        data.totalMasterKPI
                    )}
                </span>

            </div>


            <div class="d-flex justify-content-between py-2">

                <span>
                    Total Penilaian
                </span>

                <span class="text-info">
                    ${formatNumber(
                        data.totalPenilaian
                    )}
                </span>

            </div>

        </div>

    `;

}


/* ==========================================================
 * CHART READY
 * ==========================================================
 */

function chartReady() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        console.error(
            "Chart.js tidak tersedia."
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
    canvasId
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        return;

    }


    if (
        dashboardCharts[
            canvasId
        ]
    ) {

        try {

            dashboardCharts[
                canvasId
            ]
            .destroy();

        }

        catch (error) {

            console.warn(
                "Chart destroy error:",
                canvasId,
                error
            );

        }


        delete dashboardCharts[
            canvasId
        ];

    }


    if (
        typeof Chart !==
        "undefined" &&
        typeof Chart.getChart ===
        "function"
    ) {

        const existing =
            Chart.getChart(
                canvas
            );


        if (
            existing
        ) {

            try {

                existing.destroy();

            }

            catch (error) {

                console.warn(
                    "Chart.getChart destroy error:",
                    canvasId,
                    error
                );

            }

        }

    }

}


/* ==========================================================
 * GRADIENT
 * ==========================================================
 */

function createVerticalGradient(
    ctx,
    color
) {

    const rgb =
        hexToRgb(
            color
        );


    if (!rgb) {

        return color;

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            420
        );


    gradient.addColorStop(
        0,
        `rgba(${rgb.r},${rgb.g},${rgb.b},0.98)`
    );


    gradient.addColorStop(
        0.45,
        `rgba(${rgb.r},${rgb.g},${rgb.b},0.82)`
    );


    gradient.addColorStop(
        1,
        `rgba(${Math.max(
            rgb.r - 65,
            0
        )},${Math.max(
            rgb.g - 65,
            0
        )},${Math.max(
            rgb.b - 65,
            0
        )},0.98)`
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
        value.length !==
        6
    ) {

        return null;

    }


    const number =
        parseInt(
            value,
            16
        );


    if (
        !Number.isFinite(
            number
        )
    ) {

        return null;

    }


    return {

        r:
            (number >> 16) &
            255,

        g:
            (number >> 8) &
            255,

        b:
            number &
            255

    };

}


/* ==========================================================
 * EMPTY STATE
 * ==========================================================
 */

function showEmptyChart(
    canvasId,
    message
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (
        !canvas
    ) {

        return;

    }


    const parent =
        canvas.parentElement;


    if (
        !parent
    ) {

        return;

    }


    let notice =
        parent.querySelector(
            `.dashboard-empty-${canvasId}`
        );


    if (!notice) {

        notice =
            document.createElement(
                "div"
            );


        notice.className =
            `dashboard-empty-${canvasId} text-center text-secondary small`;


        notice.style.position =
            "absolute";


        notice.style.left =
            "50%";


        notice.style.top =
            "50%";


        notice.style.transform =
            "translate(-50%, -50%)";


        notice.style.pointerEvents =
            "none";


        notice.style.width =
            "90%";


        if (
            getComputedStyle(
                parent
            ).position ===
            "static"
        ) {

            parent.style.position =
                "relative";

        }


        parent.appendChild(
            notice
        );

    }


    notice.textContent =
        message;


    notice.classList.remove(
        "d-none"
    );

}


/* ==========================================================
 * HIDE EMPTY
 * ==========================================================
 */

function hideEmptyChart(
    canvasId
) {

    const canvas =
        document.getElementById(
            canvasId
        );


    if (
        !canvas ||
        !canvas.parentElement
    ) {

        return;

    }


    const notice =
        canvas.parentElement.querySelector(
            `.dashboard-empty-${canvasId}`
        );


    if (
        notice
    ) {

        notice.classList.add(
            "d-none"
        );

    }

}


/* ==========================================================
 * CARTESIAN OPTIONS
 * ==========================================================
 */

function baseCartesianOptions() {

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        animation: {

            duration:
                900,

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
                    "rgba(8,14,25,.96)",

                titleColor:
                    "#ffffff",

                bodyColor:
                    "#d9e6ef",

                borderColor:
                    "rgba(0,217,255,.35)",

                borderWidth:
                    1,

                padding:
                    12

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
                        "#9aabba"

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
                        "#9aabba",

                    precision:
                        0

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
            "58%",

        animation: {

            duration:
                1000,

            animateRotate:
                true,

            animateScale:
                true

        },

        plugins: {

            legend: {

                position:
                    "bottom",

                labels: {

                    color:
                        "#b9c8d8",

                    usePointStyle:
                        true,

                    pointStyle:
                        "circle",

                    padding:
                        14

                }

            },

            tooltip: {

                backgroundColor:
                    "rgba(8,14,25,.96)",

                padding:
                    12,

                callbacks: {

                    label:
                        function (
                            context
                        ) {

                            const value =
                                toNumber(
                                    context.parsed
                                );


                            const values =
                                context.dataset.data ||
                                [];


                            const total =
                                values.reduce(
                                    function (
                                        sum,
                                        item
                                    ) {

                                        return (
                                            sum +
                                            toNumber(
                                                item
                                            )
                                        );

                                    },
                                    0
                                );


                            const percentage =
                                total > 0
                                    ? (
                                        value /
                                        total
                                    ) *
                                    100
                                    : 0;


                            return (
                                `${context.label}: ` +
                                `${formatNumber(
                                    value
                                )} ` +
                                `(${percentage.toFixed(
                                    1
                                )}%)`
                            );

                        }

                }

            }

        }

    };

}


/* ==========================================================
 * CHART 1
 *
 * STATISTIK KPI
 *
 * BAR
 * ==========================================================
 */

function renderStatistikKPIChart(
    data
) {

    const canvasId =
        "dashboardChart";


    if (
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvasId
    );


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `Canvas #${canvasId} tidak ditemukan.`
        );


        return;

    }


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    if (
        !items.length
    ) {

        showEmptyChart(
            canvasId,
            "Data statistik belum tersedia."
        );


        return;

    }


    hideEmptyChart(
        canvasId
    );


    const labels =
        items.map(
            function (
                item
            ) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (
                item
            ) {

                return toNumber(
                    item.value
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

                return createVerticalGradient(
                    ctx,
                    colors[
                        index %
                        colors.length
                    ]
                );

            }
        );


    dashboardCharts[
        canvasId
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
                                values.map(
                                    function (
                                        value,
                                        index
                                    ) {

                                        return colors[
                                            index %
                                            colors.length
                                        ];

                                    }
                                ),

                            borderWidth:
                                1.5,

                            borderRadius:
                                9,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                105

                        }

                    ]

                },

                options:
                    baseCartesianOptions()

            }
        );


    console.log(
        "Statistik KPI chart rendered:",
        items
    );

}


/* ==========================================================
 * CHART 2
 *
 * DISTRIBUSI ANGGOTA
 *
 * DOUGHNUT
 * ==========================================================
 */

function renderDistribusiAnggotaChart(
    data
) {

    const canvasId =
        "dashboardPieChart";


    if (
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvasId
    );


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `Canvas #${canvasId} tidak ditemukan.`
        );


        return;

    }


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    if (
        !items.length
    ) {

        showEmptyChart(
            canvasId,
            "Data distribusi belum tersedia."
        );


        return;

    }


    hideEmptyChart(
        canvasId
    );


    const labels =
        items.map(
            function (
                item
            ) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (
                item
            ) {

                return toNumber(
                    item.value
                );

            }
        );


    const defaultColors = [

        "#00c878",

        "#ff334d",

        "#1677ff",

        "#ffc400",

        "#9b59ff"

    ];


    const colors =
        items.map(
            function (
                item,
                index
            ) {

                return (
                    item.color ||
                    defaultColors[
                        index %
                        defaultColors.length
                    ]
                );

            }
        );


    dashboardCharts[
        canvasId
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
                                "#111821",

                            borderWidth:
                                4,

                            hoverOffset:
                                14,

                            spacing:
                                3

                        }

                    ]

                },

                options:
                    doughnutOptions()

            }
        );


    console.log(
        "Distribusi Anggota chart rendered:",
        items
    );

}


/* ==========================================================
 * CHART 3
 *
 * KATEGORI MASTER KPI
 *
 * DOUGHNUT / PIE
 *
 * CURRENT HTML:
 * #dashboardKategoriChart
 * ==========================================================
 */

function renderKategoriMasterKPIChart(
    data
) {

    const canvasId =
        "dashboardKategoriChart";


    if (
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvasId
    );


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `Canvas #${canvasId} tidak ditemukan.`
        );


        return;

    }


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    console.log(
        "Kategori Master KPI data untuk chart:",
        items
    );


    if (
        !items.length
    ) {

        showEmptyChart(
            canvasId,
            "Data kategori Master KPI belum tersedia."
        );


        return;

    }


    hideEmptyChart(
        canvasId
    );


    const labels =
        items.map(
            function (
                item
            ) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (
                item
            ) {

                return toNumber(
                    item.value
                );

            }
        );


    /*
     * Warna nyata setiap kategori.
     */

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
        canvasId
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
                                values.map(
                                    function (
                                        value,
                                        index
                                    ) {

                                        return colors[
                                            index %
                                            colors.length
                                        ];

                                    }
                                ),

                            borderColor:
                                "#111821",

                            borderWidth:
                                4,

                            hoverOffset:
                                16,

                            spacing:
                                4

                        }

                    ]

                },

                options:
                    doughnutOptions()

            }
        );


    console.log(
        "Kategori Master KPI chart rendered:",
        items
    );

}


/* ==========================================================
 * CHART 4
 *
 * INDIKATOR MASTER KPI
 *
 * BAR
 *
 * CURRENT HTML:
 * #dashboardIndikatorChart
 * ==========================================================
 */

function renderIndikatorMasterKPIChart(
    data
) {

    const canvasId =
        "dashboardIndikatorChart";


    if (
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvasId
    );


    const canvas =
        document.getElementById(
            canvasId
        );


    if (!canvas) {

        console.warn(
            `Canvas #${canvasId} tidak ditemukan.`
        );


        return;

    }


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    console.log(
        "Indikator Master KPI data untuk chart:",
        items
    );


    if (
        !items.length
    ) {

        showEmptyChart(
            canvasId,
            "Data indikator Master KPI belum tersedia."
        );


        return;

    }


    hideEmptyChart(
        canvasId
    );


    const labels =
        items.map(
            function (
                item
            ) {

                return item.id
                    ? `${item.id} - ${item.label}`
                    : item.label;

            }
        );


    const values =
        items.map(
            function (
                item
            ) {

                return toNumber(
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

                return createVerticalGradient(
                    ctx,
                    colors[
                        index %
                        colors.length
                    ]
                );

            }
        );


    const options =
        baseCartesianOptions();


    options.scales.x.ticks = {

        color:
            "#9aabba",

        maxRotation:
            45,

        minRotation:
            0,

        autoSkip:
            false,

        font: {

            size:
                10

        }

    };


    options.scales.y = {

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
                "#9aabba",

            callback:
                function (
                    value
                ) {

                    return `${value}%`;

                }

        }

    };


    options.plugins.tooltip.callbacks = {

        label:
            function (
                context
            ) {

                return (
                    ` Bobot: ${context.parsed.y}%`
                );

            }

    };


    dashboardCharts[
        canvasId
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
                                values.map(
                                    function (
                                        value,
                                        index
                                    ) {

                                        return colors[
                                            index %
                                            colors.length
                                        ];

                                    }
                                ),

                            borderWidth:
                                1.5,

                            borderRadius:
                                8,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                70

                        }

                    ]

                },

                options:
                    options

            }
        );


    console.log(
        "Indikator Master KPI chart rendered:",
        items
    );

}


/* ==========================================================
 * REFRESH
 * ==========================================================
 */

function refreshDashboard() {

    console.log(
        "Dashboard manual refresh..."
    );


    return loadDashboard();

}


/* ==========================================================
 * BACKWARD COMPATIBILITY
 * ==========================================================
 */

function dashboardRefresh() {

    return refreshDashboard();

}


/* ==========================================================
 * REFRESH BUTTON
 * ==========================================================
 */

function bindDashboardRefresh() {

    /*
     * Dashboard current button menggunakan:
     *
     * onclick="refreshDashboard()"
     *
     * sehingga tidak perlu event listener tambahan.
     */

}


/* ==========================================================
 * AUTO REFRESH
 * ==========================================================
 */

function startDashboardAutoRefresh() {

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
            DASHBOARD_REFRESH_MS
        );


    console.log(
        "Dashboard auto-refresh: 5 menit"
    );

}


/* ==========================================================
 * LOADING STATE
 * ==========================================================
 */

function setDashboardLoading(
    isLoading
) {

    const buttons =
        document.querySelectorAll(
            'button[onclick="refreshDashboard()"]'
        );


    buttons.forEach(
        function (
            button
        ) {

            button.disabled =
                isLoading;


            if (
                isLoading
            ) {

                button.classList.add(
                    "disabled"
                );

            }

            else {

                button.classList.remove(
                    "disabled"
                );

            }

        }
    );

}


/* ==========================================================
 * ERROR
 * ==========================================================
 */

function showDashboardError(
    message
) {

    console.error(
        "Guardian KPI Dashboard:",
        message
    );


    const activity =
        document.getElementById(
            "dashboardActivity"
        );


    if (
        activity
    ) {

        activity.innerHTML = `

            <div class="alert alert-danger mb-0">

                <i class="bi bi-exclamation-triangle-fill"></i>

                ${String(
                    message
                )}

            </div>

        `;

    }

}


/* ==========================================================
 * DEBUG
 * ==========================================================
 */

function dashboardDebug() {

    console.group(
        "Guardian KPI Dashboard " +
        DASHBOARD_VERSION
    );


    console.log(
        "API:",
        getDashboardAPI()
    );


    console.log(
        "dashboardData:",
        dashboardData
    );


    if (
        dashboardData
    ) {

        console.log(
            "Statistik KPI:",
            dashboardData.statistikKPI
        );


        console.log(
            "Distribusi Anggota:",
            dashboardData.distribusiAnggota
        );


        console.log(
            "Master KPI Kategori:",
            dashboardData.masterKPIKategori
        );


        console.log(
            "Master KPI Indikator:",
            dashboardData.masterKPIIndikator
        );

    }


    console.log(
        "Canvas dashboardChart:",
        document.getElementById(
            "dashboardChart"
        )
    );


    console.log(
        "Canvas dashboardPieChart:",
        document.getElementById(
            "dashboardPieChart"
        )
    );


    console.log(
        "Canvas dashboardKategoriChart:",
        document.getElementById(
            "dashboardKategoriChart"
        )
    );


    console.log(
        "Canvas dashboardIndikatorChart:",
        document.getElementById(
            "dashboardIndikatorChart"
        )
    );


    console.log(
        "Charts:",
        dashboardCharts
    );


    console.groupEnd();

}


/* ==========================================================
 * PUBLIC NAMESPACE
 * ==========================================================
 */

window.GuardianDashboard = {

    version:
        DASHBOARD_VERSION,

    init:
        init,

    load:
        loadDashboard,

    refresh:
        refreshDashboard,

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


/* ==========================================================
 * END
 * ==========================================================
 */
