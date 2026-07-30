/**
 * ==========================================================
 * Guardian KPI
 * File : js/anggota.js
 * ==========================================================
 */

let anggotaData = [];
let groupData = [];
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

/**
 * ==========================================================
 * LOAD DATA GROUP
 * ==========================================================
 */

async function loadGroup(){

    const select = document.getElementById("group");

    if(!select) return;

    select.innerHTML = `
        <option value="">Memuat Group...</option>
    `;

    try{

        const res = await API.group();

        if(!res.success){

            select.innerHTML = `
                <option value="">Gagal memuat Group</option>
            `;

            return;

        }

        groupData = res.data || [];
        const groups = groupData;

        let html = `
            <option value="">Pilih Group</option>
        `;

        groups.forEach(item=>{

            html += `
                <option value="${item.id}">
                    ${item.nama}
                </option>
            `;

        });

        select.innerHTML = html;

    }

    catch(err){

        console.error(err);

        select.innerHTML = `
            <option value="">Gagal memuat Group</option>
        `;

    }

}

/**
 * ==========================================================
 * SIMPAN / UPDATE
 * ==========================================================
 */

async function saveAnggota(){

    const data = {

        nama : document.getElementById("nama").value.trim(),

        jabatan : document.getElementById("jabatan").value,

        group : document.getElementById("group").value,

        status : document.getElementById("status").value

    };

    if(
        data.nama==="" ||
        data.jabatan==="" ||
        data.group==="" ||
        data.status===""){
        alert("Semua data wajib diisi.");
        return;
    }

    try{

        let res;

        if(anggotaEditId){

            res = await API.post("updateAnggota",{

                id:anggotaEditId,

                data:data

            });

        }else{

            res = await API.post("saveAnggota",{

                data:data

            });

        }

        if(!res.success){

            alert(res.message);

            return;

        }

        alert(res.message);

        bootstrap.Modal
            .getInstance(
                document.getElementById("anggotaModal")
            )
            .hide();

        resetFormAnggota();

        loadAnggota();

    }

    catch(err){

        console.error(err);

        alert("Gagal menyimpan data.");

    }

}

/**
 * ==========================================================
 * EDIT
 * ==========================================================
 */

function editAnggota(id){

    const item = anggotaData.find(x=>x.id===id);

    if(!item) return;

    anggotaEditId = id;

    document.querySelector(
        "#anggotaModal .modal-title"
    ).innerHTML = "Edit Anggota";

    document.getElementById("nama").value = item.nama;

    document.getElementById("jabatan").value = item.jabatan;

    document.getElementById("group").value = item.group;

    document.getElementById("status").value = item.status;

    new bootstrap.Modal(
        document.getElementById("anggotaModal")
    ).show();

}

/**
 * ==========================================================
 * HAPUS ANGGOTA
 * ==========================================================
 */

async function hapusAnggota(id){

    const item = anggotaData.find(x => x.id === id);

    if(!item) return;

    if(!confirm(`Hapus anggota "${item.nama}" ?`)){
        return;
    }

    try{

        const res = await API.post("deleteAnggota",{
            id:id
        });

        if(!res.success){

            alert(res.message);

            return;

        }

        alert(res.message);

        loadAnggota();

    }catch(err){

        console.error(err);

        alert("Gagal menghapus data.");

    }

}

/**
 * ==========================================================
 * REFRESH
 * ==========================================================
 */

function reloadAnggota(){

    loadAnggota();

}

/**
 * ==========================================================
 * GET NAMA GROUP
 * ==========================================================
 */

function getNamaGroup(id){

    if(typeof groupData==="undefined")
        return id;

    const g = groupData.find(x=>String(x.id)===String(id));

    return g ? g.nama : id;

}

/**
 * ==========================================================
 * FORMAT STATUS
 * ==========================================================
 */

function badgeStatus(status){

    if(String(status).toUpperCase()==="AKTIF"){

        return `
        <span class="badge bg-success">
            AKTIF
        </span>
        `;

    }

    return `
    <span class="badge bg-danger">
        NONAKTIF
    </span>
    `;

}

/**
 * ==========================================================
 * OVERRIDE RENDER TABLE
 * ==========================================================
 */

function renderAnggota(data){

    const tbody = document.getElementById("tblAnggota");

    if(!data || data.length===0){

        tbody.innerHTML=`
        <tr>
            <td colspan="6" class="text-center">
                Belum ada data anggota.
            </td>
        </tr>
        `;

        return;

    }

    let html="";

    data.forEach(item=>{

        html+=`

<tr>

<td>${item.id}</td>

<td>${item.nama}</td>

<td>${item.jabatan}</td>

<td>${getNamaGroup(item.group)}</td>

<td>${badgeStatus(item.status)}</td>

<td>

<button
class="btn btn-sm btn-warning"
onclick="editAnggota('${item.id}')">

<i class="bi bi-pencil"></i>

</button>

<button
class="btn btn-sm btn-danger"
onclick="hapusAnggota('${item.id}')">

<i class="bi bi-trash"></i>

</button>

</td>

</tr>

`;

    });

    tbody.innerHTML=html;

}

/**
 * ==========================================================
 * RESET FORM SAAT MODAL DITUTUP
 * ==========================================================
 */

document
.getElementById("anggotaModal")
.addEventListener("hidden.bs.modal",function(){

    resetFormAnggota();

});
