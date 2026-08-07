/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/dashboard.js
 * Version : 3.0.0 Production
 * Author : BlesProduction
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL STATE
 * ==========================================================
 */

let dashboardData = {};

let barChart = null;

let pieChart = null;

let dashboardLoading = false;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initDashboard(){

    console.clear();

    console.log(
        "Guardian KPI Dashboard v3"
    );

    await loadDashboard();

}

/* ==========================================================
 * LOAD DASHBOARD
 * ==========================================================
 */

async function loadDashboard(){

    if(dashboardLoading){

        return;

    }

    dashboardLoading = true;

    showLoading(true);

    try{

        const result =
            await API.getDashboard();

        console.log(
            "Dashboard Response",
            result
        );

        if(!result.success){

            throw new Error(

                result.message

            );

        }

        dashboardData =
            result.data || {};

        renderDashboard();

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

    finally{

        dashboardLoading = false;

        showLoading(false);

    }

}

/* ==========================================================
 * LAST REFRESH
 * ==========================================================
 */

function renderLastRefresh(){

    const el = document.getElementById(

        "dashboardLastRefresh"

    );

    if(!el){

        return;

    }

    el.textContent =

        new Date()

        .toLocaleString(

            "id-ID"

        );

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

    tbody.innerHTML =

    `

    <tr>

        <td>${now}</td>

        <td>

            Dashboard berhasil dimuat.

        </td>

        <td>

            <span class="badge bg-success">

                SUCCESS

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

            <span class="badge bg-info">

                INFO

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

            <span class="badge bg-primary">

                DATA

            </span>

        </td>

    </tr>

    `;

}

/* ==========================================================
 * SET TEXT
 * ==========================================================
 */

function setText(id, value){

    const el = document.getElementById(id);

    if(!el){

        return;

    }

    el.textContent = value ?? 0;

}

/* ==========================================================
 * ANIMATE COUNTER
 * ==========================================================
 */

function animateCounter(id, target){

    const el = document.getElementById(id);

    if(!el){

        return;

    }

    target = Number(target || 0);

    let current = 0;

    const duration = 600;

    const steps = 30;

    const increment = target / steps;

    const timer = setInterval(function(){

        current += increment;

        if(current >= target){

            current = target;

            clearInterval(timer);

        }

        el.textContent = Math.round(current);

    }, duration / steps);

}

/* ==========================================================
 * SHOW LOADING
 * ==========================================================
 */

function showLoading(status){

    const btn = document.querySelector(

        'button[onclick="refreshDashboard()"]'

    );

    if(!btn){

        return;

    }

    if(status){

        btn.disabled = true;

        btn.innerHTML = `

            <span class="spinner-border spinner-border-sm me-2"></span>

            Memuat...

        `;

    }

    else{

        btn.disabled = false;

        btn.innerHTML = `

            <i class="bi bi-arrow-clockwise"></i>

            Refresh

        `;

    }

}

/* ==========================================================
 * WINDOW EXPORT
 * ==========================================================
 */

window.initDashboard = initDashboard;

window.loadDashboard = loadDashboard;

window.refreshDashboard = refreshDashboard;

window.startAutoRefresh = startAutoRefresh;

window.stopAutoRefresh = stopAutoRefresh;

/* ==========================================================
 * PAGE SHOW
 * ==========================================================
 */

window.addEventListener(

    "pageshow",

    function(){

        if(

            document.getElementById(

                "dashboardChart"

            )

        ){

            initDashboard();

        }

    }

);

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

            startAutoRefresh(5);

        }

    }

);

/* ==========================================================
 * BEFORE UNLOAD
 * ==========================================================
 */

window.addEventListener(

    "beforeunload",

    function(){

        stopAutoRefresh();

        destroyCharts();

    }

);

/* ==========================================================
 * DEBUG
 * ==========================================================
 */

function debugDashboard(){

    console.group(

        "Guardian KPI Dashboard"

    );

    console.table(

        dashboardData

    );

    console.groupEnd();

}

/* ==========================================================
 * VERSION
 * ==========================================================
 */

console.log(

    "%cGuardian KPI Dashboard v3.0.0",

    "color:#0dcaf0;font-weight:bold;font-size:14px"

);
