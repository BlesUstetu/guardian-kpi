/**
 * ==========================================================
 * Guardian KPI Web3
 * File : js/group.js
 * ==========================================================
 * Modul Master Group
 * Author : BlesProduction
 * Version : 2.0.0
 * ==========================================================
 */

let groupData = [];
let editGroupId = null;

/**
 * ==========================================================
 * LOAD GROUP
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

/**
 * ==========================================================
 * RENDER TABLE GROUP
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

    tbody.innerHTML = "";

    data.forEach(function(item){

        tbody.innerHTML += `

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

}

/**
 * ==========================================================
 * BADGE STATUS
 * ==========================================================
 */
function badgeGroupStatus(status){

    const value = String(status).toLowerCase();

    if(value === "aktif"){

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

/**
 * ==========================================================
 * SIMPAN / UPDATE GROUP
 * ==========================================================
 */
async function saveGroup() {

    if (!validateGroupForm()) {

        return;

    }

    const data = {

        nama: document.getElementById("namaGroup").value.trim(),

        status: document.getElementById("statusGroup").value

    };
  
    if (isDuplicateGroupName(data.nama)) {

        alert("Nama Group sudah digunakan.");

        return;

    }

    try {

        let result;

        if (editGroupId) {

            result = await API.updateGroup(editGroupId, data);

        } else {

            result = await API.saveGroup(data);

        }

        if (!result.success) {

            alert(result.message);

            return;

        }

        closeGroupModal();

        clearGroupForm();

        loadGroup();

    }

    catch (err) {

        alert(err.message);

    }

}

/**
 * ==========================================================
 * VALIDASI FORM
 * ==========================================================
 */
function validateGroupForm() {

    const nama = document.getElementById("namaGroup").value.trim();

    const status = document.getElementById("statusGroup").value;

    if (nama === "") {

        alert("Nama Group wajib diisi.");

        document.getElementById("namaGroup").focus();

        return false;

    }

    if (status === "") {

        alert("Status wajib dipilih.");

        document.getElementById("statusGroup").focus();

        return false;

    }

    return true;

}

/**
 * ==========================================================
 * RESET FORM
 * ==========================================================
 */
function clearGroupForm() {

    editGroupId = null;

    document.getElementById("namaGroup").value = "";

    document.getElementById("statusGroup").value = "Aktif";

}

/**
 * ==========================================================
 * OPEN MODAL
 * ==========================================================
 */
function openGroupModal() {

    clearGroupForm();

    const modal = new bootstrap.Modal(

        document.getElementById("groupModal")

    );

    modal.show();

}

/**
 * ==========================================================
 * CLOSE MODAL
 * ==========================================================
 */
function closeGroupModal() {

    const element = document.getElementById("groupModal");

    const modal = bootstrap.Modal.getInstance(element);

    if (modal) {

        modal.hide();

    }

}

/**
 * ==========================================================
 * EDIT GROUP
 * ==========================================================
 */
function editGroup(id) {

    const item = groupData.find(function (row) {

        return String(row.id) === String(id);

    });

    if (!item) {

        alert("Data group tidak ditemukan.");

        return;

    }

    editGroupId = id;

    document.getElementById("namaGroup").value = item.nama;
    document.getElementById("statusGroup").value = item.status;

    const modal = new bootstrap.Modal(
        document.getElementById("groupModal")
    );

    modal.show();

}

/**
 * ==========================================================
 * HAPUS GROUP
 * ==========================================================
 */
async function deleteGroup(id) {

    if (!confirm("Yakin ingin menghapus group ini?")) {

        return;

    }

    try {

        const result = await API.deleteGroup(id);

        if (!result.success) {

            alert(result.message);

            return;

        }

        loadGroup();

    }

    catch (err) {

        alert(err.message);

    }

}

/**
 * ==========================================================
 * FILTER GROUP
 * ==========================================================
 */
function filterGroup() {

    const keyword = document
        .getElementById("searchGroup")
        .value
        .toLowerCase()
        .trim();

    const status = document
        .getElementById("filterStatusGroup")
        .value
        .toLowerCase();

    const hasil = groupData.filter(function (item) {

        const cocokNama =
            item.nama.toLowerCase().includes(keyword);

        const cocokStatus =
            status === "" ||
            item.status.toLowerCase() === status;

        return cocokNama && cocokStatus;

    });

    renderGroup(hasil);

}

/**
 * ==========================================================
 * RESET FILTER
 * ==========================================================
 */
function resetFilterGroup() {

    const search = document.getElementById("searchGroup");
    const status = document.getElementById("filterStatusGroup");

    if (search) search.value = "";
    if (status) status.value = "";

    renderGroup(groupData);

}

/**
 * ==========================================================
 * REFRESH GROUP
 * ==========================================================
 */
function refreshGroup() {

    clearGroupForm();

    resetFilterGroup();

    loadGroup();

}

/**
 * ==========================================================
 * VALIDASI DUPLIKAT NAMA GROUP
 * ==========================================================
 */
function isDuplicateGroupName(nama) {

    nama = String(nama).trim().toLowerCase();

    return groupData.some(function(item){

        if(editGroupId && item.id === editGroupId){

            return false;

        }

        return item.nama.trim().toLowerCase() === nama;

    });

}

/**
 * ==========================================================
 * RELOAD GROUP
 * ==========================================================
 */
function reloadGroup() {

    clearGroupForm();

    resetFilterGroup();

    loadGroup();

}

/**
 * ==========================================================
 * INIT GROUP MODULE
 * ==========================================================
 */
function initGroup() {

    loadGroup();

}

/**
 * ==========================================================
 * EXPORT GLOBAL FUNCTION
 * ==========================================================
 */

window.loadGroup = loadGroup;
window.saveGroup = saveGroup;
window.editGroup = editGroup;
window.deleteGroup = deleteGroup;
window.filterGroup = filterGroup;
window.refreshGroup = refreshGroup;
window.resetFilterGroup = resetFilterGroup;
window.openGroupModal = openGroupModal;
window.closeGroupModal = closeGroupModal;
window.initGroup = initGroup;
