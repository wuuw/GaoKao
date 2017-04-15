'use strict';
/**
 * model college, 自动对应数据库表格 ref_college
 */
export default class extends think.model.base {
  //查询所有
  async selectAll(sql_1, sql_2, order, sort, page) {
    let field = "Cyear as year, " + //年份
                "Cname as name, " + //学校名称
                "Caddress as position, " + //地址
                "Ccutoffline as minScore, " + //最低分
                "Caverage as avgScore, " + //平均分
                "Ccategory as category, " + //科目
                "Cbatch as batch, " + //批次
                "Cwebsite as site, " + //招生网
                "Corigin as origin, " + //生源地
                "Cproject as project," + //985 || 211
                "Cequipotential as equipotential"; //等位分
    let record = await this.where(sql_1).where(sql_2).order(order + ' ' + sort).field(field).page(page).countSelect();

    return record;
  }


    //与ref_major表联合查询，结果返回包含专业所在学校地址及所属工程信息
    /*
    *
    */
    async joinMajor(sql_1, sql_2, order, sort, page) {
      ///field
      let field = "Myear as year, " + //年份
                  "m.Cname as school_name, " + //学校名
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
      let on = {
        "Cyear": 'Myear',
        "Ccategory": 'Mcategory',
        "Corigin": 'Morigin',
        "Cbatch": 'Mbatch',
        "Cname": 'm.Cname'
      };

      let sql = await this.model('major').where(sql_1).where(sql_2).buildSql();

      return this.join({
        table: sql,
        join: 'inner',
        on: on,
        as: 'm'
      }).order(order + ' ' + sort).field(field).page(page).countSelect();
    }


    /*
    *  获取等位分对应的实际分数
    */

    async eqToScore(year, pos, category, eq) {
      let sql_1 = {
        'Cyear': year,
        'Corigin': pos,
        'Ccategory': category
      };
      let order = `ABS(Cequipotential - ${eq}) ASC`;

      let record = await this.where(sql_1).order(order).limit(1).select();

      return record[0].Ccutoffline;//返回真实分数
    }
}
