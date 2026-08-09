/**
 * ==========================================================
 * Guardian KPI Web3
 * File    : dashboard.js
 * Version : 7.0.0 Enterprise FINAL
 * ==========================================================
 *
 * Dashboard Frontend
 *
 * Compatible dengan Dashboard.gs 6.2.0 Enterprise
 *
 * DATA:
 * - totalAnggota
 * - totalGroup
 * - totalMasterKPI
 * - totalPenilaian
 * - anggotaAktif
 * - anggotaNonAktif
 * - masterKPIAktif
 * - masterKPINonAktif
 * - averageKPI
 * - distribusiAnggota
 * - masterKPIKategori
 * - masterKPIIndikator
 *
 * CHART:
 * 1. Statistik KPI
 * 2. Distribusi Anggota
 * 3. Kategori Master KPI
 * 4. Indikator Master KPI
 *
 * ==========================================================
 */

"use strict";


/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let dashboardData = null;

let dashboardCharts = {};

let dashboardInitialized = false;

let dashboardLoading = false;

let dashboardAutoRefreshTimer = null;

const DASHBOARD_VERSION =
    "7.0.0 Enterprise FINAL";


/* ==========================================================
 * CONFIG
 * ==========================================================
 */

const DASHBOARD_CONFIG = {

    autoRefreshMinutes: 5,

    apiTimeout: 15000,

    chartAnimationDuration: 1000,

    colors: {

        cyan:
            "#00d9ff",

        blue:
            "#1677ff",

        green:
            "#00c878",

        red:
            "#ff334d",

        yellow:
            "#ffc400",

        purple:
            "#9b59ff",

        orange:
            "#ff8a00",

        pink:
            "#ff4da6",

        teal:
            "#00c7a7"

    }

};


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


    /*
     * Refresh button
     */

    bindDashboardRefreshButton();


    /*
     * Initial load
     */

    loadDashboard();


    /*
     * Auto refresh
     */

    startDashboardAutoRefresh();

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

}

else {

    initDashboard();

}


/* ==========================================================
 * BIND REFRESH BUTTON
 * ==========================================================
 */

function bindDashboardRefreshButton() {

    const buttons =
        document.querySelectorAll(
            "#btnRefreshDashboard, " +
            "#refreshDashboard, " +
            "[data-dashboard-refresh]"
        );


    buttons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    loadDashboard(
                        true
                    );

                }
            );

        }
    );

}


/* ==========================================================
 * LOAD DASHBOARD
 * ==========================================================
 */

