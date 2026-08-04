/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/group.js
 * ==========================================================
 * Modul Master Group
 * Author : BlesProduction
 * Version : 3.0.0
 * ==========================================================
 */

"use strict";

/* ==========================================================
 * GLOBAL VARIABLE
 * ==========================================================
 */

let groupData = [];

let editGroupId = null;

/* ==========================================================
 * INIT MODULE
 * ==========================================================
 */

async function initGroup() {

    clearGroupForm();

    await loadGroup();

}

/* ==========================================================
 * LOAD DATA GROUP
 * ==========================================================
 */

async function loadGroup() {

    const tbody = document.getElementById("tblGroup");

    if (!tbody) return;

    tbody.innerHTML = `

        <tr>

            <td colspan="4" class="text-center">

                Memuat data...

            </td>

        </tr>

    `;

    try {

        const result = await API.getGroup();

        if (!result.success) {

            throw new Error(result.message);

        }

        groupData = result.data || [];

        renderGroup(groupData);

    }

    catch (err) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4" class="text-center text-danger">

                    ${err.message}

                </td>

            </tr>

        `;

    }

}

/* ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderGroup(data) {

    const tbody = document.getElementById("tblGroup");

    if (!tbody) return;

    if (!data.length) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4" class="text-center">

                    Tidak ada data.

                </td>

            </tr>

        `;

        return;

    }

    let html = "";

    data.forEach(function(item){

        html += `

            <tr>

                <td>${item.id}</td>

                <td>${item.nama}</td>

                <td>${badgeGroupStatus(item.status)}</td>

                <td>

                    <button
                        class="btn btn-warning btn-sm"
                        onclick="editGroup('${item.id}')">

                        <i class="bi bi-pencil"></i>

                    </button>

                    <button
                        class="btn btn-danger btn-sm"
                        onclick="deleteGroup('${item.id}')">

                        <i class="bi bi-trash"></i>

                    </button>

                </td>

            </tr>

        `;

    });
    
    tbody.innerHTML = html;

}

/* ==========================================================
 * BADGE STATUS
 * ==========================================================
 */

function badgeGroupStatus(status){

    status = String(status).trim().toLowerCase();

    if(status === "aktif"){

        return `

            <span class="badge bg-success">

                Aktif

            </span>

        `;

    }

    return `

        <span class="badge bg-danger">

            Nonaktif

        </span>

    `;

}
/* ==========================================================
 * VALIDASI FORM
 * ========================================================== */

function validateGroupForm() {

    const nama = document
        .getElementById("namaGroup")
        ?.value
        .trim();

    const status = document
        .getElementById("statusGroup")
        ?.value
        .trim();

    if (!nama) {

        alert("Nama Group wajib diisi.");

        document
            .getElementById("namaGroup")
            ?.focus();

        return false;

    }

    if (!status) {

        alert("Status wajib dipilih.");

        document
            .getElementById("statusGroup")
            ?.focus();

        return false;

    }

    return true;

}

/* ==========================================================
 * CEK DUPLIKAT NAMA GROUP
 * ========================================================== */

function isDuplicateGroupName(nama) {

    nama = String(nama)
        .trim()
        .toLowerCase();

    return groupData.some(function(item){

        if (
            editGroupId &&
            String(item.id) === String(editGroupId)
        ) {

            return false;

        }

        return (
            String(item.nama)
                .trim()
                .toLowerCase() === nama
        );

    });

}

/* ==========================================================
 * SIMPAN / UPDATE GROUP
 * ========================================================== */

