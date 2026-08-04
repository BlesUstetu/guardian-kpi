/**
 * ==========================================================
 * Guardian KPI Web3
 * File : penilaian.js
 * Version : 4.0.0
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL VARIABLE
 * ==========================================================
 */

let penilaianList = [];

let penilaianAnggotaList = [];

let penilaianMasterKPIList = [];

let penilaianEditId = null;

/* ==========================================================
 * INIT
 * ==========================================================
 */

async function initPenilaian() {

    clearPenilaianForm();

    await Promise.all([

        loadPenilaianAnggota(),

        loadPenilaianMasterKPI(),

        loadPenilaianData()

    ]);

}

/* ==========================================================
 * LOAD DATA PENILAIAN
 * ==========================================================
 */

async function loadPenilaianData() {

    const tbody = document.getElementById(
        "tblPenilaian"
    );

    if (!tbody) return;

    tbody.innerHTML = `

        <tr>

            <td colspan="8"
                class="text-center">

                Memuat data...

            </td>

        </tr>

    `;

    try {

        const result =
            await API.getPenilaian();

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        penilaianList =
            result.data || [];

        renderPenilaianTable(
            penilaianList
        );

    }

    catch (err) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-danger text-center">

                    ${err.message}

                </td>

            </tr>

        `;

    }

}

/* ==========================================================
 * LOAD ANGGOTA
 * ==========================================================
 */

async function loadPenilaianAnggota() {

    try {

        const result =
            await API.getAnggota();

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        penilaianAnggotaList =
            result.data || [];

        const select =
            document.getElementById(
                "anggotaPenilaian"
            );

        if (!select) return;

        select.innerHTML = `

            <option value="">

                Pilih Anggota

            </option>

        `;

        penilaianAnggotaList.forEach(function (item) {

            select.innerHTML += `

                <option value="${item.id}">

                    ${item.nama}

                </option>

            `;

        });

    }

    catch (err) {

        alert(err.message);

    }

}

/* ==========================================================
 * LOAD MASTER KPI
 * ==========================================================
 */

async function loadPenilaianMasterKPI() {

    try {

        const result =
            await API.getMasterKPI();

        if (!result.success) {

            throw new Error(
                result.message
            );

        }

        penilaianMasterKPIList =
            result.data || [];

    }

    catch (err) {

        alert(err.message);

    }

}

/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderPenilaianTable(data) {

    const tbody =
        document.getElementById(
            "tblPenilaian"
        );

    if (!tbody) return;

    if (!data.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="8"
                    class="text-center">

                    Belum ada data Penilaian.

                </td>

            </tr>

        `;

        return;

    }

    tbody.innerHTML = `

        <tr>

            <td colspan="8"
                class="text-center">

                Render akan dibuat pada tahap berikutnya.

            </td>

        </tr>

    `;

}

/* ==========================================================
 * CLEAR FORM
 * ==========================================================
 */

function clearPenilaianForm() {

    penilaianEditId = null;

}

/* ==========================================================
 * OPEN MODAL
 * ==========================================================
 */

function openPenilaianModal() {

    clearPenilaianForm();

    renderPenilaianIndikator();

    document.querySelector(
        "#penilaianModal .modal-title"
    ).textContent =
        "Penilaian Baru";

    const modal =
        new bootstrap.Modal(

            document.getElementById(
                "penilaianModal"
            )

        );

    modal.show();

}

/* ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */

function closePenilaianModal() {

    const element =
        document.getElementById(
            "penilaianModal"
        );

    const modal =
        bootstrap.Modal.getInstance(
            element
        );

    if (modal) {

        modal.hide();

    }

}

/* ==========================================================
 * RENDER INDIKATOR
 * ==========================================================
 */

function renderPenilaianIndikator() {

    const container =
        document.getElementById(
            "listIndikator"
        );

    if (!container) return;

    if (
        !penilaianMasterKPIList.length
    ) {

        container.innerHTML = `

            <div class="text-center">

                Tidak ada indikator KPI.

            </div>

        `;

        return;

    }

    container.innerHTML = `

        <div class="text-center">

            Tahap berikutnya...

        </div>

    `;

}

/* ==========================================================
 * EXPORT
 * ==========================================================
 */

window.initPenilaian = initPenilaian;

window.loadPenilaianData = loadPenilaianData;

window.loadPenilaianAnggota = loadPenilaianAnggota;

window.loadPenilaianMasterKPI = loadPenilaianMasterKPI;

window.renderPenilaianTable = renderPenilaianTable;

window.renderPenilaianIndikator = renderPenilaianIndikator;

window.openPenilaianModal = openPenilaianModal;

window.closePenilaianModal = closePenilaianModal;

window.clearPenilaianForm = clearPenilaianForm;
