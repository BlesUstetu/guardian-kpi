/**
 * ==========================================
 * Guardian KPI
 * Group.gs
 * ==========================================
 */

function getGroup() {

  try {

    return DB.getData(CONFIG.SHEET.GROUP);

  } catch(err){

    throw new Error(err.message);

  }

}

function saveGroup(data){

  if(!data.nama){
    throw new Error("Nama Group wajib diisi.");
  }

  data.id=Utils.generateId(
      CONFIG.SHEET.GROUP,
      "G"
  );

  DB.insert(
      CONFIG.SHEET.GROUP,
      data
  );

  return Utils.success("Group berhasil ditambahkan.");

}

function updateGroup(id,data){

  DB.update(
      CONFIG.SHEET.GROUP,
      "id",
      id,
      data
  );

  return Utils.success("Group berhasil diperbarui.");

}

function deleteGroup(id){

  DB.remove(
      CONFIG.SHEET.GROUP,
      "id",
      id
  );

  return Utils.success("Group berhasil dihapus.");

}
