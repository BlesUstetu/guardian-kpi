/**
 * ==========================================
 * Guardian KPI Web3
 * Database.gs
 * Version : 1.0
 * ==========================================
 */

const DB = (() => {

  const ss = SpreadsheetApp.getActiveSpreadsheet();

  function sheet(name) {
    const sh = ss.getSheetByName(name);
    if (!sh) {
      throw new Error(`Sheet "${name}" tidak ditemukan.`);
    }
    return sh;
  }

  function getData(sheetName) {
    const sh = sheet(sheetName);
    const values = sh.getDataRange().getValues();

    if (values.length <= 1) return [];

    const headers = values.shift();

    return values.map(row => {
      let obj = {};
      headers.forEach((header, index) => {
        obj[header] = row[index];
      });
      return obj;
    });
  }

  function insert(sheetName, data) {
    const sh = sheet(sheetName);
    const headers = sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0];

    const row = headers.map(h => data[h] ?? "");

    sh.appendRow(row);

    return true;
  }

  function update(sheetName,idField,id,data){

    const sh = sheet(sheetName);

    const values = sh.getDataRange().getValues();

    const headers = values[0];

    const idIndex=headers.indexOf(idField);

    if(idIndex==-1)
      throw new Error("Field ID tidak ditemukan");

    for(let i=1;i<values.length;i++){

      if(values[i][idIndex]==id){

        headers.forEach((h,index)=>{

          if(data[h]!=undefined){

            sh.getRange(i+1,index+1).setValue(data[h]);

          }

        });

        return true;

      }

    }

    return false;

  }

  function remove(sheetName,idField,id){

    const sh=sheet(sheetName);

    const values=sh.getDataRange().getValues();

    const idIndex=values[0].indexOf(idField);

    for(let i=1;i<values.length;i++){

      if(values[i][idIndex]==id){

        sh.deleteRow(i+1);

        return true;

      }

    }

    return false;

  }

  function find(sheetName,idField,id){

    return getData(sheetName).find(r=>r[idField]==id);

  }

  return{

    getData,

    insert,

    update,

    remove,

    find

  }

})();
