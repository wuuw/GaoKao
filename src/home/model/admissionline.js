"use strict";

export default class extends think.model.base {
  //获取省控线
  async getProvinceLine(year, province, category, batch) {
    let sql = {
      'Ayear': year,
      'origin': province,
      'category': category,
      'batch': batch
    };
    let field = "Aminimunline as line";
    let record = await this.where(sql).field(field).select();
    return record;
  }
}
