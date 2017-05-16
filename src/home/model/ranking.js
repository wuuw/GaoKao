'use strict';
/**
 * model college, 自动对应数据库表格 ref_college
 */
export default class extends think.model.base {
    /*
    *  根据排名获取等位分对应的实际分数
    */
    async rankToScore(year, pos, category, rank) {
      let sql = `Ryear = ${year} and Rorigin = '${pos}' and Rcategory = '${category}'  and Rbegin > ${rank}`;
      let order = `Rbegin - ${rank} ASC`;

      let record = await this.where(sql).order(order).limit(1).select();
      return record[0].Rscore;
    }

    /*
    *  联合查询ranking表
    */
    async joinCollege(sql_1, sql_2, order, sort, page) {
      ///field
      let field = "Cyear as year, " + //年份
                  "Cname as school_name, " + //学校名
                  "CcollegeID as id, " + //代码
                  "Caddress as location, " + //学校地区
                  "Cproject as project, " + //工程
                  "Ccutoffline as minScore, " + //最低分
                  "Caverage as avgScore, " + //平均分
                  "Cbatch as batch, " + //批次
                  "Cwebsite as site, " + //官网
                  "Rover as over, " + //官网
                  "Rbegin as rank"; //位次
      //联合查询 on 条件
      let on = {
        "Ryear": "Cyear",
        "Rscore": "Ccutoffline"
      };
      let sql = await this.model('college').where(sql_1).where(sql_2).buildSql();

      return this.join({
        table: sql,
        join: 'inner',
        on: on,
        as: 'c'
      }).order(order + ' ' + sort).field(field).page(page).countSelect();
    }

    /*
    *
    */

}
