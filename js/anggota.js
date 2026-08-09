/**
 * ==========================================================
 * GUARDIAN KPI WEB3
 * FILE    : js/anggota.js
 * MODULE  : ANGGOTA
 * VERSION : FINAL
 * ==========================================================
 *
 * Fungsi:
 * - Load Anggota
 * - Load Group
 * - Render tabel
 * - Counter Total / Aktif / Nonaktif
 * - Search
 * - Filter Status
 * - Tambah
 * - Edit
 * - Hapus
 * - Refresh
 * - Modal Bootstrap
 *
 * Tidak mengubah API.
 * Tidak mengubah Dashboard.
 * Tidak mengubah Settings.
 * ==========================================================
 */


/* ==========================================================
   STATE
   ========================================================== */

let anggotaData = [];
let groupList = [];
let editId = null;


/* ==========================================================
   UTILITY
   ========================================================== */

function anggotaEscape(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ==========================================================
   LOAD DATA ANGGOTA
   ========================================================== */

async function loadAnggota() {

    const tbody =
        document.getElementById("tblAnggota");

    if (!tbody) {
        console.warn(
            "Guardian KPI Anggota: tblAnggota tidak ditemukan."
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


        if (!result || !result.success) {

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


    } catch (err) {

        console.error(
            "Guardian KPI - loadAnggota error:",
            err
        );


        updateAnggotaCounters([]);


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
        list.filter(function (item) {

            return String(
                item?.status || ""
            )
                .trim()
                .toLowerCase() === "aktif";

        }).length;


    const nonaktif =
        total - aktif;


    /*
     * ID yang digunakan oleh pages/anggota.html
     */

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


    /*
     * Compatibility dengan kemungkinan
     * ID counter versi lama.
     */

    const oldTotal =
        document.getElementById(
            "anggotaTotalCount"
        );


    const oldAktif =
        document.getElementById(
            "anggotaActiveCount"
        );


    const oldNonaktif =
        document.getElementById(
            "anggotaInactiveCount"
        );


    if (oldTotal) {
        oldTotal.textContent =
            total;
    }


    if (oldAktif) {
        oldAktif.textContent =
            aktif;
    }


    if (oldNonaktif) {
        oldNonaktif.textContent =
            nonaktif;
    }


    console.log(
        "Guardian KPI - Counter Anggota:",
        {
            total: total,
            aktif: aktif,
            nonaktif: nonaktif
        }
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
        list.map(function (item) {

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


            const safeId =
                String(
                    item?.id ?? ""
                )
                    .replace(/\\/g, "\\\\")
                    .replace(/'/g, "\\'");


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
                                    editAnggota('${safeId}')
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
                                    deleteAnggota('${safeId}')
                                ">

                                <i
                                    class="bi bi-trash-fill">
                                </i>

                            </button>


                        </div>

                    </td>

                </tr>
            `;

        }).join("");


}


/* ==========================================================
   STATUS BADGE
   ========================================================== */

function badgeStatus(
    status
) {

    const normalized =
        String(
            status || ""
        )
            .trim()
            .toLowerCase();


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
   LOAD GROUP
   ========================================================== */

async function loadGroup() {

    try {

        if (
            typeof API === "undefined" ||
            typeof API.getGroup !== "function"
        ) {

            console.warn(
                "Guardian KPI Anggota: API.getGroup tidak tersedia."
            );

            return;

        }


        const result =
            await API.getGroup();


        console.log(
            "Guardian KPI - API Group:",
            result
        );


        if (!result || !result.success) {

            throw new Error(
                result?.message ||
                "Gagal mengambil data group."
            );

        }


        groupList =
            Array.isArray(result.data)
                ? result.data
                : [];


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


        groupList.forEach(
            function (item) {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    item?.id ?? "";


                option.textContent =
                    item?.nama ?? "-";


                select.appendChild(
                    option
                );

            }
        );


    } catch (err) {

        console.error(
            "Guardian KPI - loadGroup error:",
            err
        );


        const select =
            document.getElementById(
                "group"
            );


        if (select) {

            select.innerHTML = `
                <option value="">
                    Group tidak tersedia
                </option>
            `;

        }

    }

}


/* ==========================================================
   CARI NAMA GROUP
   ========================================================== */

function groupName(
    id
) {

    const item =
        groupList.find(
            function (group) {

                return String(
                    group?.id
                ) === String(
                    id
                );

            }
        );


    return item
        ? item.nama
        : "-";

}


/* ==========================================================
   SIMPAN DATA ANGGOTA
   ========================================================== */

async function saveAnggota() {

    if (
        !validateAnggotaForm()
    ) {

        return;

    }


    const namaEl =
        document.getElementById(
            "nama"
        );


    const jabatanEl =
        document.getElementById(
            "jabatan"
        );


    const groupEl =
        document.getElementById(
            "group"
        );


    const statusEl =
        document.getElementById(
            "status"
        );


    const data = {

        nama:
            namaEl?.value
                ?.trim() || "",

        jabatan:
            jabatanEl?.value || "",

        group:
            groupEl?.value || "",

        status:
            statusEl?.value || ""

    };


    try {

        const button =
            document.getElementById(
                "btnSaveAnggota"
            );


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


        let result;


        /*
         * EDIT
         */

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


        /*
         * TAMBAH
         */

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
            "Guardian KPI - saveAnggota response:",
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


        await loadAnggota();


        alert(
            editId
                ? "Data anggota berhasil diperbarui."
                : "Data anggota berhasil ditambahkan."
        );


    } catch (err) {

        console.error(
            "Guardian KPI - saveAnggota error:",
            err
        );


        alert(
            err.message ||
            "Terjadi kesalahan saat menyimpan data."
        );


    } finally {

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

}


/* ==========================================================
   RESET FORM
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
   OPEN MODAL
   ========================================================== */

function openAnggotaModal() {

    clearForm();


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
   EDIT ANGGOTA
   ========================================================== */

function editAnggota(
    id
) {

    const item =
        anggotaData.find(
            function (row) {

                return String(
                    row?.id
                ) === String(
                    id
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

        group.value =
            item.group || "";

    }


    if (status) {

        status.value =
            item.status || "Aktif";

    }


    const element =
        document.getElementById(
            "anggotaModal"
        );


    if (
        element &&
        typeof bootstrap !== "undefined" &&
        bootstrap.Modal
    ) {

        const modal =
            bootstrap.Modal.getOrCreateInstance(
                element
            );


        modal.show();

    }

}


/* ==========================================================
   HAPUS ANGGOTA
   ========================================================== */

async function deleteAnggota(
    id
) {

    const item =
        anggotaData.find(
            function (row) {

                return String(
                    row?.id
                ) === String(
                    id
                );

            }
        );


    const nama =
        item?.nama
            ? ` "${item.nama}"`
            : "";


    const confirmed =
        confirm(
            `Yakin ingin menghapus anggota${nama}?`
        );


    if (!confirmed) {
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
            "Guardian KPI - deleteAnggota response:",
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
            "Data anggota berhasil dihapus."
        );


    } catch (err) {

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
   FILTER DATA
   ========================================================== */

function filterAnggota() {

    const searchEl =
        document.getElementById(
            "searchAnggota"
        );


    const statusEl =
        document.getElementById(
            "filterStatus"
        );


    const keyword =
        String(
            searchEl?.value || ""
        )
            .toLowerCase()
            .trim();


    const status =
        String(
            statusEl?.value || ""
        )
            .toLowerCase()
            .trim();


    const hasil =
        anggotaData.filter(
            function (item) {

                const nama =
                    String(
                        item?.nama || ""
                    )
                        .toLowerCase();


                const itemStatus =
                    String(
                        item?.status || ""
                    )
                        .toLowerCase();


                const cocokNama =
                    nama.includes(
                        keyword
                    );


                const cocokStatus =
                    status === "" ||
                    itemStatus === status;


                return (
                    cocokNama &&
                    cocokStatus
                );

            }
        );


    /*
     * Counter tetap menggunakan seluruh data,
     * bukan hasil filter.
     */

    updateAnggotaCounters(
        anggotaData
    );


    renderAnggota(
        hasil
    );

}


/* ==========================================================
   REFRESH
   ========================================================== */

async function refreshAnggota() {

    clearForm();


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


    await loadGroup();


    await loadAnggota();

}


/* ==========================================================
   VALIDASI FORM
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
        nama.value.trim() === ""
    ) {

        alert(
            "Nama anggota wajib diisi."
        );


        nama?.focus();


        return false;

    }


    if (
        !jabatan ||
        jabatan.value === ""
    ) {

        alert(
            "Jabatan wajib dipilih."
        );


        jabatan?.focus();


        return false;

    }


    if (
        !group ||
        group.value === ""
    ) {

        alert(
            "Group wajib dipilih."
        );


        group?.focus();


        return false;

    }


    if (
        !status ||
        status.value === ""
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


    updateAnggotaCounters(
        anggotaData
    );


    renderAnggota(
        anggotaData
    );

}


/* ==========================================================
   RELOAD MODULE
   ========================================================== */

async function reloadAnggota() {

    clearForm();


    resetFilterAnggota();


    await loadGroup();


    await loadAnggota();

}


/* ==========================================================
   INITIALIZE PAGE
   ========================================================== */

async function initAnggota() {

    console.log(
        "Guardian KPI - initAnggota()"
    );


    /*
     * Load group terlebih dahulu karena
     * tabel membutuhkan nama group.
     */

    await loadGroup();


    await loadAnggota();


}


/* ==========================================================
   GLOBAL EXPORT
   ==========================================================
   
   Semua fungsi yang dipakai oleh:
   - pages/anggota.html
   - index.html
   - app.js
   
   diekspor secara eksplisit.
   ========================================================== */

window.loadAnggota =
    loadAnggota;


window.renderAnggota =
    renderAnggota;


window.updateAnggotaCounters =
    updateAnggotaCounters;


window.saveAnggota =
    saveAnggota;


window.editAnggota =
    editAnggota;


window.deleteAnggota =
    deleteAnggota;


window.filterAnggota =
    filterAnggota;


window.refreshAnggota =
    refreshAnggota;


window.resetFilterAnggota =
    resetFilterAnggota;


window.reloadAnggota =
    reloadAnggota;


window.openAnggotaModal =
    openAnggotaModal;


window.closeAnggotaModal =
    closeAnggotaModal;


/*
 * Compatibility alias.
 *
 * Jika ada bagian lama yang masih menggunakan:
 * openModal()
 * closeModal()
 *
 * tetap akan bekerja.
 */

window.openModal =
    openAnggotaModal;


window.closeModal =
    closeAnggotaModal;


window.initAnggota =
    initAnggota;


console.log(
    "Guardian KPI - anggota.js FINAL loaded."
);
