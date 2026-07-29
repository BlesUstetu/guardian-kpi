/**
 * ==========================================================
 * Guardian KPI
 * Anggota Module
 * ==========================================================
 */

let anggotaData = [];

/**
 * ==========================================================
 * INIT
 * ==========================================================
 */

document.addEventListener("DOMContentLoaded", () => {

    loadAnggota();

    loadGroup();

});

/**
 * ==========================================================
 * LOAD DATA ANGGOTA
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

        renderTable(anggotaData);

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

function renderTable(data){

    const tbody = document.getElementById("tblAnggota");

    if(data.length===0){

        tbody.innerHTML=`
        <tr>
            <td colspan="6" class="text-center">
                Belum ada data anggota
            </td>
        </tr>
        `;

        return;

    }

    tbody.innerHTML=data.map((item,index)=>`

<tr>

<td>${item.id || index+1}</td>

<td>${item.nama}</td>

<td>${item.jabatan}</td>

<td>${item.group}</td>

<td>

<span class="badge ${
item.status==="Aktif"
?
"bg-success"
:
"bg-danger"
}">

${item.status}

</span>

</td>

<td>

<button
class="btn btn-sm btn-warning"
onclick="editAnggota('${item.id}')">

✏️

</button>

<button
class="btn btn-sm btn-danger"
onclick="deleteAnggota('${item.id}')">

🗑

</button>

</td>

</tr>

`).join("");

}

/**
 * ==========================================================
 * FILTER
 * ==========================================================
 */

function filterAnggota(){

    const keyword=
    document
    .getElementById("searchAnggota")
    .value
    .toLowerCase();

    const status=
    document
    .getElementById("filterStatus")
    .value;

    const result=
    anggotaData.filter(item=>{

        const cocokNama=
        item.nama
        .toLowerCase()
        .includes(keyword);

        const cocokStatus=
        status==""
        ||
        item.status===status;

        return cocokNama && cocokStatus;

    });

    renderTable(result);

}

/**
 * ==========================================================
 * LOAD GROUP
 * ==========================================================
 */

async function loadGroup(){

    try{

        const res=await API.group();

        if(!res.success) return;

        const select=
        document
        .getElementById("group");

        select.innerHTML=
        '<option value="">Pilih Group</option>';

        res.data.forEach(g=>{

            select.innerHTML+=`
            <option value="${g.nama}">
                ${g.nama}
            </option>
            `;

        });

    }

    catch(err){

        console.error(err);

    }

}

/**
 * ==========================================================
 * SAVE
 * ==========================================================
 */

async function saveAnggota(){

    const body={

        nama:
        document.getElementById("nama").value,

        jabatan:
        document.getElementById("jabatan").value,

        group:
        document.getElementById("group").value,

        status:
        document.getElementById("status").value

    };

    try{

        const res=
        await API.post("saveAnggota",body);

        if(!res.success){

            alert(res.message);

            return;

        }

        alert("Data berhasil disimpan");

        bootstrap.Modal
        .getInstance(
        document.getElementById("anggotaModal")
        )
        .hide();

        loadAnggota();

    }

    catch(err){

        console.error(err);

        alert("Gagal menyimpan data");

    }

}

/**
 * ==========================================================
 * EDIT
 * ==========================================================
 */

function editAnggota(id){

    alert("Edit ID : "+id);

}

/**
 * ==========================================================
 * DELETE
 * ==========================================================
 */

function deleteAnggota(id){

    if(!confirm("Hapus anggota ini?")) return;

    alert("Delete ID : "+id);

}
