/**
 * Guardian KPI Web3
 * dashboard.js
 * Version 7.0.2 Enterprise FINAL
 *
 * FINAL:
 * - Compatible dengan API.getDashboard()
 * - Compatible dengan window.API.getDashboard()
 * - Statistik KPI BAR
 * - Distribusi Anggota DOUGHNUT
 * - Kategori Master KPI PIE/DOUGHNUT
 * - Indikator Master KPI BAR
 * - Warna batang berbeda
 * - Gradient visual
 * - Auto refresh 5 menit
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

let dashboardAutoRefreshTimer = null;

const DASHBOARD_VERSION =
    "7.0.2 Enterprise FINAL";

const AUTO_REFRESH_MS =
    5 * 60 * 1000;


/* ==========================================================
 * INIT
 * ==========================================================
 */

function initDashboard() {

    if (
        dashboardInitialized
    ) {

        return;

    }


    dashboardInitialized =
        true;


    console.log(
        "=========================================="
    );

    console.log(
        "Guardian KPI Dashboard " +
        DASHBOARD_VERSION
    );

    console.log(
        "Dashboard initialized."
    );


    bindRefreshButtons();

    loadDashboard();

    startAutoRefresh();

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
        initDashboard,
        {
            once: true
        }
    );

} else {

    initDashboard();

}


/* ==========================================================
 * GET API
 *
 * PENTING:
 *
 * Project Guardian KPI terbukti dapat menjalankan:
 *
 * API.getDashboard()
 *
 * tetapi API tidak selalu berada di:
 *
 * window.API
 *
 * ==========================================================
 */

