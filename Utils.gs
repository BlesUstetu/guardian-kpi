/**
 * ==========================================
 * Guardian KPI Web3
 * Utils.gs
 * ==========================================
 */

const Utils = (() => {

  /**
   * Generate ID
   * contoh :
   * S001
   * G001
   * K001
   * P001
   */
  function generateId(sheetName, prefix, idField = "id") {

    const data = DB.getData(sheetName);

    if (data.length === 0) {
      return prefix + "001";
    }

    let max = 0;

    data.forEach(item => {

      const value = String(item[idField]);

      const number = parseInt(value.replace(prefix, ""), 10);

      if (!isNaN(number) && number > max) {
        max = number;
      }

    });

    return prefix + String(max + 1).padStart(3, "0");

  }

  function today() {

    return Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "yyyy-MM-dd"
    );

  }

  function currentMonth() {

    return Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      "MMMM"
    );

  }

  function currentYear() {

    return Number(
      Utilities.formatDate(
        new Date(),
        Session.getScriptTimeZone(),
        "yyyy"
      )
    );

  }

  function isEmpty(value) {

    return value === null ||
           value === undefined ||
           value === "";

  }

  function success(message, data = null) {

    return {
      success: true,
      message,
      data
    };

  }

  function error(message) {

    return {
      success: false,
      message
    };

  }

  return {

    generateId,

    today,

    currentMonth,

    currentYear,

    isEmpty,

    success,

    error

  };

})();
