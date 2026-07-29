/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Anggota.gs
 * ==========================================================
 * CRUD Anggota
 * Author : BlesProduction
 * Version : 1.0.0
 * ==========================================================
 */

/**
 * Mengambil seluruh data anggota
 */
function getAnggota() {

  try {

    return DB.getData(CONFIG.SHEET.ANGGOTA);

  } catch (err) {

    throw new Error("Gagal mengambil data anggota : " + err.message);

  }

}

/**
 * Mengambil data anggota berdasarkan ID
 */
function getAnggotaById(id) {

  try {

    const data = DB.find(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id
    );

    return data || {};

  } catch (err) {

    throw new Error(err.message);

  }

}

/**
 * Menyimpan anggota baru
 */
function saveAnggota(data) {

  try {

    validateAnggota(data);

    data.id = Utils.generateId(
      CONFIG.SHEET.ANGGOTA,
      CONFIG.PREFIX.ANGGOTA
    );

    DB.insert(
      CONFIG.SHEET.ANGGOTA,
      data
    );

    return Utils.success(
      "Data anggota berhasil ditambahkan.",
      data
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

/**
 * Update anggota
 */
function updateAnggota(id, data) {

  try {

    validateAnggota(data);

    const result = DB.update(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id,
      data
    );

    if (!result) {

      return Utils.error("Data anggota tidak ditemukan.");

    }

    return Utils.success(
      "Data anggota berhasil diperbarui.",
      data
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

/**
 * Hapus anggota
 */
function deleteAnggota(id) {

  try {

    const result = DB.remove(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id
    );

    if (!result) {

      return Utils.error("Data anggota tidak ditemukan.");

    }

    return Utils.success(
      "Data anggota berhasil dihapus."
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

/**
 * Mengambil jumlah anggota
 */
function countAnggota() {

  return getAnggota().length;

}

/**
 * Data anggota aktif
 */
function getAnggotaAktif() {

  return getAnggota().filter(function(item){

    return item.status === CONFIG.STATUS.AKTIF;

  });

}

/**
 * Data anggota nonaktif
 */
function getAnggotaNonAktif() {

  return getAnggota().filter(function(item){

    return item.status === CONFIG.STATUS.NONAKTIF;

  });

}

/**
 * Anggota berdasarkan Group ID
 */
function getAnggotaByGroup(groupId) {

  return getAnggota().filter(function(item){

    return item.group === groupId;

  });

}

/**
 * Pencarian anggota
 */
function searchAnggota(keyword) {

  keyword = String(keyword).toLowerCase();

  return getAnggota().filter(function(item){

    return (

      item.nama.toLowerCase().includes(keyword)

      ||

      item.jabatan.toLowerCase().includes(keyword)

      ||

      item.id.toLowerCase().includes(keyword)

    );

  });

}

/**
 * Validasi Data
 */
function validateAnggota(data) {

  if (!data.nama || data.nama.trim() === "") {

    throw new Error("Nama anggota wajib diisi.");

  }

  if (!data.jabatan || data.jabatan.trim() === "") {

    throw new Error("Jabatan wajib dipilih.");

  }

  if (!data.group || data.group.trim() === "") {

    throw new Error("Group wajib dipilih.");

  }

  if (!data.status || data.status.trim() === "") {

    throw new Error("Status wajib dipilih.");

  }

}
