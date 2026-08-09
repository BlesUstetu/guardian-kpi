/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * FILE    : js/anggota.js
 * MODULE  : ANGGOTA
 * VERSION : FINAL 2.0
 * ==========================================================
 */

"use strict";


/* ==========================================================
   STATE
   ========================================================== */

let anggotaData = [];
let anggotaGroupList = [];
let editId = null;


/* ==========================================================
   UTILITY
   ========================================================== */

function anggotaEscape(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function anggotaNormalize(value) {

    return String(
        value === null ||
        value === undefined
            ? ""
            : value
    )
        .trim()
        .toLowerCase();

}


/* ==========================================================
   INIT
   ========================================================== */

async function initAnggota() {

    console.log(
        "Guardian KPI - initAnggota()"
    );


    try {

        /*
         * PENTING:
         *
         * Jangan menggunakan loadGroup().
         *
         * group.js juga memiliki loadGroup().
         *
         * Kita gunakan nama khusus:
         * loadAnggotaGroups()
         */

        await loadAnggotaGroups();

        await loadAnggota();

    }

    catch (err) {

        console.error(
            "Guardian KPI - initAnggota error:",
            err
        );

    }

}


/* ==========================================================
   LOAD ANGGOTA
   ========================================================== */

async function loadAnggota() {

    const tbody =
        document.getElementById(
            "tblAnggota"
        );


    if (!tbody) {

        console.warn(
            "Guardian KPI: tblAnggota tidak ditemukan."
        );

        return;

    }


    tbody.innerHTML = `
        <tr>

            <td
                colspan="6"
                class="anggota-empty text-center">

                <i class="bi bi-hourglass-split"></i>

                Memuat data anggota...

            </td>

        </tr>
    `;


    try {

        if (
            typeof API === "undefined" ||
            typeof API.getAnggota !== "function"
        ) {

            throw new Error(
                "API.getAnggota tidak tersedia."
            );

        }


        const result =
            await API.getAnggota();


        console.log(
            "Guardian KPI - API Anggota:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data anggota."
            );

        }


        anggotaData =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "Guardian KPI - anggotaData:",
            anggotaData
        );


        updateAnggotaCounters(
            anggotaData
        );


        renderAnggota(
            anggotaData
        );

    }

    catch (err) {

        console.error(
            "Guardian KPI - loadAnggota error:",
            err
        );


        anggotaData = [];


        updateAnggotaCounters(
            []
        );


        tbody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="anggota-empty text-center">

                    <i class="bi bi-exclamation-triangle"></i>

                    Gagal memuat data anggota.

                    <br>

                    <small>
                        ${anggotaEscape(
                            err.message
                        )}
                    </small>

                </td>

            </tr>
        `;

    }

}


/* ==========================================================
   LOAD GROUP KHUSUS UNTUK ANGGOTA
   ========================================================== */

async function loadAnggotaGroups() {

    try {

        if (
            typeof API === "undefined" ||
            typeof API.getGroup !== "function"
        ) {

            console.warn(
                "Guardian KPI Anggota: API.getGroup tidak tersedia."
            );

            anggotaGroupList = [];

            return;

        }


        const result =
            await API.getGroup();


        console.log(
            "Guardian KPI - API Group untuk Anggota:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data group."
            );

        }


        anggotaGroupList =
            Array.isArray(result.data)
                ? result.data
                : [];


        console.log(
            "Guardian KPI - anggotaGroupList:",
            anggotaGroupList
        );


        /*
         * Isi dropdown Group.
         */

        populateAnggotaGroupSelect();


    }

    catch (err) {

        console.error(
            "Guardian KPI - loadAnggotaGroups error:",
            err
        );


        anggotaGroupList = [];


        populateAnggotaGroupSelect();

    }

}


/* ==========================================================
   POPULATE DROPDOWN GROUP
   ========================================================== */

function populateAnggotaGroupSelect() {

    const select =
        document.getElementById(
            "group"
        );


    if (!select) {

        return;

    }


    select.innerHTML = `
        <option value="">
            Pilih Group
        </option>
    `;


    anggotaGroupList.forEach(
        function (item) {

            if (!item) {
                return;
            }


            const option =
                document.createElement(
                    "option"
                );


            option.value =
                item.id ?? "";


            option.textContent =
                item.nama ??
                item.name ??
                item.label ??
                "-";


            select.appendChild(
                option
            );

        }
    );

}


/* ==========================================================
   GROUP NAME RESOLVER
   ==========================================================
   
   Mendukung:
   1. item.group = ID
   2. item.group = "G001"
   3. item.group = nama group
   4. item.group = "Group 1"
   5. item.group = "group 1"
   6. object group jika API mengembalikan object
   ========================================================== */

function groupName(
    groupValue
) {

    if (
        groupValue === null ||
        groupValue === undefined ||
        groupValue === ""
    ) {

        return "-";

    }


    /*
     * Jika API anggota mengembalikan object:
     *
     * {
     *   id: "G001",
     *   nama: "Group 1"
     * }
     */

    if (
        typeof groupValue === "object"
    ) {

        const objectName =
            groupValue.nama ??
            groupValue.name ??
            groupValue.label;


        if (objectName) {

            return String(
                objectName
            );

        }


        groupValue =
            groupValue.id ??
            "";

    }


    const target =
        anggotaNormalize(
            groupValue
        );


    if (!target) {

        return "-";

    }


    /*
     * 1. Cari berdasarkan ID.
     */

    let found =
        anggotaGroupList.find(
            function (group) {

                return (
                    anggotaNormalize(
                        group?.id
                    ) === target
                );

            }
        );


    if (found) {

        return (
            found.nama ??
            found.name ??
            found.label ??
            "-"
        );

    }


    /*
     * 2. Cari berdasarkan nama Group.
     */

    found =
        anggotaGroupList.find(
            function (group) {

                const name =
                    group?.nama ??
                    group?.name ??
                    group?.label ??
                    "";


                return (
                    anggotaNormalize(
                        name
                    ) === target
                );

            }
        );


    if (found) {

        return (
            found.nama ??
            found.name ??
            found.label ??
            "-"
        );

    }


    /*
     * 3. Jika API sudah mengirim nama Group
     *    tetapi daftar Group belum cocok,
     *    jangan tampilkan "-".
     *
     *    Tampilkan nilai aslinya.
     */

    return String(
        groupValue
    );

}


/* ==========================================================
   RENDER TABLE
   ========================================================== */

function renderAnggota(
    data
) {

    const tbody =
        document.getElementById(
            "tblAnggota"
        );


    if (!tbody) {

        return;

    }


    const list =
        Array.isArray(data)
            ? data
            : [];


    if (!list.length) {

        tbody.innerHTML = `
            <tr>

                <td
                    colspan="6"
                    class="anggota-empty text-center">

                    <i class="bi bi-people"></i>

                    Tidak ada data anggota.

                </td>

            </tr>
        `;

        return;

    }


    tbody.innerHTML =
        list.map(
            function (item) {

                const id =
                    anggotaEscape(
                        item?.id
                    );


                const nama =
                    anggotaEscape(
                        item?.nama
                    );


                const jabatan =
                    anggotaEscape(
                        item?.jabatan
                    );


                const group =
                    anggotaEscape(
                        groupName(
                            item?.group
                        )
                    );


                const status =
                    badgeStatus(
                        item?.status
                    );


                const rawId =
                    String(
                        item?.id ?? ""
                    )
                        .replace(
                            /\\/g,
                            "\\\\"
                        )
                        .replace(
                            /'/g,
                            "\\'"
                        );


                return `
                    <tr>

                        <td class="anggota-id">
                            ${id || "-"}
                        </td>


                        <td class="anggota-name">
                            ${nama || "-"}
                        </td>


                        <td>
                            ${jabatan || "-"}
                        </td>


                        <td>
                            ${group || "-"}
                        </td>


                        <td>
                            ${status}
                        </td>


                        <td>

                            <div
                                class="anggota-action">

                                <button
                                    type="button"
                                    class="
                                        anggota-action-btn
                                        anggota-edit-btn
                                    "
                                    title="Edit Anggota"
                                    onclick="
                                        editAnggota('${rawId}')
                                    ">

                                    <i
                                        class="bi bi-pencil-fill">
                                    </i>

                                </button>


                                <button
                                    type="button"
                                    class="
                                        anggota-action-btn
                                        anggota-delete-btn
                                    "
                                    title="Hapus Anggota"
                                    onclick="
                                        deleteAnggota('${rawId}')
                                    ">

                                    <i
                                        class="bi bi-trash-fill">
                                    </i>

                                </button>

                            </div>

                        </td>

                    </tr>
                `;

            }
        )
        .join("");

}


/* ==========================================================
   STATUS BADGE
   ========================================================== */

function badgeStatus(
    status
) {

    const normalized =
        anggotaNormalize(
            status
        );


    if (
        normalized === "aktif"
    ) {

        return `
            <span
                class="
                    anggota-status
                    anggota-status-active
                ">

                Aktif

            </span>
        `;

    }


    return `
        <span
            class="
                anggota-status
                anggota-status-inactive
            ">

            Nonaktif

        </span>
    `;

}


/* ==========================================================
   COUNTER
   ========================================================== */

function updateAnggotaCounters(
    data
) {

    const list =
        Array.isArray(data)
            ? data
            : [];


    const total =
        list.length;


    const aktif =
        list.filter(
            function (item) {

                return (
                    anggotaNormalize(
                        item?.status
                    ) === "aktif"
                );

            }
        ).length;


    const nonaktif =
        total - aktif;


    const totalEl =
        document.getElementById(
            "totalAnggota"
        );


    const aktifEl =
        document.getElementById(
            "totalAnggotaAktif"
        );


    const nonaktifEl =
        document.getElementById(
            "totalAnggotaNonAktif"
        );


    if (totalEl) {

        totalEl.textContent =
            total;

    }


    if (aktifEl) {

        aktifEl.textContent =
            aktif;

    }


    if (nonaktifEl) {

        nonaktifEl.textContent =
            nonaktif;

    }


    console.log(
        "Guardian KPI - Counter Anggota:",
        {
            total,
            aktif,
            nonaktif
        }
    );

}


/* ==========================================================
   OPEN MODAL
   ========================================================== */

function openAnggotaModal() {

    clearForm();


    populateAnggotaGroupSelect();


    const element =
        document.getElementById(
            "anggotaModal"
        );


    if (!element) {

        console.error(
            "Guardian KPI: anggotaModal tidak ditemukan."
        );

        return;

    }


    if (
        typeof bootstrap === "undefined" ||
        !bootstrap.Modal
    ) {

        console.error(
            "Bootstrap Modal tidak tersedia."
        );

        return;

    }


    const modal =
        bootstrap.Modal.getOrCreateInstance(
            element
        );


    modal.show();

}


/* ==========================================================
   CLOSE MODAL
   ========================================================== */

function closeAnggotaModal() {

    const element =
        document.getElementById(
            "anggotaModal"
        );


    if (!element) {
        return;
    }


    if (
        typeof bootstrap === "undefined" ||
        !bootstrap.Modal
    ) {

        return;

    }


    const modal =
        bootstrap.Modal.getInstance(
            element
        );


    if (modal) {

        modal.hide();

    }

}


/* ==========================================================
   CLEAR FORM
   ========================================================== */

function clearForm() {

    editId = null;


    const nama =
        document.getElementById(
            "nama"
        );


    const jabatan =
        document.getElementById(
            "jabatan"
        );


    const group =
        document.getElementById(
            "group"
        );


    const status =
        document.getElementById(
            "status"
        );


    if (nama) {

        nama.value = "";

    }


    if (jabatan) {

        jabatan.value = "";

    }


    if (group) {

        group.value = "";

    }


    if (status) {

        status.value = "Aktif";

    }


    const button =
        document.getElementById(
            "btnSaveAnggota"
        );


    if (button) {

        button.disabled =
            false;

        button.innerHTML = `
            <i
                class="bi bi-check-lg">
            </i>

            Simpan
        `;

    }

}


/* ==========================================================
   VALIDATE
   ========================================================== */

function validateAnggotaForm() {

    const nama =
        document.getElementById(
            "nama"
        );


    const jabatan =
        document.getElementById(
            "jabatan"
        );


    const group =
        document.getElementById(
            "group"
        );


    const status =
        document.getElementById(
            "status"
        );


    if (
        !nama ||
        !nama.value.trim()
    ) {

        alert(
            "Nama anggota wajib diisi."
        );


        nama?.focus();


        return false;

    }


    if (
        !jabatan ||
        !jabatan.value
    ) {

        alert(
            "Jabatan wajib dipilih."
        );


        jabatan?.focus();


        return false;

    }


    if (
        !group ||
        !group.value
    ) {

        alert(
            "Group wajib dipilih."
        );


        group?.focus();


        return false;

    }


    if (
        !status ||
        !status.value
    ) {

        alert(
            "Status wajib dipilih."
        );


        status?.focus();


        return false;

    }


    return true;

}


/* ==========================================================
   SAVE
   ========================================================== */

async function saveAnggota() {

    if (
        !validateAnggotaForm()
    ) {

        return;

    }


    const button =
        document.getElementById(
            "btnSaveAnggota"
        );


    const originalHTML =
        button
            ? button.innerHTML
            : "";


    if (button) {

        button.disabled =
            true;

        button.innerHTML = `
            <i
                class="bi bi-hourglass-split">
            </i>

            Menyimpan...
        `;

    }


    const data = {

        nama:
            document.getElementById(
                "nama"
            )?.value
                ?.trim() || "",

        jabatan:
            document.getElementById(
                "jabatan"
            )?.value || "",

        group:
            document.getElementById(
                "group"
            )?.value || "",

        status:
            document.getElementById(
                "status"
            )?.value || "Aktif"

    };


    try {

        let result;


        if (editId) {

            if (
                typeof API.updateAnggota !==
                "function"
            ) {

                throw new Error(
                    "API.updateAnggota tidak tersedia."
                );

            }


            result =
                await API.updateAnggota(
                    editId,
                    data
                );

        }

        else {

            if (
                typeof API.saveAnggota !==
                "function"
            ) {

                throw new Error(
                    "API.saveAnggota tidak tersedia."
                );

            }


            result =
                await API.saveAnggota(
                    data
                );

        }


        console.log(
            "Guardian KPI - saveAnggota:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menyimpan data anggota."
            );

        }


        closeAnggotaModal();


        clearForm();


        /*
         * Refresh Group juga untuk memastikan
         * mapping terbaru tetap tersedia.
         */

        await loadAnggotaGroups();


        await loadAnggota();


        alert(
            result.message ||
            (
                editId
                    ? "Data anggota berhasil diperbarui."
                    : "Data anggota berhasil ditambahkan."
            )
        );

    }

    catch (err) {

        console.error(
            "Guardian KPI - saveAnggota error:",
            err
        );


        alert(
            err.message ||
            "Terjadi kesalahan saat menyimpan data."
        );

    }

    finally {

        if (button) {

            button.disabled =
                false;

            button.innerHTML =
                originalHTML ||
                `
                    <i
                        class="bi bi-check-lg">
                    </i>

                    Simpan
                `;

        }

    }

}


/* ==========================================================
   EDIT
   ========================================================== */

function editAnggota(
    id
) {

    const item =
        anggotaData.find(
            function (row) {

                return (
                    String(
                        row?.id
                    ) ===
                    String(id)
                );

            }
        );


    if (!item) {

        alert(
            "Data anggota tidak ditemukan."
        );

        return;

    }


    editId =
        item.id;


    const nama =
        document.getElementById(
            "nama"
        );


    const jabatan =
        document.getElementById(
            "jabatan"
        );


    const group =
        document.getElementById(
            "group"
        );


    const status =
        document.getElementById(
            "status"
        );


    if (nama) {

        nama.value =
            item.nama || "";

    }


    if (jabatan) {

        jabatan.value =
            item.jabatan || "";

    }


    if (group) {

        /*
         * Jika item.group adalah ID:
         */

        group.value =
            item.group || "";


        /*
         * Jika item.group adalah nama,
         * cari ID group yang sesuai.
         */

        if (
            group.value !==
            String(item.group || "")
        ) {

            const found =
                anggotaGroupList.find(
                    function (g) {

                        return (
                            anggotaNormalize(
                                g?.nama
                            ) ===
                            anggotaNormalize(
                                item.group
                            )
                        );

                    }
                );


            if (found) {

                group.value =
                    found.id;

            }

        }

    }


    if (status) {

        status.value =
            item.status ||
            "Aktif";

    }


    openAnggotaModal();

}


/* ==========================================================
   DELETE
   ========================================================== */

async function deleteAnggota(
    id
) {

    const item =
        anggotaData.find(
            function (row) {

                return (
                    String(
                        row?.id
                    ) ===
                    String(id)
                );

            }
        );


    const nama =
        item?.nama
            ? ` "${item.nama}"`
            : "";


    if (
        !confirm(
            `Yakin ingin menghapus anggota${nama}?`
        )
    ) {

        return;

    }


    try {

        if (
            typeof API === "undefined" ||
            typeof API.deleteAnggota !==
            "function"
        ) {

            throw new Error(
                "API.deleteAnggota tidak tersedia."
            );

        }


        const result =
            await API.deleteAnggota(
                id
            );


        console.log(
            "Guardian KPI - deleteAnggota:",
            result
        );


        if (
            !result ||
            !result.success
        ) {

            throw new Error(
                result?.message ||
                "Gagal menghapus anggota."
            );

        }


        await loadAnggota();


        alert(
            result.message ||
            "Data anggota berhasil dihapus."
        );

    }

    catch (err) {

        console.error(
            "Guardian KPI - deleteAnggota error:",
            err
        );


        alert(
            err.message ||
            "Terjadi kesalahan saat menghapus data."
        );

    }

}


/* ==========================================================
   SEARCH + FILTER
   ========================================================== */

function filterAnggota() {

    const search =
        anggotaNormalize(
            document.getElementById(
                "searchAnggota"
            )?.value
        );


    const status =
        anggotaNormalize(
            document.getElementById(
                "filterStatus"
            )?.value
        );


    const result =
        anggotaData.filter(
            function (item) {

                const nama =
                    anggotaNormalize(
                        item?.nama
                    );


                const itemStatus =
                    anggotaNormalize(
                        item?.status
                    );


                const cocokNama =
                    !search ||
                    nama.includes(
                        search
                    );


                const cocokStatus =
                    !status ||
                    itemStatus ===
                    status;


                return (
                    cocokNama &&
                    cocokStatus
                );

            }
        );


    renderAnggota(
        result
    );


    /*
     * Counter selalu menunjukkan
     * total database, bukan hasil filter.
     */

    updateAnggotaCounters(
        anggotaData
    );

}


/* ==========================================================
   RESET FILTER
   ========================================================== */

function resetFilterAnggota() {

    const search =
        document.getElementById(
            "searchAnggota"
        );


    const status =
        document.getElementById(
            "filterStatus"
        );


    if (search) {

        search.value = "";

    }


    if (status) {

        status.value = "";

    }


    renderAnggota(
        anggotaData
    );


    updateAnggotaCounters(
        anggotaData
    );

}


/* ==========================================================
   REFRESH
   ========================================================== */

async function refreshAnggota() {

    try {

        await loadAnggotaGroups();

        await loadAnggota();

    }

    catch (err) {

        console.error(
            "Guardian KPI - refreshAnggota error:",
            err
        );

    }

}


/* ==========================================================
   COMPATIBILITY
   ========================================================== */

async function reloadAnggota() {

    await refreshAnggota();

}


/*
 * Jangan menggunakan nama global:
 *
 *     loadGroup()
 *
 * karena nama tersebut dipakai oleh group.js.
 *
 * Kita hanya ekspor fungsi khusus Anggota.
 */


/* ==========================================================
   GLOBAL EXPORT
   ========================================================== */

window.initAnggota =
    initAnggota;


window.loadAnggota =
    loadAnggota;


window.loadAnggotaGroups =
    loadAnggotaGroups;


window.renderAnggota =
    renderAnggota;


window.updateAnggotaCounters =
    updateAnggotaCounters;


window.groupName =
    groupName;


window.saveAnggota =
    saveAnggota;


window.editAnggota =
    editAnggota;


window.deleteAnggota =
    deleteAnggota;


window.filterAnggota =
    filterAnggota;


window.resetFilterAnggota =
    resetFilterAnggota;


window.refreshAnggota =
    refreshAnggota;


window.reloadAnggota =
    reloadAnggota;


window.openAnggotaModal =
    openAnggotaModal;


window.closeAnggotaModal =
    closeAnggotaModal;


/*
 * Compatibility untuk HTML lama.
 */

window.openModal =
    openAnggotaModal;


window.closeModal =
    closeAnggotaModal;


console.log(
    "Guardian KPI - anggota.js FINAL 2.0 loaded."
);