function getDashboardAPI() {

    /*
     * Prioritas pertama:
     *
     * API.getDashboard()
     */

    try {

        if (
            typeof API !==
            "undefined" &&
            API &&
            typeof API.getDashboard ===
            "function"
        ) {

            return API;

        }

    }

    catch (
        error
    ) {

        console.warn(
            "Pemeriksaan API:",
            error
        );

    }


    /*
     * Fallback:
     *
     * window.API.getDashboard()
     */

    if (
        typeof window !==
        "undefined" &&
        window.API &&
        typeof window.API.getDashboard ===
        "function"
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


                if (
                    api
                ) {

                    console.log(
                        "Guardian KPI API ditemukan."
                    );


                    resolve(
                        api
                    );


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
 * LOAD DASHBOARD
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


    try {

        console.log(
            "Dashboard: requesting data..."
        );


        /*
         * Cari API.
         */

        const api =
            await waitForDashboardAPI();


        /*
         * Panggil API.
         */

        const response =
            await api.getDashboard();


        console.log(
            "Dashboard API Response:",
            response
        );


        /*
         * Validasi response.
         */

        if (
            !response
        ) {

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


        /*
         * Normal response:
         *
         * response.data
         *
         * Beberapa versi:
         *
         * response.data.data
         */

        let data =
            response.data;


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


        /*
         * Normalize.
         */

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


        /*
         * Render.
         */

        renderDashboard(
            dashboardData
        );


        console.log(
            "Dashboard render selesai."
        );

    }

    catch (
        error
    ) {

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

    }

}


/* ==========================================================
 * NUMBER
 * ==========================================================
 */

function toNumber(
    value
) {

    if (
        value ===
        null ||
        value ===
        undefined ||
        value ===
        ""
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


    const number =
        Number(
            text
        );


    return Number.isFinite(
        number
    )
        ? number
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
 * NORMALIZE LIST
 * ==========================================================
 */

function normalizeList(
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
                        ),

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
 * NORMALIZE INDICATOR
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

                return {

                    id:
                        String(
                            item?.id ??
                            ""
                        ),

                    label:
                        String(
                            item?.label ??
                            item?.indicator ??
                            item?.indikator ??
                            item?.nama ??
                            item?.id ??
                            ""
                        ),

                    kategori:
                        String(
                            item?.kategori ??
                            item?.category ??
                            ""
                        ),

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


    /*
     * CORE
     */

    data.totalAnggota =
        toNumber(
            data.totalAnggota
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


    /*
     * ANGGOTA
     */

    data.anggotaAktif =
        toNumber(
            data.anggotaAktif
        );


    data.anggotaNonAktif =
        toNumber(
            data.anggotaNonAktif
        );


    /*
     * MASTER KPI
     */

    data.masterKPIAktif =
        toNumber(
            data.masterKPIAktif
        );


    data.masterKPINonAktif =
        toNumber(
            data.masterKPINonAktif
        );


    /*
     * AVERAGE
     */

    data.averageKPI =
        toNumber(
            data.averageKPI
        );


    /*
     * DISTRIBUSI ANGGOTA
     */

    data.distribusiAnggota =
        normalizeList(
            data.distribusiAnggota ||
            data.anggotaDistribution ||
            data.anggotaDistribusi ||
            []
        );


    /*
     * Jika backend tidak mengirim
     * distribusi, buat dari card.
     */

    if (
        !data.distribusiAnggota.length
    ) {

        data.distribusiAnggota = [

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


    /*
     * MASTER KPI KATEGORI
     */

    data.masterKPIKategori =
        normalizeList(
            data.masterKPIKategori ||
            data.kategoriMasterKPI ||
            []
        );


    /*
     * MASTER KPI INDIKATOR
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
        normalizeList(
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
 * RENDER DASHBOARD
 * ==========================================================
 */

function renderDashboard(
    data
) {

    if (
        !data
    ) {

        return;

    }


    renderCards(
        data
    );


    renderSummary(
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


    renderGeneratedAt(
        data.generatedAt
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

    const list =
        Array.isArray(
            ids
        )
            ? ids
            : [ids];


    for (
        const id of list
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

            return element;

        }

    }


    return null;

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
            "summary-totalAnggota",
            "totalAnggotaSummary"
        ],
        formatNumber(
            data.totalAnggota
        )
    );


    setText(
        [
            "summaryAnggotaAktif",
            "summary-anggotaAktif",
            "anggotaAktifSummary"
        ],
        formatNumber(
            data.anggotaAktif
        )
    );


    setText(
        [
            "summaryAnggotaNonAktif",
            "summary-anggotaNonAktif",
            "anggotaNonAktifSummary"
        ],
        formatNumber(
            data.anggotaNonAktif
        )
    );


    setText(
        [
            "summaryTotalGroup",
            "summary-totalGroup",
            "totalGroupSummary"
        ],
        formatNumber(
            data.totalGroup
        )
    );


    setText(
        [
            "summaryTotalMasterKPI",
            "summary-totalMasterKPI",
            "masterKPISummary"
        ],
        formatNumber(
            data.totalMasterKPI
        )
    );


    setText(
        [
            "summaryTotalPenilaian",
            "summary-totalPenilaian",
            "totalPenilaianSummary"
        ],
        formatNumber(
            data.totalPenilaian
        )
    );


    setText(
        [
            "summaryAverageKPI",
            "summary-averageKPI",
            "averageKPISummary"
        ],
        formatDecimal(
            data.averageKPI
        )
    );


    /*
     * Summary container.
     */

    const box =
        document.getElementById(
            "dashboardSummary"
        );


    if (
        box &&
        !box.dataset.rendered
    ) {

        box.innerHTML = `

            <div class="dashboard-summary-row">

                <span>
                    Total Anggota
                </span>

                <strong>
                    ${formatNumber(
                        data.totalAnggota
                    )}
                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Anggota Aktif
                </span>

                <strong class="text-success">

                    ${formatNumber(
                        data.anggotaAktif
                    )}

                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Non Aktif
                </span>

                <strong class="text-danger">

                    ${formatNumber(
                        data.anggotaNonAktif
                    )}

                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Total Group
                </span>

                <strong>

                    ${formatNumber(
                        data.totalGroup
                    )}

                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Master KPI
                </span>

                <strong>

                    ${formatNumber(
                        data.totalMasterKPI
                    )}

                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Total Penilaian
                </span>

                <strong>

                    ${formatNumber(
                        data.totalPenilaian
                    )}

                </strong>

            </div>


            <div class="dashboard-summary-row">

                <span>
                    Average KPI
                </span>

                <strong>

                    ${formatDecimal(
                        data.averageKPI
                    )}

                </strong>

            </div>

        `;


        box.dataset.rendered =
            "true";

    }

}


/* ==========================================================
 * GENERATED AT
 * ==========================================================
 */

function renderGeneratedAt(
    value
) {

    if (
        !value
    ) {

        return;

    }


    let text =
        String(
            value
        );


    const date =
        new Date(
            value
        );


    if (
        !Number.isNaN(
            date.getTime()
        )
    ) {

        text =
            date.toLocaleString(
                "id-ID"
            );

    }


    setText(
        [
            "lastRefresh",
            "dashboardLastRefresh",
            "lastUpdated",
            "generatedAt"
        ],
        text
    );

}


/* ==========================================================
 * FIND / CREATE CANVAS
 * ==========================================================
 */

function findCanvas(
    primary,
    alternatives,
    containers
) {

    const ids = [

        primary,

        ...(alternatives || [])

    ];


    /*
     * Cari canvas berdasarkan ID.
     */

    for (
        const id of ids
    ) {

        const element =
            document.getElementById(
                id
            );


        if (
            element &&
            element.tagName ===
            "CANVAS"
        ) {

            return element;

        }

    }


    /*
     * Cari canvas di container.
     */

    for (
        const id of containers || []
    ) {

        const container =
            document.getElementById(
                id
            );


        if (
            container
        ) {

            const existing =
                container.querySelector(
                    "canvas"
                );


            if (
                existing
            ) {

                return existing;

            }

        }

    }


    /*
     * Buat canvas jika container ada.
     */

    for (
        const id of containers || []
    ) {

        const container =
            document.getElementById(
                id
            );


        if (
            !container
        ) {

            continue;

        }


        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "dashboard-chart-wrapper";


        wrapper.style.position =
            "relative";


        wrapper.style.width =
            "100%";


        wrapper.style.height =
            "360px";


        wrapper.style.minHeight =
            "300px";


        const canvas =
            document.createElement(
                "canvas"
            );


        canvas.id =
            primary;


        canvas.style.width =
            "100%";


        canvas.style.height =
            "100%";


        wrapper.appendChild(
            canvas
        );


        container.appendChild(
            wrapper
        );


        return canvas;

    }


    return null;

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

        console.warn(
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
    canvas
) {

    if (
        !canvas
    ) {

        return;

    }


    const key =
        canvas.id;


    if (
        dashboardCharts[key]
    ) {

        try {

            dashboardCharts[key]
                .destroy();

        }

        catch (
            error
        ) {

            console.warn(
                error
            );

        }


        delete dashboardCharts[key];

    }


    /*
     * Chart.js global lookup.
     */

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

            catch (
                error
            ) {

                console.warn(
                    error
                );

            }

        }

    }

}


/* ==========================================================
 * HEX -> RGB
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
 * BAR GRADIENT
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


    const rgb =
        hexToRgb(
            color
        );


    if (
        !rgb
    ) {

        return color;

    }


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            360
        );


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
            rgb.r - 60,
            0
        ) +
        "," +
        Math.max(
            rgb.g - 60,
            0
        ) +
        "," +
        Math.max(
            rgb.b - 60,
            0
        ) +
        ",0.98)"
    );


    return gradient;

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

    const canvas =
        findCanvas(
            "dashboardChart",
            [
                "statistikKPIChart",
                "chartStatistikKPI"
            ],
            [
                "statistikKPI",
                "dashboardChartContainer"
            ]
        );


    if (
        !canvas ||
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


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
     * Warna setiap batang berbeda.
     */

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
                                9,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                110

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

                        },

                        tooltip: {

                            backgroundColor:
                                "rgba(10,16,28,.96)",

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

                }

            }
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

    const canvas =
        findCanvas(
            "dashboardPieChart",
            [
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
        !canvas ||
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


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

        "#00c878",

        "#ff334d",

        "#1677ff",

        "#ffc400",

        "#9b59ff",

        "#ff8a00"

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
                                12,

                            spacing:
                                3

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "60%",

                    animation: {

                        duration:
                            1000

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

                                padding:
                                    14

                            }

                        }

                    }

                }

            }
        );

}


/* ==========================================================
 * CHART 3
 *
 * KATEGORI MASTER KPI
 *
 * PIE / DOUGHNUT
 * ==========================================================
 */

function renderKategoriMasterKPIChart(
    data
) {

    const canvas =
        findCanvas(
            "distributionChart",
            [
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
        !canvas ||
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    console.log(
        "Render Kategori Master KPI:",
        items
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
                                14,

                            spacing:
                                4

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    cutout:
                        "58%",

                    animation: {

                        duration:
                            1200,

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

                                padding:
                                    14

                            }

                        },

                        tooltip: {

                            padding:
                                12

                        }

                    }

                }

            }
        );

}


