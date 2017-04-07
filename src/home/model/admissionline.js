"use strict";

export default class extends think.model.base {
  //获取省控线
  async getProvinceLine(year, province, category) {
    let sql = {
      'Ayear': year,
      'origin': province,
      'category': category
    };
    let field = "Aminimunline as line";
    let record = await this.where(sql).field(field).order("line DESC").select();
    return record;
  }

  //与ref_college表格联合查询，结果返回包含学校对应的批次及其分数线
  async joinCollege(sql_1, sql_2, order, sort, page) {
    //field，列的选择及别名
    let field = "Cyear as year, " + //年份
                "Aminimunline as line, " + //分数线
                "Cname as name, " + //学校名称
                "Caddress as position, " + //地址
                "Ccutoffline as minScore, " + //最低分
                "Caverage as avgScore, " + //平均分
                "Ccategory as category, " + //科目
                "Cbatch as batch, " + //批次
                "Cwebsite as site, " + //招生网
                "Corigin as origin, " + //生源地
                "Cproject as project"; //985 || 211

    //联合查询table及条件
    let on = {
          "Ayear": 'Cyear',
          "category": 'Ccategory',
          "batch": 'Cbatch',
          "origin": 'Corigin'
        };

    //buildSql，即返回的记过可用作sql语句
    let sql = await this.model('college').where(sql_1).where(sql_2).buildSql();

    return this.join({
      join: 'inner',
      table: sql,
      as: 'c',
      on: on
    }).order(order + ' ' + sort).field(field).page(page).countSelect();
  }

  //与ref_major表联合查询，结果返回包含专业所在学校地址及所属工程信息
  async joinMajor(sql_1, sql_2, order, sort, page) {
    ///field
    let field = "Myear as year, " + //年份
                "Aminimunline as line, " + //省控线
                "a.Cname as school_name, " + //学校名
                "Caddress as school_pos, " + //学校地址
                "Cproject as project, " + //学校地址
                "Mname as name, " + //专业名
                "Mcutoffline as minScore, " + //最低分
                "Maverage as avgScore, " + //平均分
                "Mhighest as maxScore, " + //最高分
                "Mcategory as category, " + //科目
                "Mbatch as batch, " + //批次
                "Morigin as origin"; //生源地

    //联合查询 on 条件
    let lineOnMajor = {
      "Ayear": 'Myear',
      "category": 'Mcategory',
      "batch": 'Mbatch',
      "origin": 'Morigin'
    };
    let majorOnCollege = {
      "Ayear": 'Cyear',
      "category": 'Ccategory',
      "origin": 'Corigin',
      "batch": 'Cbatch',
      "a.Cname": 'Cname'
    };

    let sql = await this.model('major').where(sql_1).where(sql_2).buildSql();

    return this.join({
        table: sql,
        join: 'inner',
        on: lineOnMajor,
        as: 'a'
    }).join({
      table: 'college',
      join: 'inner',
      on: majorOnCollege,
      as: 'b'
    }).order(order + ' ' + sort).field(field).page(page).countSelect();
  }
}
