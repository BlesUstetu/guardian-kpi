/**
 * ==========================================================
 * Guardian KPI
 * File : js/anggota.js
 * ==========================================================
 */

let anggotaData = [];
let anggotaEditId = null;

/**
 * ==========================================================
 * INIT
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    loadGroup();

    loadAnggota();

});

/**
 * ==========================================================
 * LOAD DATA
 * ==========================================================
 */

async function loadAnggota() {

    const tbody = document.getElementById("tblAnggota");

    tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Memuat data...
            </td>
        </tr>
    `;

    try {

        const res = await API.anggota();

        if (!res.success) {

            tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center text-danger">
                    ${res.message}
                </td>
            </tr>
            `;

            return;

        }

        anggotaData = res.data || [];

        renderAnggota(anggotaData);

    }

    catch(err){

        console.error(err);

        tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center text-danger">
                Gagal mengambil data.
            </td>
        </tr>
        `;

    }

}

/**
 * ==========================================================
 * RENDER TABLE
 * ==========================================================
 */

function renderAnggota(data){

    const tbody = document.getElementById("tblAnggota");

    if(data.length===0){

        tbody.innerHTML = `
        <tr>
            <td colspan="6" class="text-center">
                Belum ada data.
            </td>
        </tr>
        `;

        return;

    }

    let html="";

    data.forEach(item=>{

        html += `

<tr>

<td>${item.id}</td>

<td>${item.nama}</td>

<td>${item.jabatan}</td>

<td>${item.group}</td>

<td>

<span class="badge ${item.status==="AKTIF" ? "bg-success":"bg-danger"}">

${item.status}

</span>

</td>

<td>

<button
class="btn btn-warning btn-sm"
onclick="editAnggota('${item.id}')">

<i class="bi bi-pencil"></i>

</button>

<button
class="btn btn-danger btn-sm"
onclick="hapusAnggota('${item.id}')">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

    });

    tbody.innerHTML = html;

}

/**
 * ==========================================================
 * SEARCH + FILTER
 * ==========================================================
 */

function filterAnggota(){

    const keyword = document
        .getElementById("searchAnggota")
        .value
        .toLowerCase();

    const status = document
        .getElementById("filterStatus")
        .value;

    const hasil = anggotaData.filter(item=>{

        const cocokNama =
            item.nama
            .toLowerCase()
            .includes(keyword);

        const cocokStatus =
            status===""
            ||
            item.status===status;

        return cocokNama && cocokStatus;

    });

    renderAnggota(hasil);

}

/**
 * ==========================================================
 * RESET FORM
 * ==========================================================
 */

function resetFormAnggota(){

    anggotaEditId = null;

    document.getElementById("nama").value="";

    document.getElementById("jabatan").value="";

    document.getElementById("group").value="";

    document.getElementById("status").value="AKTIF";

    document.querySelector("#anggotaModal .modal-title").innerHTML =
        "Tambah Anggota";

}

/**
 * ==========================================================
 * REFRESH
 * ==========================================================
 */

function refreshAnggota(){

    resetFormAnggota();

    loadAnggota();

}
