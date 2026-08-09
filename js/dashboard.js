"use strict";

/* ==========================================================
   GUARDIAN KPI - DASHBOARD FINAL ENTERPRISE
   API       : window.API.getDashboard()
   CHART     : Chart.js
   VERSION   : 8.1.0 Enterprise FINAL
   Perubahan : chart tetap, data tetap, 3 section bawah disembunyikan
   ========================================================== */

(function () {
    const VERSION = "8.1.0 Enterprise FINAL";
    const REFRESH_MINUTES = 5;
    const API_TIMEOUT = 15000;
    const charts = {};
    let data = null;
    let loading = false;
    let initialized = false;
    let refreshTimer = null;

    const COLORS = {
        cyan: "#00d9ff",
        blue: "#1677ff",
        green: "#00c878",
        red: "#ff334d",
        yellow: "#ffc400",
        purple: "#9b59ff",
        orange: "#ff8a00",
        pink: "#ff4da6",
        teal: "#00c7a7"
    };

    function num(v) {
        if (v === null || v === undefined || v === "") return 0;

        if (typeof v === "number") {
            return isFinite(v) ? v : 0;
        }

        let s = String(v).trim().replace("%", "");

        if (s.includes(",") && !s.includes(".")) {
            s = s.replace(",", ".");
        }

        const n = Number(s);

        return isFinite(n) ? n : 0;
    }

    function fmt(v) {
        return num(v).toLocaleString("id-ID");
    }

    function fmt2(v) {
        return num(v).toLocaleString("id-ID", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function setValue(ids, value) {

        if (!Array.isArray(ids)) {
            ids = [ids];
        }

        for (const id of ids) {

            const el =
                document.getElementById(id);

            if (!el) continue;

            if (
                ["INPUT", "SELECT", "TEXTAREA"]
                    .includes(el.tagName)
            ) {
                el.value = value;
            } else {
                el.textContent = value;
            }

            return;
        }
    }

    /* ======================================================
       NORMALIZE DISTRIBUSI ANGGOTA
       ====================================================== */

    function normalizeDistribution(a) {

        if (!Array.isArray(a)) {
            return [];
        }

        return a
            .map(x => ({
                label: String(
                    x.label ||
                    x.nama ||
                    x.status ||
                    ""
                ).trim(),

                value: num(
                    x.value ??
                    x.jumlah ??
                    x.count
                ),

                color: x.color || null
            }))
            .filter(x => x.label);
    }

    /* ======================================================
       NORMALIZE KATEGORI MASTER KPI
       ====================================================== */

    function normalizeCategory(a) {

        if (!Array.isArray(a)) {
            return [];
        }

        return a
            .map(x => ({
                label: String(
                    x.label ||
                    x.kategori ||
                    x.category ||
                    ""
                ).trim(),

                value: num(
                    x.value ??
                    x.jumlah ??
                    x.count
                )
            }))
            .filter(x => x.label);
    }

    /* ======================================================
       NORMALIZE INDIKATOR MASTER KPI
       ====================================================== */

    function normalizeIndicators(a) {

        if (!Array.isArray(a)) {
            return [];
        }

        return a
            .map(x => ({
                id: String(x.id || ""),

                label: String(
                    x.label ||
                    x.indicator ||
                    x.indikator ||
                    x.nama ||
                    x.id ||
                    ""
                ).trim(),

                bobot: num(x.bobot),

                target: num(x.target),

                kategori: String(
                    x.kategori ||
                    x.category ||
                    ""
                ).trim(),

                status: String(
                    x.status ||
                    ""
                ).trim()
            }))
            .filter(x => x.label);
    }

    /* ======================================================
       NORMALIZE STATISTIK
       ====================================================== */

    function normalizeStats(a, d) {

        if (
            Array.isArray(a) &&
            a.length
        ) {

            return a
                .map(x => ({
                    label: String(
                        x.label ||
                        x.nama ||
                        ""
                    ),

                    value: num(
                        x.value ??
                        x.jumlah ??
                        x.count
                    )
                }))
                .filter(x => x.label);
        }

        return [
            {
                label: "Anggota",
                value: num(d.totalAnggota)
            },
            {
                label: "Group",
                value: num(d.totalGroup)
            },
            {
                label: "Master KPI",
                value: num(d.totalMasterKPI)
            },
            {
                label: "Penilaian",
                value: num(d.totalPenilaian)
            }
        ];
    }

    /* ======================================================
       NORMALIZE DASHBOARD
       ====================================================== */

    function normalize(raw) {

        const d = raw || {};

        d.totalAnggota =
            num(d.totalAnggota);

        d.totalGroup =
            num(d.totalGroup);

        d.totalMasterKPI =
            num(d.totalMasterKPI);

        d.totalPenilaian =
            num(d.totalPenilaian);

        d.anggotaAktif =
            num(d.anggotaAktif);

        d.anggotaNonAktif =
            num(d.anggotaNonAktif);

        d.masterKPIAktif =
            num(d.masterKPIAktif);

        d.masterKPINonAktif =
            num(d.masterKPINonAktif);

        d.averageKPI =
            num(d.averageKPI);

        d.distribusiAnggota =
            normalizeDistribution(
                d.distribusiAnggota ||
                d.anggotaDistribution ||
                d.anggotaDistribusi
            );

        d.masterKPIKategori =
            normalizeCategory(
                d.masterKPIKategori ||
                d.kategoriMasterKPI
            );

        d.masterKPIIndikator =
            normalizeIndicators(
                d.masterKPIIndikator ||
                d.indikatorMasterKPI
            );

        d.statistikKPI =
            normalizeStats(
                d.statistikKPI,
                d
            );

        return d;
    }

    /* ======================================================
       WAIT API
       ====================================================== */

    function waitAPI(timeout) {

        return new Promise(
            (resolve, reject) => {

                const start =
                    Date.now();

                function check() {

                    if (
                        window.API &&
                        typeof window.API.getDashboard ===
                        "function"
                    ) {

                        resolve(window.API);

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

    /* ======================================================
       CHART.JS CHECK
       ====================================================== */

    function ensureChartJS() {

        if (
            typeof window.Chart !==
            "undefined"
        ) {

            return true;
        }

        console.error(
            "Chart.js tidak tersedia."
        );

        return false;
    }

    /* ======================================================
       CANVAS
       ====================================================== */

    function getCanvas(
        primary,
        alternatives,
        containers
    ) {

        let canvas =
            document.getElementById(
                primary
            );

        if (canvas) {
            return canvas;
        }

        for (
            const id of
            alternatives || []
        ) {

            canvas =
                document.getElementById(
                    id
                );

            if (canvas) {
                return canvas;
            }
        }

        let container = null;

        for (
            const id of
            containers || []
        ) {

            container =
                document.getElementById(
                    id
                );

            if (container) {
                break;
            }
        }

        if (!container) {
            return null;
        }

        const wrapper =
            document.createElement(
                "div"
            );

        wrapper.className =
            "dashboard-chart-wrapper";

        wrapper.style.cssText =
            "position:relative;" +
            "width:100%;" +
            "height:360px;" +
            "min-height:300px;" +
            "padding:8px;";

        canvas =
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

    /* ======================================================
       DESTROY CHART
       ====================================================== */

    function destroy(
        key,
        canvas
    ) {

        if (charts[key]) {

            try {
                charts[key].destroy();
            } catch (_) {}

            delete charts[key];
        }

        if (
            canvas &&
            Chart.getChart
        ) {

            const old =
                Chart.getChart(
                    canvas
                );

            if (old) {
                old.destroy();
            }
        }
    }

    /* ======================================================
       3D-LIKE GRADIENT
       ====================================================== */

    function verticalGradient(
        ctx,
        a,
        b,
        c
    ) {

        const g =
            ctx.createLinearGradient(
                0,
                0,
                0,
                400
            );

        g.addColorStop(
            0,
            a
        );

        g.addColorStop(
            0.55,
            b
        );

        g.addColorStop(
            1,
            c
        );

        return g;
    }

    /* ======================================================
       BAR OPTIONS
       ====================================================== */

    function barOptions() {

        return {

            responsive: true,

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
                    display: false
                },

                tooltip: {

                    backgroundColor:
                        "rgba(8,14,24,.96)",

                    borderColor:
                        COLORS.cyan,

                    borderWidth:
                        1,

                    padding:
                        10
                }
            },

            scales: {

                x: {

                    grid: {
                        color:
                            "rgba(255,255,255,.05)"
                    },

                    ticks: {

                        color:
                            "#8fa1b5",

                        font: {
                            size: 10
                        }
                    }
                },

                y: {

                    beginAtZero:
                        true,

                    grid: {
                        color:
                            "rgba(255,255,255,.06)"
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

    /* ======================================================
       INDICATOR BAR OPTIONS
       ====================================================== */

    function indicatorOptions() {

        const o =
            barOptions();

        o.plugins.tooltip.callbacks = {

            label:
                ctx =>
                    " Bobot: " +
                    ctx.parsed.y +
                    "%"
        };

        o.scales.x.ticks.maxRotation =
            45;

        o.scales.x.ticks.minRotation =
            0;

        o.scales.y.suggestedMax =
            20;

        o.scales.y.ticks.callback =
            v =>
                v + "%";

        return o;
    }

    /* ======================================================
       PIE OPTIONS
       ====================================================== */

    function pieOptions() {

        return {

            responsive:
                true,

            maintainAspectRatio:
                false,

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

                        padding:
                            14,

                        usePointStyle:
                            true,

                        pointStyle:
                            "circle",

                        font: {
                            size: 10
                        }
                    }
                },

                tooltip: {

                    backgroundColor:
                        "rgba(8,14,24,.96)",

                    borderColor:
                        COLORS.cyan,

                    borderWidth:
                        1,

                    padding:
                        10,

                    callbacks: {

                        label:
                            ctx => {

                                const total =
                                    ctx.dataset.data
                                        .reduce(
                                            (
                                                a,
                                                b
                                            ) =>
                                                a +
                                                num(b),
                                            0
                                        );

                                const p =
                                    total
                                        ? (
                                            num(
                                                ctx.parsed
                                            ) /
                                            total *
                                            100
                                        ).toFixed(
                                            1
                                        )
                                        : "0.0";

                                return (
                                    " " +
                                    ctx.label +
                                    ": " +
                                    ctx.parsed +
                                    " (" +
                                    p +
                                    "%)"
                                );
                            }
                    }
                }
            }
        };
    }

    /* ======================================================
       STATISTIK KPI
       ====================================================== */

    function renderStats(a) {

        const canvas =
            document.getElementById(
                "dashboardChart"
            );

        if (
            !canvas ||
            !ensureChartJS()
        ) {
            return;
        }

        const items =
            Array.isArray(a)
                ? a
                : [];

        destroy(
            "dashboardChart",
            canvas
        );

        const ctx =
            canvas.getContext(
                "2d"
            );

        charts.dashboardChart =
            new Chart(
                ctx,
                {

                    type:
                        "bar",

                    data: {

                        labels:
                            items.map(
                                x =>
                                    x.label
                            ),

                        datasets: [

                            {

                                label:
                                    "Jumlah",

                                data:
                                    items.map(
                                        x =>
                                            num(
                                                x.value
                                            )
                                    ),

                                backgroundColor:
                                    verticalGradient(
                                        ctx,
                                        "#19c6ff",
                                        "#1677ff",
                                        "#173fbd"
                                    ),

                                borderColor:
                                    COLORS.cyan,

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
                        barOptions()
                }
            );
    }

    /* ======================================================
       DISTRIBUSI ANGGOTA
       ====================================================== */

    function renderMembers(a) {

        const canvas =
            document.getElementById(
                "dashboardPieChart"
            );

        if (
            !canvas ||
            !ensureChartJS()
        ) {
            return;
        }

        const items =
            Array.isArray(a)
                ? a
                : [];

        destroy(
            "dashboardPieChart",
            canvas
        );

        charts.dashboardPieChart =
            new Chart(
                canvas.getContext(
                    "2d"
                ),
                {

                    type:
                        "doughnut",

                    data: {

                        labels:
                            items.map(
                                x =>
                                    x.label
                            ),

                        datasets: [

                            {

                                data:
                                    items.map(
                                        x =>
                                            num(
                                                x.value
                                            )
                                    ),

                                backgroundColor: [

                                    COLORS.green,

                                    COLORS.red,

                                    COLORS.yellow,

                                    COLORS.blue
                                ],

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
                        Object.assign(
                            pieOptions(),
                            {
                                cutout:
                                    "62%"
                            }
                        )
                }
            );
    }

    /* ======================================================
       KATEGORI MASTER KPI
       PIE CHART
       ====================================================== */

    function renderCategories(a) {

        let canvas =
            document.getElementById(
                "distributionChart"
            ) ||
            document.getElementById(
                "kategoriMasterKPIChart"
            );

        if (!canvas) {

            canvas =
                getCanvas(
                    "distributionChart",
                    [],
                    [
                        "kategoriMasterKPI",
                        "masterKPIKategori",
                        "kategoriMasterKPIContainer"
                    ]
                );
        }

        if (
            !canvas ||
            !ensureChartJS()
        ) {
            return;
        }

        const items =
            Array.isArray(a)
                ? a
                : [];

        destroy(
            "distributionChart",
            canvas
        );

        destroy(
            "kategoriMasterKPIChart",
            canvas
        );

        if (!items.length) {

            canvas.style.visibility =
                "hidden";

            return;
        }

        canvas.style.visibility =
            "visible";

        charts.distributionChart =
            new Chart(
                canvas.getContext(
                    "2d"
                ),
                {

                    type:
                        "pie",

                    data: {

                        labels:
                            items.map(
                                x =>
                                    x.label
                            ),

                        datasets: [

                            {

                                data:
                                    items.map(
                                        x =>
                                            num(
                                                x.value
                                            )
                                    ),

                                backgroundColor: [

                                    "#00e5a8",

                                    "#1677ff",

                                    "#ffb300",

                                    "#ff4d6d",

                                    "#9b59ff",

                                    "#00c7ff",

                                    "#ff8a00",

                                    "#ff4da6"
                                ],

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
                        pieOptions()
                }
            );
    }

    /* ======================================================
       INDIKATOR MASTER KPI
       ====================================================== */

    function renderIndicators(a) {

        let canvas =
            document.getElementById(
                "kpiChart"
            ) ||
            document.getElementById(
                "indikatorMasterKPIChart"
            );

        if (!canvas) {

            canvas =
                getCanvas(
                    "kpiChart",
                    [],
                    [
                        "indikatorMasterKPI",
                        "masterKPIIndikator",
                        "indikatorMasterKPIContainer"
                    ]
                );
        }

        if (
            !canvas ||
            !ensureChartJS()
        ) {
            return;
        }

        const items =
            Array.isArray(a)
                ? a
                : [];

        destroy(
            "kpiChart",
            canvas
        );

        destroy(
            "indikatorMasterKPIChart",
            canvas
        );

        if (!items.length) {

            canvas.style.visibility =
                "hidden";

            return;
        }

        canvas.style.visibility =
            "visible";

        const ctx =
            canvas.getContext(
                "2d"
            );

        charts.kpiChart =
            new Chart(
                ctx,
                {

                    type:
                        "bar",

                    data: {

                        labels:
                            items.map(
                                x =>
                                    x.id
                                        ? x.id +
                                          " - " +
                                          x.label
                                        : x.label
                            ),

                        datasets: [

                            {

                                label:
                                    "Bobot KPI (%)",

                                data:
                                    items.map(
                                        x =>
                                            num(
                                                x.bobot
                                            )
                                    ),

                                backgroundColor:
                                    verticalGradient(
                                        ctx,
                                        "#00d9ff",
                                        "#1677ff",
                                        "#173fbd"
                                    ),

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
                        indicatorOptions()
                }
            );
    }

    /* ======================================================
       KPI CARDS
       ====================================================== */

    function renderCards(d) {

        setValue(
            [
                "totalAnggota",
                "dashboardTotalAnggota",
                "cardTotalAnggota"
            ],
            fmt(
                d.totalAnggota
            )
        );

        setValue(
            [
                "anggotaAktif",
                "dashboardAnggotaAktif",
                "cardAnggotaAktif"
            ],
            fmt(
                d.anggotaAktif
            )
        );

        setValue(
            [
                "anggotaNonAktif",
                "dashboardAnggotaNonAktif",
                "cardAnggotaNonAktif"
            ],
            fmt(
                d.anggotaNonAktif
            )
        );

        setValue(
            [
                "totalGroup",
                "dashboardTotalGroup",
                "cardTotalGroup"
            ],
            fmt(
                d.totalGroup
            )
        );

        setValue(
            [
                "totalMasterKPI",
                "dashboardTotalMasterKPI",
                "cardTotalMasterKPI"
            ],
            fmt(
                d.totalMasterKPI
            )
        );

        setValue(
            [
                "totalPenilaian",
                "dashboardTotalPenilaian",
                "cardTotalPenilaian"
            ],
            fmt(
                d.totalPenilaian
            )
        );

        setValue(
            [
                "averageKPI",
                "dashboardAverageKPI",
                "cardAverageKPI"
            ],
            fmt2(
                d.averageKPI
            )
        );
    }

    /* ======================================================
       RENDER
       ====================================================== */

    function render() {

        if (!data) {
            return;
        }

        renderCards(
            data
        );

        renderStats(
            data.statistikKPI
        );

        renderMembers(
            data.distribusiAnggota
        );

        renderCategories(
            data.masterKPIKategori
        );

        renderIndicators(
            data.masterKPIIndikator
        );

        hideAuxiliarySections();
    }

    /* ======================================================
       HIDE CONTAINER
       ====================================================== */

    function hideCard(el) {

        if (
            !el ||
            el.dataset.guardianHidden ===
            "1"
        ) {
            return;
        }

        /*
         * Jangan pernah sembunyikan
         * container yang mempunyai chart.
         */

        if (
            el.querySelector &&
            el.querySelector(
                "canvas"
            )
        ) {
            return;
        }

        el.dataset.guardianHidden =
            "1";

        el.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    /* ======================================================
       FIND CONTAINER
       ====================================================== */

    function findContainer(el) {

        if (!el) {
            return null;
        }

        const card =
            el.closest(
                ".card, .dashboard-card, " +
                ".dashboard-chart-card, " +
                ".panel, section, article"
            );

        if (card) {
            return card;
        }

        let p =
            el.parentElement;

        for (
            let i = 0;
            i < 5 &&
            p;
            i++,
            p = p.parentElement
        ) {

            if (
                p.children &&
                p.children.length >= 1
            ) {
                return p;
            }
        }

        return null;
    }

    /* ======================================================
       HIDE BY TEXT
       ====================================================== */

    function hideByText(texts) {

        const wanted =
            texts.map(
                x =>
                    x.toLowerCase()
            );

        document
            .querySelectorAll(
                "h1,h2,h3,h4,h5,h6," +
                ".card-title,.card-header," +
                "button,a,span,strong,p,div"
            )
            .forEach(
                el => {

                    if (
                        el.dataset.guardianHidden ===
                        "1"
                    ) {
                        return;
                    }

                    const text =
                        String(
                            el.textContent ||
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim()
                        .toLowerCase();

                    if (!text) {
                        return;
                    }

                    if (
                        !wanted.some(
                            x =>
                                text === x ||
                                text.includes(x)
                        )
                    ) {
                        return;
                    }

                    hideCard(
                        findContainer(
                            el
                        )
                    );
                }
            );
    }

    /* ======================================================
       HIDE 3 BAGIAN BAWAH
       ====================================================== */

    function hideAuxiliarySections() {

        /*
         * 1. Informasi terakhir /
         *    database summary
         */

        hideByText([
            "dashboard berhasil diperbarui"
        ]);

        hideByText([
            "informasi database"
        ]);

        hideByText([
            "informasi aplikasi"
        ]);

        hideByText([
            "last refresh"
        ]);

        /*
         * 2. Quick Action
         */

        hideByText([
            "quick action",
            "quick actions"
        ]);

        hideByText([
            "penilaian baru"
        ]);

        /*
         * 3. System Status
         */

        hideByText([
            "status sistem",
            "system status"
        ]);

        /*
         * Fallback untuk card
         * yang berisi Online + Checking.
         */

        document
            .querySelectorAll(
                ".card,.dashboard-card," +
                "section,article"
            )
            .forEach(
                card => {

                    if (
                        card.dataset.guardianHidden ===
                        "1"
                    ) {
                        return;
                    }

                    if (
                        card.querySelector(
                            "canvas"
                        )
                    ) {
                        return;
                    }

                    const t =
                        String(
                            card.textContent ||
                            ""
                        )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim()
                        .toLowerCase();

                    if (
                        t.includes(
                            "online"
                        ) &&
                        t.includes(
                            "checking"
                        )
                    ) {

                        hideCard(
                            card
                        );
                    }
                }
            );
    }

    /* ======================================================
       OBSERVER
       ====================================================== */

    function startHideObserver() {

        hideAuxiliarySections();

        if (
            typeof MutationObserver ===
            "undefined"
        ) {
            return;
        }

        let scheduled =
            false;

        const observer =
            new MutationObserver(
                () => {

                    if (scheduled) {
                        return;
                    }

                    scheduled =
                        true;

                    requestAnimationFrame(
                        () => {

                            scheduled =
                                false;

                            hideAuxiliarySections();
                        }
                    );
                }
            );

        observer.observe(
            document.body,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );

        window.guardianKPIHideObserver =
            observer;
    }

    /* ======================================================
       LOAD DASHBOARD
       ====================================================== */

    async function load(
        manual
    ) {

        if (loading) {
            return;
        }

        loading =
            true;

        try {

            const api =
                await waitAPI(
                    API_TIMEOUT
                );

            const response =
                await api.getDashboard();

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

            let raw =
                response.data;

            /*
             * Support response nested.
             */

            if (
                raw &&
                raw.data &&
                typeof raw.data ===
                "object"
            ) {

                raw =
                    raw.data;
            }

            if (
                !raw ||
                typeof raw !==
                "object"
            ) {

                throw new Error(
                    "Data Dashboard tidak valid."
                );
            }

            data =
                normalize(
                    raw
                );

            /*
             * Expose untuk debugging.
             */

            window.dashboardData =
                data;

            window.dashboardCharts =
                charts;

            console.log(
                "Dashboard API Response:",
                response
            );

            console.log(
                "Dashboard Data:",
                data
            );

            console.log(
                "Statistik KPI:",
                data.statistikKPI
            );

            console.log(
                "Distribusi Anggota:",
                data.distribusiAnggota
            );

            console.log(
                "Master KPI kategori:",
                data.masterKPIKategori
            );

            console.log(
                "Master KPI indikator:",
                data.masterKPIIndikator
            );

            render();

            hideAuxiliarySections();

            console.log(
                "Guardian KPI Dashboard render selesai."
            );

        } catch (err) {

            console.error(
                "Dashboard render error:",
                err
            );

        } finally {

            loading =
                false;
        }
    }

    /* ======================================================
       REFRESH
       ====================================================== */

    function refresh() {

        return load(
            true
        );
    }

    /* ======================================================
       INIT
       ====================================================== */

    function init() {

        if (initialized) {
            return;
        }

        initialized =
            true;

        console.log(
            "Guardian KPI Dashboard " +
            VERSION
        );

        load();

        if (refreshTimer) {

            clearInterval(
                refreshTimer
            );
        }

        refreshTimer =
            setInterval(
                () =>
                    load(false),
                REFRESH_MINUTES *
                60000
            );

        startHideObserver();
    }

    /* ======================================================
       GLOBAL API
       ====================================================== */

    window.GuardianDashboard = {

        version:
            VERSION,

        init:
            init,

        load:
            load,

        refresh:
            refresh,

        render:
            render,

        debug:
            () =>
                console.log(
                    {
                        version:
                            VERSION,

                        data:
                            data,

                        charts:
                            charts
                    }
                )
    };

    window.guardianKPIHideSections =
        hideAuxiliarySections;

    /* ======================================================
       START
       ====================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init,
            {
                once:
                    true
            }
        );

    } else {

        init();
    }

})();
