"use strict";

export default class extends think.model.base {
  //获取省控线
  async getProvinceLine(year, province, category, batch) {
    let sql_1 = null, sql_2 = null;
    sql_1 = {
      'Ayear': year,
      'origin': province,
      'category': category
    };

    if (batch) {
      sql_2 = {
        'batch': batch
      }
    };

    let field = "Aminimunline as line";
    let record = await this.where(sql_1).where(sql_2).order('Aminimunline  DESC').field(field).select();
    return record;
  }
}