/* ==========================================================
 * CHART 4
 *
 * INDIKATOR MASTER KPI
 *
 * BAR
 * ==========================================================
 */

function renderIndikatorMasterKPIChart(
    data
) {

    const canvas =
        findCanvas(
            "kpiChart",
            [
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
        !canvas ||
        !chartReady()
    ) {

        return;

    }


    destroyChart(
        canvas
    );


    const items =
        Array.isArray(
            data
        )
            ? data
            : [];


    console.log(
        "Render Indikator Master KPI:",
        items
    );


    const labels =
        items.map(
            function (
                item
            ) {

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

                        },

                        tooltip: {

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
                                    "#9aabba",

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
                                    "#9aabba",

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

                }

            }
        );

}


/* ==========================================================
 * REFRESH BUTTON
 * ==========================================================
 */

function bindRefreshButtons() {

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
 * AUTO REFRESH
 * ==========================================================
 */

function startAutoRefresh() {

    if (
        dashboardAutoRefreshTimer
    ) {

        clearInterval(
            dashboardAutoRefreshTimer
        );

    }


    dashboardAutoRefreshTimer =
        setInterval(
            function () {

                loadDashboard();

            },
            AUTO_REFRESH_MS
        );


    console.log(
        "Dashboard auto-refresh: 5 menit"
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
 *
 * Setelah halaman terbuka, bisa jalankan:
 *
 * dashboardDebug()
 *
 * ==========================================================
 */

function dashboardDebug() {

    console.group(
        "Guardian KPI Dashboard " +
        DASHBOARD_VERSION
    );


    console.log(
        "API lexical:",
        typeof API !==
        "undefined"
            ? API
            : "undefined"
    );


    console.log(
        "window.API:",
        window.API
    );


    console.log(
        "Data:",
        dashboardData
    );


    if (
        dashboardData
    ) {

        console.log(
            "Total Anggota:",
            dashboardData.totalAnggota
        );


        console.log(
            "Total Group:",
            dashboardData.totalGroup
        );


        console.log(
            "Total Master KPI:",
            dashboardData.totalMasterKPI
        );


        console.log(
            "Total Penilaian:",
            dashboardData.totalPenilaian
        );


        console.log(
            "Anggota Aktif:",
            dashboardData.anggotaAktif
        );


        console.log(
            "Anggota Non Aktif:",
            dashboardData.anggotaNonAktif
        );


        console.log(
            "Average KPI:",
            dashboardData.averageKPI
        );


        console.log(
            "Distribusi:",
            dashboardData.distribusiAnggota
        );


        console.log(
            "Kategori Master KPI:",
            dashboardData.masterKPIKategori
        );


        console.log(
            "Indikator Master KPI:",
            dashboardData.masterKPIIndikator
        );

    }


    console.log(
        "Charts:",
        dashboardCharts
    );


    console.groupEnd();

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

    version:
        DASHBOARD_VERSION,

    init:
        initDashboard,

    load:
        loadDashboard,

    refresh:
        dashboardRefresh,

    render:
        renderDashboard,

    debug:
        dashboardDebug,

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