async function saveGroup() {
    
    if (!validateGroupForm()) {

        return;

    }

    const btn = document.getElementById("btnSaveGroup");
    const originalHTML = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `
        <span class="spinner-border spinner-border-sm me-2"></span>
        Menyimpan...
    `;

    const data = {

        nama: document
            .getElementById("namaGroup")
            .value
            .trim(),

        status: document
            .getElementById("statusGroup")
            .value

    };

    if (isDuplicateGroupName(data.nama)) {

        alert("Nama Group sudah digunakan.");

        return;

    }

    try {

        let result;

        if (editGroupId) {

            result = await API.updateGroup(
                editGroupId,
                data
            );

        } else {

            result = await API.saveGroup(
                data
            );

        }

        if (!result.success) {

            alert(
                result.message ||
                "Gagal menyimpan data."
            );

            return;

        }

        alert(result.message);

        closeGroupModal();

        clearGroupForm();

        await loadGroup();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

    finally{

        btn.disabled = false;

        btn.innerHTML = originalHTML;

    }

}

/* ==========================================================
 * RESET FORM
 * ========================================================== */

function clearGroupForm() {

    editGroupId = null;

    const nama = document.getElementById("namaGroup");
    const status = document.getElementById("statusGroup");

    if (nama) {

        nama.value = "";

    }

    if (status) {

        status.value = "Aktif";

    }

}

/* ==========================================================
 * BUKA MODAL
 * ========================================================== */

function openGroupModal() {
    document.querySelector(
        "#groupModal .modal-title"
    ).textContent = "Tambah Group";

    clearGroupForm();

    const modal = new bootstrap.Modal(
        document.getElementById("groupModal")
    );

    modal.show();
    setTimeout(() => {

        document.getElementById("namaGroup").focus();

    }, 200);

}

/* ==========================================================
 * TUTUP MODAL
 * ========================================================== */

function closeGroupModal() {

    const element = document.getElementById("groupModal");

    if (!element) return;

    const modal = bootstrap.Modal.getInstance(element);

    if (modal) {

        modal.hide();

    }

}

/* ==========================================================
 * EDIT GROUP
 * ========================================================== */

function editGroup(id) {

    const item = groupData.find(function(row){

        return String(row.id) === String(id);

    });

    if (!item) {

        alert("Data Group tidak ditemukan.");

        return;

    }

    document.querySelector(
        "#groupModal .modal-title"
    ).textContent = "Edit Group";

    editGroupId = item.id;

    document.getElementById("namaGroup").value =
        item.nama;

    document.getElementById("statusGroup").value =
        item.status;

    const modal = new bootstrap.Modal(
        document.getElementById("groupModal")
    );

    modal.show();

}

/* ==========================================================
 * HAPUS GROUP
 * ========================================================== */

async function deleteGroup(id) {

    if (!confirm("Yakin ingin menghapus Group ini?")) {

        return;

    }

    try {

        const result = await API.deleteGroup(id);

        if (!result.success) {

            alert(
                result.message ||
                "Gagal menghapus data."
            );

            return;

        }

        alert(result.message);

        await loadGroup();

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

/* ==========================================================
 * FILTER GROUP
 * ========================================================== */

function filterGroup() {

    const keyword = (
        document.getElementById("searchGroup")?.value || ""
    )
    .trim()
    .toLowerCase();

    const status = (
        document.getElementById("filterStatusGroup")?.value || ""
    )
    .trim()
    .toUpperCase();

    const hasil = groupData.filter(function(item){

        const cocokNama =
            String(item.nama)
                .toLowerCase()
                .includes(keyword);

        const cocokStatus =
            status === "" ||
            String(item.status).toUpperCase() === status;

        return cocokNama && cocokStatus;

    });

    renderGroup(hasil);

}

/* ==========================================================
 * RESET FILTER
 * ========================================================== */

function resetFilterGroup() {

    const search =
        document.getElementById("searchGroup");

    const status =
        document.getElementById("filterStatusGroup");

    if (search) {

        search.value = "";

    }

    if (status) {

        status.value = "";

    }

    renderGroup(groupData);

}

/* ==========================================================
 * REFRESH GROUP
 * ========================================================== */

async function refreshGroup() {

    clearGroupForm();

    resetFilterGroup();

    await loadGroup();

}

/* ==========================================================
 * RELOAD GROUP
 * ========================================================== */

async function reloadGroup() {

    await refreshGroup();

}

/* ==========================================================
 * EXPORT GLOBAL
 * ========================================================== */

window.initGroup = initGroup;
window.loadGroup = loadGroup;
window.saveGroup = saveGroup;
window.editGroup = editGroup;
window.deleteGroup = deleteGroup;
window.filterGroup = filterGroup;
window.resetFilterGroup = resetFilterGroup;
window.refreshGroup = refreshGroup;
window.reloadGroup = reloadGroup;
window.openGroupModal = openGroupModal;
window.closeGroupModal = closeGroupModal;
