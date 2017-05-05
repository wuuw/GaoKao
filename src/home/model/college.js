'use strict';
/**
 * model college, 自动对应数据库表格 ref_college
 */
export default class extends think.model.base {
  //查询所有
  async selectAll(sql_1, sql_2, order, sort, page) {
    let field = "Cyear as year, " + //年份
                "Cid as id, " + //id
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
    async joinMajor(sql_1, sql_2, order, sort, page, filter) {
      ///field
      let field = "Myear as year, " + //年份
                  "m.Cname as school_name, " + //学校名
                  "Caddress as school_pos, " + //学校地址
                  "Cproject as project, " + //学校地址
                  "Cwebsite as site, " + //学校地址
                  "Cid as id, " + //代码
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

      let filterCond = {
      };
      //城市
      if (!(filter.city === '' || filter.city === '所有地区')) {
        filterCond['Caddress'] = filter.city;
      }
      //工程
      if(filter.is985 || filter.is211) {
        if (filter.is985 === 'true')
          filterCond['Cproject'] = '985、211';
        else if (filter.is211 === 'true')
          filterCond['Cproject'] = '211'
      }


      let sql = await this.model('major').where(sql_1).where(sql_2).buildSql();

      return this.join({
        table: sql,
        join: 'inner',
        on: on,
        as: 'm'
      }).where(filterCond).order(order + ' ' + sort).field(field).page(page).countSelect();
    }

    //与ref_major/ref_ranking表联合查询，结果返回包含专业所在学校地址及所属工程信息
    //以及相应分数对应的一分一段排名
    /*
    *
    */
    async joinMajorAndRanking(sql_1, sql_2, order, sort, page, filter) {
      ///field
      let field = "Myear as year, " + //年份
                  "m.Cname as school_name, " + //学校名
                  "Caddress as school_pos, " + //学校地址
                  "Cproject as project, " + //学校地址
                  "Cid as id, " + //代码
                  "Mname as name, " + //专业名
                  "Mcutoffline as minScore, " + //分数
                  "Maverage as avgScore, " + //分数
                  "Mhighest as maxScore, " + //分数
                  "Mcategory as category, " + //科目
                  "Mbatch as batch, " + //批次
                  "Morigin as origin, " + //生源地
                  "Rbegin as rank, " + //初位排名
                  "Cwebsite as site" //末尾排名
      //联合查询 on 条件
      let onMajor = {
        "Cyear": 'Myear',
        "Ccategory": 'Mcategory',
        "Corigin": 'Morigin',
        "Cbatch": 'Mbatch',
        "Cname": 'm.Cname'
      };

      // 处理筛选条件
      let filterCond = {
      };
      //城市
      if (!(filter.city === '' || filter.city === '所有地区')) {
        filterCond['Caddress'] = filter.city;
      }
      //工程
      if(filter.is985 || filter.is211) {
        if (filter.is985 === 'true')
          filterCond['Cproject'] = '985、211';
        else if (filter.is211 === 'true')
          filterCond['Cproject'] = '211'
      }

      // console.log("*****************" + this.controller);
      let sql = await this.model('major').where(sql_1).where(sql_2).buildSql();

      return this.alias('c').join({
        table: sql,
        join: 'inner',
        on: onMajor,
        as: 'm'
      }).join(`INNER JOIN ref_ranking ON Myear = Ryear AND Mcategory = Rcategory AND Morigin = Rorigin and Mcutoffline = Rscore`).where(filterCond).order(order + ' ' + sort).field(field).page(page).countSelect();
    }




    /*
    *  根据等位分获取等位分对应的实际分数
    */

    async eqToScore(year, pos, category, eq) {
      let sql_1 = {
        'Cyear': year,
        'Corigin': pos,
        'Ccategory': category,
        'Cequipotential': ['BETWEEN', eq - 5, eq + 5]
      };
      let order = `ABS(Cequipotential - ${eq}) ASC`;

      let record = await this.where(sql_1).order(order).limit(1).select();

      return record[0] ? record[0].Ccutoffline : 0;//返回真实分数
    }
}
