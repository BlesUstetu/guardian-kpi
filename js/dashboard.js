/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/dashboard.js
 * Version : 2.0.0 Production
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL
 * ==========================================================
 */

let dashboardData = {};

let dashboardBarChart = null;

let dashboardPieChart = null;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initDashboard(){

    await loadDashboard();

}

/* ==========================================================
 * LOAD
 * ==========================================================
 */

async function loadDashboard(){

    try{

        const result = await API.getDashboard();

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        dashboardData = result.data || {};

        renderDashboard();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

}

/* ==========================================================
 * RENDER
 * ==========================================================
 */

function renderDashboard(){

    setValue(

        "totalAnggota",

        dashboardData.totalAnggota

    );

    setValue(

        "anggotaAktif",

        dashboardData.anggotaAktif

    );

    setValue(

        "anggotaNonAktif",

        dashboardData.anggotaNonAktif

    );

    setValue(

        "totalGroup",

        dashboardData.totalGroup

    );

    setValue(

        "totalMasterKPI",

        dashboardData.totalMasterKPI

    );

    setValue(

        "totalPenilaian",

        dashboardData.totalPenilaian

    );

    /* =========================
       SUMMARY
    ========================== */

    setValue(

        "summaryTotalAnggota",

        dashboardData.totalAnggota

    );

    setValue(

        "summaryAktif",

        dashboardData.anggotaAktif

    );

    setValue(

        "summaryNonAktif",

        dashboardData.anggotaNonAktif

    );

    setValue(

        "summaryGroup",

        dashboardData.totalGroup

    );

    setValue(

        "summaryKPI",

        dashboardData.totalMasterKPI

    );

    setValue(

        "summaryPenilaian",

        dashboardData.totalPenilaian

    );

    /* =========================
       DATABASE
    ========================== */

    setValue(

        "dbAnggota",

        dashboardData.totalAnggota

    );

    setValue(

        "dbGroup",

        dashboardData.totalGroup

    );

    setValue(

        "dbKPI",

        dashboardData.totalMasterKPI

    );

    setValue(

        "dbPenilaian",

        dashboardData.totalPenilaian

    );

    /* =========================
       LAST REFRESH
    ========================== */

    const refresh =

        document.getElementById(

            "dashboardLastRefresh"

        );

    if(refresh){

        refresh.textContent =

            new Date()

            .toLocaleString(

                "id-ID"

            );

    }

    renderBarChart();

    renderPieChart();

}

/* ==========================================================
 * HELPER
 * ==========================================================
 */

function setValue(id, value){

    const el = document.getElementById(id);

    if(el){

        el.textContent = value ?? 0;

    }

}

/* ==========================================================
 * BAR CHART
 * ==========================================================
 */

function renderBarChart(){

    const canvas =

        document.getElementById(

            "dashboardChart"

        );

    if(!canvas){

        return;

    }

    if(dashboardBarChart){

        dashboardBarChart.destroy();

    }

    dashboardBarChart = new Chart(

        canvas,

        {

            type:"bar",

            data:{

                labels:[

                    "Anggota",

                    "Group",

                    "Master KPI",

                    "Penilaian"

                ],

                datasets:[

                    {

                        label:"Guardian KPI",

                        data:[

                            Number(

                                dashboardData.totalAnggota || 0

                            ),

                            Number(

                                dashboardData.totalGroup || 0

                            ),

                            Number(

                                dashboardData.totalMasterKPI || 0

                            ),

                            Number(

                                dashboardData.totalPenilaian || 0

                            )

                        ],

                        backgroundColor:[

                            "#0dcaf0",

                            "#ffc107",

                            "#0d6efd",

                            "#20c997"

                        ],

                        borderWidth:1

                    }

                ]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        display:false

                    }

                },

                scales:{

                    y:{

                        beginAtZero:true,

                        ticks:{

                            color:"#ffffff"

                        },

                        grid:{

                            color:"#333"

                        }

                    },

                    x:{

                        ticks:{

                            color:"#ffffff"

                        },

                        grid:{

                            color:"#222"

                        }

                    }

                }

            }

        }

    );

}

/* ==========================================================
 * PIE CHART
 * ==========================================================
 */

function renderPieChart(){

    const canvas =

        document.getElementById(

            "dashboardPieChart"

        );

    if(!canvas){

        return;

    }

    if(dashboardPieChart){

        dashboardPieChart.destroy();

    }

    dashboardPieChart = new Chart(

        canvas,

        {

            type:"doughnut",

            data:{

                labels:[

                    "Aktif",

                    "Non Aktif"

                ],

                datasets:[

                    {

                        data:[

                            Number(

                                dashboardData.anggotaAktif || 0

                            ),

                            Number(

                                dashboardData.anggotaNonAktif || 0

                            )

                        ],

                        backgroundColor:[

                            "#198754",

                            "#dc3545"

                        ]

                    }

                ]

            },

            options:{

                responsive:true,

                maintainAspectRatio:false,

                plugins:{

                    legend:{

                        position:"bottom",

                        labels:{

                            color:"#ffffff"

                        }

                    }

                }

            }

        }

    );

}

