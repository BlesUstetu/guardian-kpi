/**
 * ==========================================================
 * Guardian KPI
 * app.js
 * ==========================================================
 */

let dashboardChart = null;

/**
 * ==========================================================
 * INIT
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    startClock();

    init();

});

/**
 * ==========================================================
 * LOAD DASHBOARD
 * ==========================================================
 */

async function init() {

    try {

        document.getElementById("apiStatus").innerHTML =
            "🟡 Menghubungkan API...";

        const res = await API.dashboard();

        if (!res.success) {

            document.getElementById("apiStatus").innerHTML =
                "🔴 API Error";

            return;

        }

        const data = res.data;

        animateValue(
            "totalAnggota",
            data.totalAnggota
        );

        animateValue(
            "totalGroup",
            data.totalGroup
        );

        animateValue(
            "totalKPI",
            data.totalKPI
        );

        animateValue(
            "averageKPI",
            data.averageKPI,
            "%"
        );

        document.getElementById("apiStatus").innerHTML =
            "🟢 API Connected";

        loadChart(data);

    }

    catch (err) {

        console.error(err);

        document.getElementById("apiStatus").innerHTML =
            "🔴 Gagal Terhubung";

    }

}

/**
 * ==========================================================
 * COUNT UP ANIMATION
 * ==========================================================
 */

function animateValue(id, endValue, suffix = "") {

    const element = document.getElementById(id);

    let start = 0;

    const duration = 800;

    const increment = Math.max(1, endValue / 40);

    const timer = setInterval(() => {

        start += increment;

        if (start >= endValue) {

            start = endValue;

            clearInterval(timer);

        }

        element.textContent =
            Math.floor(start) + suffix;

    }, duration / 40);

}

/**
 * ==========================================================
 * CHART
 * ==========================================================
 */

function loadChart(data) {

    const ctx =
        document.getElementById("chartKPI");

    if (dashboardChart) {

        dashboardChart.destroy();

    }

    dashboardChart = new Chart(ctx, {

        type: "bar",

        data: {

            labels: [

                "Anggota",

                "Group",

                "Master KPI"

            ],

            datasets: [

                {

                    label: "Guardian KPI",

                    data: [

                        data.totalAnggota,

                        data.totalGroup,

                        data.totalKPI

                    ],

                    backgroundColor: [

                        "#2563eb",

                        "#06b6d4",

                        "#22c55e"

                    ],

                    borderColor: [

                        "#3b82f6",

                        "#22d3ee",

                        "#4ade80"

                    ],

                    borderWidth: 2,

                    borderRadius: 12

                }

            ]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            plugins: {

                legend: {

                    labels: {

                        color: "#ffffff"

                    }

                }

            },

            scales: {

                x: {

                    ticks: {

                        color: "#ffffff"

                    },

                    grid: {

                        color: "rgba(255,255,255,.05)"

                    }

                },

                y: {

                    beginAtZero: true,

                    ticks: {

                        color: "#ffffff"

                    },

                    grid: {

                        color: "rgba(255,255,255,.05)"

                    }

                }

            }

        }

    });

}

/**
 * ==========================================================
 * CLOCK
 * ==========================================================
 */

function startClock() {

    updateClock();

    setInterval(updateClock, 1000);

}

function updateClock() {

    const el = document.getElementById("clock");

    if (!el) return;

    const now = new Date();

    el.textContent =
        now.toLocaleTimeString("id-ID");

}