async function loadDashboard(
    manualRefresh
) {

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


    console.log(
        "Dashboard V7: requesting data..."
    );


    try {

        /*
         * Tunggu API tersedia.
         */

        const api =
            await waitForDashboardAPI(
                DASHBOARD_CONFIG.apiTimeout
            );


        if (
            !api ||
            typeof api.getDashboard !==
            "function"
        ) {

            throw new Error(
                "API.getDashboard tidak tersedia."
            );

        }


        /*
         * Request API
         */

        const response =
            await api.getDashboard();


        console.log(
            "Dashboard API Response:",
            response
        );


        /*
         * Validasi response
         */

        if (
            !response
        ) {

            throw new Error(
                "Response Dashboard kosong."
            );

        }


        if (
            response.success === false
        ) {

            throw new Error(
                response.message ||
                "Dashboard API gagal."
            );

        }


        /*
         * Ambil data.
         *
         * Dashboard.gs:
         *
         * {
         *   success: true,
         *   message: "...",
         *   data: {...}
         * }
         */

        let data =
            response.data;


        /*
         * Beberapa versi API bisa
         * mengembalikan nested data:
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
            "Dashboard Statistics:",
            dashboardData.statistikKPI
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
         * Render
         */

        renderDashboard(
            dashboardData
        );


        console.log(
            "Dashboard V7 render selesai."
        );


    }

    catch (error) {

        console.error(
            "Dashboard render error:",
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
 * WAIT FOR API
 * ==========================================================
 */

function waitForDashboardAPI(
    timeout
) {

    return new Promise(
        function (
            resolve,
            reject
        ) {

            const started =
                Date.now();


            function check() {

                if (
                    window.API &&
                    typeof window.API
                        .getDashboard ===
                        "function"
                ) {

                    resolve(
                        window.API
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
                            "API.getDashboard tidak tersedia setelah menunggu " +
                            (
                                timeout /
                                1000
                            ) +
                            " detik."
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
        normalizeDistribution(
            data.distribusiAnggota ||
            data.anggotaDistribution ||
            data.anggotaDistribusi ||
            []
        );


    /*
     * MASTER KPI CATEGORY
     *
     * Prioritas:
     *
     * 1. masterKPIKategori
     * 2. kategoriMasterKPI
     */

    data.masterKPIKategori =
        normalizeCategoryData(
            data.masterKPIKategori ||
            data.kategoriMasterKPI ||
            []
        );


    /*
     * MASTER KPI INDICATOR
     *
     * Prioritas:
     *
     * 1. masterKPIIndikator
     * 2. indikatorMasterKPI
     */

    data.masterKPIIndikator =
        normalizeIndicatorData(
            data.masterKPIIndikator ||
            data.indikatorMasterKPI ||
            []
        );


    /*
     * STATISTIK
     */

    data.statistikKPI =
        normalizeStatistics(
            data.statistikKPI
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
 * NORMALIZE DISTRIBUTION
 * ==========================================================
 */

function normalizeDistribution(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }


    return source
        .map(
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
                        toNumber(
                            item.value ??
                            item.jumlah ??
                            item.count
                        ),

                    color:
                        item.color ||
                        null

                };

            }
        )
        .filter(
            function (item) {

                return (
                    item.label !==
                    ""
                );

            }
        );

}


/* ==========================================================
 * NORMALIZE CATEGORY
 * ==========================================================
 */

function normalizeCategoryData(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }


    return source
        .map(
            function (item) {

                return {

                    label:
                        String(
                            item.label ||
                            item.kategori ||
                            item.category ||
                            ""
                        )
                        .trim(),

                    value:
                        toNumber(
                            item.value ??
                            item.jumlah ??
                            item.count
                        )

                };

            }
        )
        .filter(
            function (item) {

                return (
                    item.label !== "" &&
                    item.value >= 0
                );

            }
        );

}


/* ==========================================================
 * NORMALIZE INDICATOR
 * ==========================================================
 */

function normalizeIndicatorData(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }


    return source
        .map(
            function (item) {

                return {

                    id:
                        String(
                            item.id ||
                            ""
                        ),

                    label:
                        String(
                            item.label ||
                            item.indicator ||
                            item.indikator ||
                            item.nama ||
                            item.id ||
                            ""
                        )
                        .trim(),

                    indicator:
                        String(
                            item.indicator ||
                            item.indikator ||
                            item.nama ||
                            item.label ||
                            ""
                        )
                        .trim(),

                    kategori:
                        String(
                            item.kategori ||
                            item.category ||
                            ""
                        )
                        .trim(),

                    bobot:
                        toNumber(
                            item.bobot
                        ),

                    target:
                        toNumber(
                            item.target
                        ),

                    status:
                        String(
                            item.status ||
                            ""
                        )
                        .trim()

                };

            }
        )
        .filter(
            function (item) {

                return (
                    item.label !== ""
                );

            }
        );

}


/* ==========================================================
 * NORMALIZE STATISTICS
 * ==========================================================
 */

function normalizeStatistics(
    source
) {

    if (
        !Array.isArray(source)
    ) {

        return [];

    }


    return source
        .map(
            function (item) {

                return {

                    label:
                        String(
                            item.label ||
                            item.nama ||
                            ""
                        ),

                    value:
                        toNumber(
                            item.value ??
                            item.jumlah ??
                            item.count
                        )

                };

            }
        )
        .filter(
            function (item) {

                return (
                    item.label !== ""
                );

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

    if (
        !data
    ) {

        return;

    }


    /*
     * ==========================================
     * CARDS
     * ==========================================
     */

    renderDashboardCards(
        data
    );


    /*
     * ==========================================
     * SUMMARY
     * ==========================================
     */

    renderDashboardSummary(
        data
    );


    /*
     * ==========================================
     * CHART CONTAINERS
     * ==========================================
     */

    ensureDashboardChartContainers();


    /*
     * ==========================================
     * CHART 1
     * Statistik KPI
     * ==========================================
     */

    renderStatistikKPIChart(
        data.statistikKPI
    );


    /*
     * ==========================================
     * CHART 2
     * Distribusi Anggota
     * ==========================================
     */

    renderDistribusiAnggotaChart(
        data.distribusiAnggota
    );


    /*
     * ==========================================
     * CHART 3
     * Kategori Master KPI
     * ==========================================
     */

    renderKategoriMasterKPIChart(
        data.masterKPIKategori
    );


    /*
     * ==========================================
     * CHART 4
     * Indikator Master KPI
     * ==========================================
     */

    renderIndikatorMasterKPIChart(
        data.masterKPIIndikator
    );


    /*
     * ==========================================
     * OPTIONAL SECTIONS
     * ==========================================
     */

    renderDatabaseInfo(
        data
    );


    renderSystemInfo(
        data
    );


    renderLastRefresh(
        data
    );

}


/* ==========================================================
 * RENDER CARDS
 * ==========================================================
 */

function renderDashboardCards(
    data
) {

    setElementValue(
        [
            "totalAnggota",
            "dashboardTotalAnggota",
            "cardTotalAnggota"
        ],
        formatNumber(
            data.totalAnggota
        )
    );


    setElementValue(
        [
            "anggotaAktif",
            "dashboardAnggotaAktif",
            "cardAnggotaAktif"
        ],
        formatNumber(
            data.anggotaAktif
        )
    );


    setElementValue(
        [
            "anggotaNonAktif",
            "dashboardAnggotaNonAktif",
            "cardAnggotaNonAktif"
        ],
        formatNumber(
            data.anggotaNonAktif
        )
    );


    setElementValue(
        [
            "totalGroup",
            "dashboardTotalGroup",
            "cardTotalGroup"
        ],
        formatNumber(
            data.totalGroup
        )
    );


    setElementValue(
        [
            "totalMasterKPI",
            "dashboardTotalMasterKPI",
            "cardTotalMasterKPI"
        ],
        formatNumber(
            data.totalMasterKPI
        )
    );


    setElementValue(
        [
            "totalPenilaian",
            "dashboardTotalPenilaian",
            "cardTotalPenilaian"
        ],
        formatNumber(
            data.totalPenilaian
        )
    );


    setElementValue(
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

function renderDashboardSummary(
    data
) {

    const summary =
        data.ringkasan ||
        {};


    const values = {

        totalAnggota:
            data.totalAnggota,

        anggotaAktif:
            data.anggotaAktif,

        anggotaNonAktif:
            data.anggotaNonAktif,

        totalGroup:
            data.totalGroup,

        masterKPI:
            data.totalMasterKPI,

        totalMasterKPI:
            data.totalMasterKPI,

        totalPenilaian:
            data.totalPenilaian,

        averageKPI:
            data.averageKPI

    };


    Object.keys(
        values
    ).forEach(
        function (key) {

            const selectors = [

                "summary-" +
                key,

                "summary" +
                capitalize(
                    key
                ),

                key +
                "Summary"

            ];


            setElementValue(
                selectors,
                formatNumber(
                    values[key]
                )
            );

        }
    );


    /*
     * Summary generic elements.
     */

    const summaryContainer =
        document.getElementById(
            "dashboardSummary"
        );


    if (
        summaryContainer &&
        !summaryContainer.dataset.rendered
    ) {

        summaryContainer.innerHTML = `

            <div class="dashboard-summary-row">

                <span>Total Anggota</span>

                <strong>
                    ${formatNumber(
                        data.totalAnggota
                    )}
                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Anggota Aktif</span>

                <strong class="text-success">

                    ${formatNumber(
                        data.anggotaAktif
                    )}

                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Non Aktif</span>

                <strong class="text-danger">

                    ${formatNumber(
                        data.anggotaNonAktif
                    )}

                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Total Group</span>

                <strong>

                    ${formatNumber(
                        data.totalGroup
                    )}

                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Master KPI</span>

                <strong>

                    ${formatNumber(
                        data.totalMasterKPI
                    )}

                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Total Penilaian</span>

                <strong>

                    ${formatNumber(
                        data.totalPenilaian
                    )}

                </strong>

            </div>

            <div class="dashboard-summary-row">

                <span>Average KPI</span>

                <strong>

                    ${formatDecimal(
                        data.averageKPI
                    )}

                </strong>

            </div>

        `;


        summaryContainer.dataset.rendered =
            "true";

    }

}


/* ==========================================================
 * ENSURE CHART CONTAINERS
 * ==========================================================
 */

function ensureDashboardChartContainers() {

    /*
     * Chart utama
     */

    ensureCanvas(
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


    /*
     * Distribusi anggota
     */

    ensureCanvas(
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


    /*
     * Kategori Master KPI
     *
     * Jika HTML belum memiliki canvas,
     * kita buat otomatis.
     */

    ensureCanvas(
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


    /*
     * Indikator Master KPI
     */

    ensureCanvas(
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

}


/* ==========================================================
 * ENSURE CANVAS
 * ==========================================================
 */

function ensureCanvas(
    primaryId,
    alternativeIds,
    containerIds
) {

    /*
     * Jika canvas sudah ada,
     * gunakan canvas tersebut.
     */

    if (
        document.getElementById(
            primaryId
        )
    ) {

        return document.getElementById(
            primaryId
        );

    }


    /*
     * Cari alternative canvas.
     */

    for (
        let i = 0;
        i < alternativeIds.length;
        i++
    ) {

        const canvas =
            document.getElementById(
                alternativeIds[i]
            );


        if (
            canvas
        ) {

            return canvas;

        }

    }


    /*
     * Cari container.
     */

    let container =
        null;


    for (
        let i = 0;
        i < containerIds.length;
        i++
    ) {

        container =
            document.getElementById(
                containerIds[i]
            );


        if (
            container
        ) {

            break;

        }

    }


    /*
     * Kalau container tidak ada,
     * cari berdasarkan class umum.
     */

    if (
        !container
    ) {

        return null;

    }


    /*
     * Buat wrapper.
     */

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
        primaryId;


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


/* ==========================================================
 * STATISTIK KPI CHART
 * ==========================================================
 */

function renderStatistikKPIChart(
    data
) {

    const canvas =
        document.getElementById(
            "dashboardChart"
        );


    if (
        !canvas
    ) {

        console.warn(
            "Canvas dashboardChart tidak ditemukan."
        );

        return;

    }


    if (
        !ensureChartJS()
    ) {

        return;

    }


    const items =
        Array.isArray(data)
            ? data
            : [];


    const labels =
        items.map(
            function (item) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return toNumber(
                    item.value
                );

            }
        );


    destroyChart(
        "dashboardChart"
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const gradient =
        createVerticalGradient(
            ctx,
            [
                "#19c6ff",
                "#1677ff",
                "#173fbd"
            ]
        );


    dashboardCharts[
        "dashboardChart"
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
                                gradient,

                            borderColor:
                                "#00d9ff",

                            borderWidth:
                                1,

                            borderRadius:
                                8,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                110

                        }

                    ]

                },

                options:
                    createBarOptions(
                        false
                    )

            }
        );

}


/* ==========================================================
 * DISTRIBUSI ANGGOTA
 * ==========================================================
 */

function renderDistribusiAnggotaChart(
    data
) {

    const canvas =
        document.getElementById(
            "dashboardPieChart"
        );


    if (
        !canvas
    ) {

        return;

    }


    if (
        !ensureChartJS()
    ) {

        return;

    }


    const items =
        Array.isArray(data)
            ? data
            : [];


    const labels =
        items.map(
            function (item) {

                return item.label;

            }
        );


    const values =
        items.map(
            function (item) {

                return toNumber(
                    item.value
                );

            }
        );


    const colors = [

        DASHBOARD_CONFIG.colors.green,

        DASHBOARD_CONFIG.colors.red

    ];


    destroyChart(
        "dashboardPieChart"
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    dashboardCharts[
        "dashboardPieChart"
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
                                colors,

                            borderColor:
                                "#101722",

                            borderWidth:
                                4,

                            hoverOffset:
                                10,

                            spacing:
                                3

                        }

                    ]

                },

                options:
                    createDoughnutOptions(
                        "Anggota"
                    )

            }
        );

}


/* ==========================================================
 * KATEGORI MASTER KPI
 * ==========================================================
 *
 * PIE / DOUGHNUT
 *
 * ==========================================================
 */

function renderKategoriMasterKPIChart(
    data
) {

    let canvas =
        document.getElementById(
            "distributionChart"
        );


    /*
     * Coba ID lain.
     */

    if (
        !canvas
    ) {

        canvas =
            document.getElementById(
                "kategoriMasterKPIChart"
            );

    }


    /*
     * Kalau masih tidak ada,
     * buat canvas di section kategori.
     */

    if (
        !canvas
    ) {

        canvas =
            createChartInSection(
                [
                    "kategoriMasterKPI",
                    "masterKPIKategori",
                    "kategoriMasterKPIContainer"
                ],
                "distributionChart"
            );

    }


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Kategori Master KPI tidak ditemukan."
        );

        return;

    }


    if (
        !ensureChartJS()
    ) {

        return;

    }


    const items =
        Array.isArray(data)
            ? data
            : [];


    /*
     * Tidak ada data.
     */

    if (
        !items.length
    ) {

        showChartEmptyState(
            canvas,
            "Data kategori Master KPI belum tersedia."
        );

        return;

    }


    hideChartEmptyState(
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

                return toNumber(
                    item.value
                );

            }
        );


    /*
     * Palet warna nyata.
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


    destroyChart(
        "distributionChart"
    );


    destroyChart(
        "kategoriMasterKPIChart"
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    dashboardCharts[
        "distributionChart"
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
                    createDoughnutOptions(
                        "Master KPI"
                    )

            }
        );


    console.log(
        "Kategori Master KPI chart rendered:",
        items
    );

}


/* ==========================================================
 * INDIKATOR MASTER KPI
 * ==========================================================
 *
 * BAR CHART
 *
 * ==========================================================
 */

function renderIndikatorMasterKPIChart(
    data
) {

    let canvas =
        document.getElementById(
            "kpiChart"
        );


    if (
        !canvas
    ) {

        canvas =
            document.getElementById(
                "indikatorMasterKPIChart"
            );

    }


    if (
        !canvas
    ) {

        canvas =
            createChartInSection(
                [
                    "indikatorMasterKPI",
                    "masterKPIIndikator",
                    "indikatorMasterKPIContainer"
                ],
                "kpiChart"
            );

    }


    if (
        !canvas
    ) {

        console.warn(
            "Canvas Indikator Master KPI tidak ditemukan."
        );

        return;

    }


    if (
        !ensureChartJS()
    ) {

        return;

    }


    const items =
        Array.isArray(data)
            ? data
            : [];


    if (
        !items.length
    ) {

        showChartEmptyState(
            canvas,
            "Data indikator Master KPI belum tersedia."
        );

        return;

    }


    hideChartEmptyState(
        canvas
    );


    const labels =
        items.map(
            function (item) {

                return (
                    item.id
                    ? item.id +
                      " - " +
                      item.label
                    : item.label
                );

            }
        );


    const values =
        items.map(
            function (item) {

                return toNumber(
                    item.bobot
                );

            }
        );


    destroyChart(
        "kpiChart"
    );


    destroyChart(
        "indikatorMasterKPIChart"
    );


    const ctx =
        canvas.getContext(
            "2d"
        );


    const gradient =
        createHorizontalGradient(
            ctx,
            [
                "#1677ff",
                "#00c7ff"
            ]
        );


    dashboardCharts[
        "kpiChart"
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
                                gradient,

                            borderColor:
                                "#00c7ff",

                            borderWidth:
                                1,

                            borderRadius:
                                7,

                            borderSkipped:
                                false,

                            maxBarThickness:
                                65

                        }

                    ]

                },

                options:
                    createIndicatorBarOptions()

            }
        );


    console.log(
        "Indikator Master KPI chart rendered:",
        items
    );

}


/* ==========================================================
 * CREATE CHART IN SECTION
 * ==========================================================
 */

function createChartInSection(
    sectionIds,
    canvasId
) {

    let section =
        null;


    for (
        let i = 0;
        i < sectionIds.length;
        i++
    ) {

        section =
            document.getElementById(
                sectionIds[i]
            );


        if (
            section
        ) {

            break;

        }

    }


    if (
        !section
    ) {

        /*
         * Cari heading berdasarkan text.
         */

        const headings =
            document.querySelectorAll(
                "h1,h2,h3,h4,h5,h6,.card-title"
            );


        for (
            let i = 0;
            i < headings.length;
            i++
        ) {

            const text =
                (
                    headings[i]
                        .textContent ||
                    ""
                )
                .trim()
                .toLowerCase();


            if (
                text.includes(
                    "kategori master kpi"
                ) ||
                text.includes(
                    "indikator master kpi"
                )
            ) {

                section =
                    headings[i]
                        .closest(
                            ".card"
                        ) ||
                    headings[i]
                        .parentElement;

                break;

            }

        }

    }


    if (
        !section
    ) {

        return null;

    }


    /*
     * Jangan membuat duplicate.
     */

    let canvas =
        section.querySelector(
            "canvas"
        );


    if (
        canvas
    ) {

        return canvas;

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


    wrapper.style.padding =
        "10px";


    canvas =
        document.createElement(
            "canvas"
        );


    canvas.id =
        canvasId;


    canvas.style.width =
        "100%";


    canvas.style.height =
        "100%";


    wrapper.appendChild(
        canvas
    );


    section.appendChild(
        wrapper
    );


    return canvas;

}


/* ==========================================================
 * CHART.JS DETECTION
 * ==========================================================
 */

function ensureChartJS() {

    if (
        typeof window.Chart !==
        "undefined"
    ) {

        return true;

    }


    console.warn(
        "Chart.js tidak tersedia."
    );


    showGlobalChartWarning();


    return false;

}


/* ==========================================================
 * CREATE BAR OPTIONS
 * ==========================================================
 */

function createBarOptions(
    horizontal
) {

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        animation: {

            duration:
                DASHBOARD_CONFIG
                    .chartAnimationDuration,

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

                borderColor:
                    "#00d9ff",

                borderWidth:
                    1,

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

                beginAtZero:
                    true,

                grid: {

                    color:
                        "rgba(255,255,255,.06)",

                    drawBorder:
                        false

                },

                ticks: {

                    color:
                        "#8fa1b5",

                    font: {

                        size:
                            10

                    }

                }

            },

            y: {

                beginAtZero:
                    true,

                grid: {

                    color:
                        "rgba(255,255,255,.06)",

                    drawBorder:
                        false

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
 * INDICATOR BAR OPTIONS
 * ==========================================================
 */

function createIndicatorBarOptions() {

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        animation: {

            duration:
                DASHBOARD_CONFIG
                    .chartAnimationDuration,

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

                borderColor:
                    "#00c7ff",

                borderWidth:
                    1,

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
                        "rgba(255,255,255,.06)"

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

function createDoughnutOptions(
    centerLabel
) {

    return {

        responsive:
            true,

        maintainAspectRatio:
            false,

        cutout:
            "62%",

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
                        "circle",

                    font: {

                        size:
                            10

                    }

                }

            },

            tooltip: {

                backgroundColor:
                    "rgba(10,16,28,.96)",

                borderColor:
                    "#00d9ff",

                borderWidth:
                    1,

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
                                context.parsed;


                            const dataset =
                                context.dataset;


                            const total =
                                dataset.data
                                    .reduce(
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


                            const percent =
                                total >
                                0
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
                                percent
                                    .toFixed(
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
 * GRADIENT VERTICAL
 * ==========================================================
 */

function createVerticalGradient(
    ctx,
    colors
) {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            400
        );


    const step =
        1 /
        Math.max(
            colors.length -
            1,
            1
        );


    colors.forEach(
        function (
            color,
            index
        ) {

            gradient.addColorStop(
                index *
                step,
                color
            );

        }
    );


    return gradient;

}


/* ==========================================================
 * GRADIENT HORIZONTAL
 * ==========================================================
 */

function createHorizontalGradient(
    ctx,
    colors
) {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            500,
            0
        );


    const step =
        1 /
        Math.max(
            colors.length -
            1,
            1
        );


    colors.forEach(
        function (
            color,
            index
        ) {

            gradient.addColorStop(
                index *
                step,
                color
            );

        }
    );


    return gradient;

}


/* ==========================================================
 * DESTROY CHART
 * ==========================================================
 */

function destroyChart(
    key
) {

    /*
     * Instance yang tersimpan.
     */

    if (
        dashboardCharts[key]
    ) {

        try {

            dashboardCharts[key]
                .destroy();

        }

        catch (e) {

            console.warn(
                "Chart destroy error:",
                e
            );

        }


        delete dashboardCharts[
            key
        ];

    }


    /*
     * Jika Chart.js memiliki
     * instance yang terdaftar.
     */

    if (
        typeof Chart !==
        "undefined" &&
        typeof Chart.getChart ===
        "function"
    ) {

        const canvas =
            document.getElementById(
                key
            );


        if (
            canvas
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

}


/* ==========================================================
 * EMPTY CHART STATE
 * ==========================================================
 */

function showChartEmptyState(
    canvas,
    message
) {

    if (
        !canvas
    ) {

        return;

    }


    destroyCanvasChart(
        canvas
    );


    const wrapper =
        canvas.parentElement;


    if (
        !wrapper
    ) {

        return;

    }


    wrapper.style.position =
        "relative";


    let empty =
        wrapper.querySelector(
            ".dashboard-chart-empty"
        );


    if (
        !empty
    ) {

        empty =
            document.createElement(
                "div"
            );


        empty.className =
            "dashboard-chart-empty";


        empty.style.position =
            "absolute";


        empty.style.inset =
            "0";


        empty.style.display =
            "flex";


        empty.style.alignItems =
            "center";


        empty.style.justifyContent =
            "center";


        empty.style.textAlign =
            "center";


        empty.style.color =
            "#6f8194";


        empty.style.fontSize =
            "13px";


        empty.style.padding =
            "20px";


        wrapper.appendChild(
            empty
        );

    }


    empty.textContent =
        message;


    canvas.style.visibility =
        "hidden";

}


/* ==========================================================
 * HIDE EMPTY STATE
 * ==========================================================
 */

function hideChartEmptyState(
    canvas
) {

    if (
        !canvas
    ) {

        return;

    }


    canvas.style.visibility =
        "visible";


    const wrapper =
        canvas.parentElement;


    if (
        !wrapper
    ) {

        return;

    }


    const empty =
        wrapper.querySelector(
            ".dashboard-chart-empty"
        );


    if (
        empty
    ) {

        empty.remove();

    }

}


/* ==========================================================
 * DESTROY CANVAS CHART
 * ==========================================================
 */

function destroyCanvasChart(
    canvas
) {

    if (
        !canvas
    ) {

        return;

    }


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
 * DATABASE INFO
 * ==========================================================
 */

function renderDatabaseInfo(
    data
) {

    const database =
        data.database ||
        {};


    setElementValue(
        [
            "dbTotalAnggota",
            "databaseTotalAnggota"
        ],
        formatNumber(
            database.anggota ??
            data.totalAnggota
        )
    );


    setElementValue(
        [
            "dbTotalGroup",
            "databaseTotalGroup"
        ],
        formatNumber(
            database.group ??
            data.totalGroup
        )
    );


    setElementValue(
        [
            "dbTotalKPI",
            "databaseTotalKPI"
        ],
        formatNumber(
            database.masterKPI ??
            data.totalMasterKPI
        )
    );


    setElementValue(
        [
            "dbTotalPenilaian",
            "databaseTotalPenilaian"
        ],
        formatNumber(
            database.penilaian ??
            data.totalPenilaian
        )
    );

}


/* ==========================================================
 * SYSTEM INFO
 * ==========================================================
 */

function renderSystemInfo(
    data
) {

    const system =
        data.system ||
        {};


    setElementValue(
        [
            "systemStatus",
            "dashboardSystemStatus"
        ],
        system.status ||
        "Online"
    );


    setElementValue(
        [
            "systemDatabase",
            "dashboardSystemDatabase"
        ],
        system.database ||
        "Connected"
    );


    setElementValue(
        [
            "systemAPI",
            "dashboardSystemAPI"
        ],
        system.api ||
        "Connected"
    );


    setElementValue(
        [
            "systemVersion",
            "dashboardSystemVersion"
        ],
        system.version ||
        DASHBOARD_VERSION
    );

}


/* ==========================================================
 * LAST REFRESH
 * ==========================================================
 */

function renderLastRefresh(
    data
) {

    const date =
        data.generatedAt ||
        (
            data.system &&
            data.system.generatedAt
        );


    if (
        !date
    ) {

        return;

    }


    const formatted =
        formatDateTime(
            date
        );


    setElementValue(
        [
            "lastRefresh",
            "dashboardLastRefresh",
            "lastUpdated"
        ],
        formatted
    );

}


/* ==========================================================
 * AUTO REFRESH
 * ==========================================================
 */

function startDashboardAutoRefresh() {

    stopDashboardAutoRefresh();


    const minutes =
        DASHBOARD_CONFIG
            .autoRefreshMinutes;


    dashboardAutoRefreshTimer =
        setInterval(
            function () {

                console.log(
                    "Dashboard auto-refresh."
                );


                loadDashboard(
                    false
                );

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

}


/* ==========================================================
 * STOP AUTO REFRESH
 * ==========================================================
 */

function stopDashboardAutoRefresh() {

    if (
        dashboardAutoRefreshTimer
    ) {

        clearInterval(
            dashboardAutoRefreshTimer
        );


        dashboardAutoRefreshTimer =
            null;

    }

}


/* ==========================================================
 * LOADING
 * ==========================================================
 */

function setDashboardLoading(
    loading
) {

    const buttons =
        document.querySelectorAll(
            "#btnRefreshDashboard, " +
            "#refreshDashboard, " +
            "[data-dashboard-refresh]"
        );


    buttons.forEach(
        function (button) {

            if (
                loading
            ) {

                button.dataset
                    .originalText =
                    button.innerHTML;


                button.disabled =
                    true;


                button.innerHTML =
                    `
                    <span
                        class="spinner-border
                               spinner-border-sm
                               me-1">
                    </span>
                    Memuat...
                    `;

            }

            else {

                button.disabled =
                    false;


                if (
                    button.dataset
                        .originalText
                ) {

                    button.innerHTML =
                        button.dataset
                            .originalText;

                }

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
        "Dashboard error:",
        message
    );


    const elements =
        document.querySelectorAll(
            ".dashboard-error-message"
        );


    elements.forEach(
        function (element) {

            element.textContent =
                message;

        }
    );

}


/* ==========================================================
 * CHART WARNING
 * ==========================================================
 */

function showGlobalChartWarning() {

    if (
        document.getElementById(
            "dashboardChartWarning"
        )
    ) {

        return;

    }


    const warning =
        document.createElement(
            "div"
        );


    warning.id =
        "dashboardChartWarning";


    warning.className =
        "alert alert-warning";


    warning.style.margin =
        "10px 0";


    warning.innerHTML =
        `
        Chart.js belum tersedia.
        Pastikan library Chart.js dimuat
        sebelum dashboard.js.
        `;


    const container =
        document.querySelector(
            "main"
        ) ||
        document.body;


    container.prepend(
        warning
    );

}


/* ==========================================================
 * SET ELEMENT VALUE
 * ==========================================================
 */

function setElementValue(
    selectors,
    value
) {

    if (
        !Array.isArray(
            selectors
        )
    ) {

        selectors =
            [
                selectors
            ];

    }


    for (
        let i = 0;
        i < selectors.length;
        i++
    ) {

        const element =
            document.getElementById(
                selectors[i]
            );


        if (
            !element
        ) {

            continue;

        }


        if (
            "value" in element &&
            (
                element.tagName ===
                "INPUT" ||
                element.tagName ===
                "SELECT" ||
                element.tagName ===
                "TEXTAREA"
            )
        ) {

            element.value =
                value;

        }

        else {

            element.textContent =
                value;

        }


        return;

    }

}


/* ==========================================================
 * FORMAT NUMBER
 * ==========================================================
 */

function formatNumber(
    value
) {

    return Number(
        value || 0
    ).toLocaleString(
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

    return Number(
        value || 0
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


/* ==========================================================
 * FORMAT DATE
 * ==========================================================
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
                    "2-digit",

                second:
                    "2-digit"

            }
        );

    }

    catch (e) {

        return String(
            value
        );

    }

}


/* ==========================================================
 * TO NUMBER
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


/* ==========================================================
 * CAPITALIZE
 * ==========================================================
 */

function capitalize(
    text
) {

    text =
        String(
            text || ""
        );


    if (
        !text
    ) {

        return "";

    }


    return (
        text.charAt(0)
            .toUpperCase() +
        text.slice(1)
    );

}


/* ==========================================================
 * DEBUG FUNCTION
 * ==========================================================
 *
 * Jalankan dari Console:
 *
 * dashboardDebug()
 *
 * ==========================================================
 */

function dashboardDebug() {

    console.group(
        "Guardian KPI Dashboard V7"
    );


    console.log(
        "Version:",
        DASHBOARD_VERSION
    );


    console.log(
        "Initialized:",
        dashboardInitialized
    );


    console.log(
        "Loading:",
        dashboardLoading
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
 * FORCE REFRESH
 * ==========================================================
 *
 * Bisa dipanggil dari Console:
 *
 * dashboardRefresh()
 *
 * ==========================================================
 */

function dashboardRefresh() {

    return loadDashboard(
        true
    );

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
