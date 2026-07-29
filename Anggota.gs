/**
 * ======================================================
 * Guardian KPI Web3
 * File : Anggota.gs
 * ======================================================
 * CRUD Data Anggota
 */

function getAnggota() {
  try {
    return DB.getData(CONFIG.SHEET.ANGGOTA);
  } catch (err) {
    throw new Error("Gagal mengambil data anggota : " + err.message);
  }
}

function getAnggotaById(id) {

  const data = DB.find(
    CONFIG.SHEET.ANGGOTA,
    "id",
    id
  );

  return data || {};

}

function saveAnggota(data) {

  try {

    validateAnggota(data);

    data.id = Utils.generateId(
      CONFIG.SHEET.ANGGOTA,
      "S"
    );

    DB.insert(
      CONFIG.SHEET.ANGGOTA,
      data
    );

    return {
      success: true,
      message: "Anggota berhasil ditambahkan."
    };

  } catch (err) {

    return {
      success: false,
      message: err.message
    };

  }

}

function updateAnggota(id, data) {

  try {

    validateAnggota(data);

    DB.update(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id,
      data
    );

    return {
      success: true,
      message: "Data berhasil diperbarui."
    };

  } catch (err) {

    return {
      success: false,
      message: err.message
    };

  }

}

function deleteAnggota(id) {

  try {

    DB.remove(
      CONFIG.SHEET.ANGGOTA,
      "id",
      id
    );

    return {
      success: true,
      message: "Data berhasil dihapus."
    };

  } catch (err) {

    return {
      success: false,
      message: err.message
    };

  }

}

/**
 * ======================================================
 * VALIDASI
 * ======================================================
 */

function validateAnggota(data) {

  if (!data.nama || data.nama.trim() === "") {
    throw new Error("Nama wajib diisi.");
  }

  if (!data.jabatan || data.jabatan.trim() === "") {
    throw new Error("Jabatan wajib diisi.");
  }

  if (!data.group || data.group.trim() === "") {
    throw new Error("Group wajib dipilih.");
  }

  if (!data.status || data.status.trim() === "") {
    throw new Error("Status wajib dipilih.");
  }

}
