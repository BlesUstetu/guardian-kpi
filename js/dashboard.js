/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/dashboard.js
 * Version : 1.0.0
 * ==========================================================
 */

"use strict";

let dashboardData = {};

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initDashboard(){

    await loadDashboard();

}

/* ==========================================================
 * LOAD DASHBOARD
 * ==========================================================
 */

async function loadDashboard(){

    try{

        const result = await API.getDashboard();

        if(!result.success){

            throw new Error(result.message);

        }

        dashboardData = result.data;

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

    setText("totalAnggota", dashboardData.totalAnggota);

    setText("totalGroup", dashboardData.totalGroup);

    setText("totalMasterKPI", dashboardData.totalMasterKPI);

    setText("totalPenilaian", dashboardData.totalPenilaian);

    setText("anggotaAktif", dashboardData.anggotaAktif);

    setText("anggotaNonAktif", dashboardData.anggotaNonAktif);

}

/* ==========================================================
 * HELPER
 * ==========================================================
 */

function setText(id,value){

    const el = document.getElementById(id);

    if(el){

        el.textContent = value ?? 0;

    }

}

/* ==========================================================
 * REFRESH
 * ==========================================================
 */

async function refreshDashboard(){

    await loadDashboard();

}

/* ==========================================================
 * EXPORT
 * ==========================================================
 */

window.initDashboard = initDashboard;

window.refreshDashboard = refreshDashboard;