/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshDashboard(){

    try{

        setLoading(true);

        await loadDashboard();

    }

    finally{

        setLoading(false);

    }

}

/* ==========================================================
 * ACTIVITY
 * ==========================================================
 */

function renderActivity(){

    const tbody =

        document.getElementById(

            "dashboardActivity"

        );

    if(!tbody){

        return;

    }

    const now =

        new Date()

        .toLocaleString(

            "id-ID"

        );

    tbody.innerHTML = `

        <tr>

            <td>${now}</td>

            <td>

                Dashboard berhasil diperbarui.

            </td>

            <td>

                <span class="badge bg-success">

                    OK

                </span>

            </td>

        </tr>

        <tr>

            <td>${now}</td>

            <td>

                Total Anggota :

                ${dashboardData.totalAnggota}

            </td>

            <td>

                <span class="badge bg-info">

                    INFO

                </span>

            </td>

        </tr>

        <tr>

            <td>${now}</td>

            <td>

                Total Penilaian :

                ${dashboardData.totalPenilaian}

            </td>

            <td>

                <span class="badge bg-primary">

                    KPI

                </span>

            </td>

        </tr>

    `;

}

/* ==========================================================
 * LOADING
 * ==========================================================
 */

function setLoading(status){

    const button =

        document.querySelector(

            'button[onclick="refreshDashboard()"]'

        );

    if(!button){

        return;

    }

    if(status){

        button.disabled = true;

        button.innerHTML =

        `

        <span

            class="spinner-border

                   spinner-border-sm

                   me-2">

        </span>

        Refresh...

        `;

    }

    else{

        button.disabled = false;

        button.innerHTML =

        `

        <i class="bi bi-arrow-clockwise"></i>

        Refresh

        `;

    }

}

/* ==========================================================
 * UPDATE STATUS
 * ==========================================================
 */

function updateSystemStatus(){

    console.log(

        "Dashboard Loaded",

        dashboardData

    );

}

/* ==========================================================
 * AUTO REFRESH (OPTIONAL)
 * ==========================================================
 */

let dashboardTimer = null;

function startDashboardAutoRefresh(minutes = 5){

    stopDashboardAutoRefresh();

    dashboardTimer = setInterval(

        refreshDashboard,

        minutes * 60 * 1000

    );

}

function stopDashboardAutoRefresh(){

    if(dashboardTimer){

        clearInterval(dashboardTimer);

        dashboardTimer = null;

    }

}

/* ==========================================================
 * COUNTER ANIMATION
 * ==========================================================
 */

function animateCounter(id, target){

    const el = document.getElementById(id);

    if(!el){

        return;

    }

    target = Number(target || 0);

    const duration = 600;

    const step = Math.max(1, Math.ceil(target / 30));

    let current = 0;

    const timer = setInterval(function(){

        current += step;

        if(current >= target){

            current = target;

            clearInterval(timer);

        }

        el.textContent = current;

    }, duration / 30);

}

/* ==========================================================
 * UPDATE CARD
 * ==========================================================
 */

function updateDashboardCards(){

    animateCounter(

        "totalAnggota",

        dashboardData.totalAnggota

    );

    animateCounter(

        "anggotaAktif",

        dashboardData.anggotaAktif

    );

    animateCounter(

        "anggotaNonAktif",

        dashboardData.anggotaNonAktif

    );

    animateCounter(

        "totalGroup",

        dashboardData.totalGroup

    );

    animateCounter(

        "totalMasterKPI",

        dashboardData.totalMasterKPI

    );

    animateCounter(

        "totalPenilaian",

        dashboardData.totalPenilaian

    );

}

/* ==========================================================
 * DOM READY
 * ==========================================================
 */

document.addEventListener(

    "DOMContentLoaded",

    function(){

        if(

            document.getElementById(

                "dashboardChart"

            )

        ){

            initDashboard();

            startDashboardAutoRefresh();

        }

    }

);

/* ==========================================================
 * EXPORT
 * ==========================================================
 */

window.initDashboard = initDashboard;

window.loadDashboard = loadDashboard;

window.refreshDashboard = refreshDashboard;

window.renderDashboard = renderDashboard;

window.renderBarChart = renderBarChart;

window.renderPieChart = renderPieChart;

window.renderActivity = renderActivity;

window.startDashboardAutoRefresh =

    startDashboardAutoRefresh;

window.stopDashboardAutoRefresh =

    stopDashboardAutoRefresh;
