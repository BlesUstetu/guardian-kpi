/**
 * ==========================================================
 * Guardian KPI Web3
 * File : Group.gs
 * ==========================================================
 * Master Group
 * ==========================================================
 */

function getGroup() {

  try {

    return DB.getData(CONFIG.SHEET.GROUP);

  } catch (err) {

    return [];

  }

}

function getGroupById(id) {

  try {

    return DB.find(
      CONFIG.SHEET.GROUP,
      "id",
      id
    );

  } catch (err) {

    return null;

  }

}

function saveGroup(data) {

  try {

    validateGroup(data);

    if (DB.exists(CONFIG.SHEET.GROUP, "nama", data.nama)) {

      return Utils.error("Nama Group sudah digunakan.");

    }

    data.id = Utils.generateId(
      CONFIG.SHEET.GROUP,
      CONFIG.PREFIX.GROUP
    );

    DB.insert(
      CONFIG.SHEET.GROUP,
      data
    );

    return Utils.success(
      "Group berhasil ditambahkan.",
      data
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

function updateGroup(id, data) {

  try {

    validateGroup(data);

    const result = DB.update(
      CONFIG.SHEET.GROUP,
      "id",
      id,
      data
    );

    if (!result) {

      return Utils.error("Group tidak ditemukan.");

    }

    return Utils.success(
      "Group berhasil diperbarui.",
      data
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

function deleteGroup(id) {

  try {

    const anggota = DB.getData(CONFIG.SHEET.ANGGOTA);

    const digunakan = anggota.some(function(item){

      return item.group === id;

    });

    if (digunakan) {

      return Utils.error(
        "Group masih digunakan oleh anggota."
      );

    }

    const result = DB.remove(
      CONFIG.SHEET.GROUP,
      "id",
      id
    );

    if (!result) {

      return Utils.error("Group tidak ditemukan.");

    }

    return Utils.success(
      "Group berhasil dihapus."
    );

  } catch (err) {

    return Utils.error(err.message);

  }

}

function countGroup() {

  return DB.count(CONFIG.SHEET.GROUP);

}

function getGroupAktif() {

  return getGroup().filter(function(item){

    return item.status === CONFIG.STATUS.AKTIF;

  });

}

function validateGroup(data) {

  if (Utils.isEmpty(data.nama)) {

    throw new Error("Nama Group wajib diisi.");

  }

  if (Utils.isEmpty(data.status)) {

    throw new Error("Status wajib dipilih.");

  }

}
