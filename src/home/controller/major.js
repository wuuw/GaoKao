'use strict';

import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  async indexAction() {

  }
  //专业-线差查询
  /**
  * @return {Promise}
  *
  */
  async differenceAction() {
    //获取前端query参数
    let query = null;
    if(this.isGet()){
        query = {
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014
          category: this.get('category'), //科类: 理科 || 文科
          batch: this.get('batch'), //批次: one ||two
          scoreType: this.get('scoreType'), //分数类型: min || avg || max
          major: this.get('major'), //专业编号: 1-10
          score: parseFloat(this.get('score')), //分数: Number
          range: parseFloat(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1, //页数: 默认 1
          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211')
      };
      query.type = 'major_dif';
    }

    //按照专业查找
    let majorModel = this.model('major'),
        admissionModel = this.model('admissionline'),
        collegeModel = this.model('college');
    //获取专业名称
    let major = this.config('majors.' + (query.major - 1));

    //sql_1语句
    let sql_1 = {
      'Morigin': query.pos,
      'Myear': query.year,
      'Mcategory': query.category,
      'Mbatch': query.batch,
      'Mname': ['like', `${major}%`],
      'Mstatus': 1
    };


    //查询省控线 line
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch);

    //sql_2语句
    let rangeMin = (query.score) - (query.range), //最低分
        rangeMax = (query.score) + (query.range), //最高分
        //从../config/config.js 里读取查询的分数类型
        scoreType = this.config('majorType.' + query.scoreType);

    let sql_2 = null;
    if (query.range) {
      sql_2 = `${scoreType} - ${line} >= ${rangeMin} and ${scoreType} - ${line} <= ${rangeMax}`;
    } else {
      sql_2 = `${scoreType} - ${line} <= ${rangeMax}`;
    }

    //其他配置项
    let order = `${scoreType}`,
        sort = 'DESC',
        page = query.page;

    let filter = {
      city: query.city,
      is985: query.is985,
      is211: query.is211
    };

    //查询
    let majors = await collegeModel.joinMajor(sql_1, sql_2, order, sort, page, filter);

    let json = {
      query: query,
      count: majors.count, //结果总数
      totalPages: majors.totalPages, //总页数
      page: majors.currentPage, //当前页
      line: line, //省控线
      majors: majors.data //学校数组
    };

    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }


    return this.display();
  }

  //专业-等位分
  /**
  * @return {Promise}
  *
  */
  // async equipotentialAction() {
  //   //获取前端query参数
  //   let query = null;
  //   if(this.isGet()){
  //       query = {
  //         pos: this.get('pos'), //生源地: 四川省
  //         year: this.get('year'), //年份: 2015 || 2014
  //         category: this.get('category'), //科类: 理科 || 文科
  //         major: this.get('major'), //专业编号: 1-10
  //         eq: parseInt(this.get('eq')), //等位分
  //         // scoreType: this.get('scoreType'), //分数类型: min || avg || max
  //         range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
  //         page: this.get('page') || 1, //页数: 默认 1
  //
  //         city: this.get('city'),
  //         is985: this.get('is985'),
  //         is211: this.get('is211')
  //     };
  //     query.type = 'major';
  //   }
  //
  //   let collegeModel = this.model('college'),
  //       majorModel = this.model('major'),
  //       admissionModel = this.model('admissionline');
  //
  //   let major = this.config('majors.' + (query.major - 1));
  //
  //   let min = query.eq - query.range, //最大等位分
  //       max = query.eq + query.range; //最小等位分
  //
  //   //获得等位分对应的实际分数
  //   min = await collegeModel.eqToScore(query.year, query.pos, query.category, min);
  //   max = await collegeModel.eqToScore(query.year, query.pos, query.category, max);
  //
  //   let sql_1 = {
  //     'Morigin': query.pos,
  //     'Myear': query.year,
  //     'Mcategory': query.category,
  //     'Mname': ['like', `${major}%`],
  //     'Mstatus': 1
  //   };
  //
  //   //为Ajax处理筛选请求时添加地址、工程等字段
  //   sql_1 = this.filter(query, sql_1);
  //
  //   let sql_2 = `Maverage <= ${max} and Maverage >= ${min}`;
  //
  //   //其他设置
  //   let order = `Maverage`,
  //       sort = 'DESC',
  //       page = query.page;
  //
  //   //查询
  //   let majors = await collegeModel.joinMajor(sql_1, sql_2, order, sort, page),
  //       line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, null);
  //
  //   let json = {
  //     query: query,
  //     line: line,
  //     count: majors.count, //结果总数
  //     totalPages: majors.totalPages, //总页数
  //     page: majors.currentPage, //当前页
  //     majors: majors.data //学校数组
  //   };
  //
  //   if (this.isAjax('get')) this.success(json);
  //   if (this.isGet()) {
  //     this.assign(json);
  //     this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
  //   }
  //
  //   return this.display();
  //
  // }//equipotentialAction

  //专业-位次
  /**
  * @return {Promise}
  *
  */
  async rankAction() {
    //queryf
    let query = null;
    if (this.isGet()) {
      query = {
        pos: this.get('pos'),
        year: this.get('year'),
        category: this.get('category'),
        rank: parseFloat(this.get('rank')),
        range: parseFloat(this.get('range')) / 100, // 100,
        major: this.get('major'),
        page: this.get('page') || 1,

        city: this.get('city'),
        is985: this.get('is985'),
        is211: this.get('is211')
      };
      query.type = 'major_rank';
    }

    //model
    let admissionModel = this.model('admissionline'),
        collegeModel = this.model('college'),
        majorModel = this.model('major'),
        rankingModel = this.model('ranking');

    let major = this.config('majors.' + (query.major - 1)); //专业名

    //省控线
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, null);

    //获得排名对应的分数
    let rankMin = Math.min(query.rank * (1 - query.range), 280000),
        rankMax = Math.min(query.rank * (1 + query.range), 280000);
    let min = await rankingModel.rankToScore(query.year, query.pos, query.category, rankMax), //最低分
        max = await rankingModel.rankToScore(query.year, query.pos, query.category, rankMin); //最高分

    //通过最低分、最高分查专业，专业分数类型用户传入
    let sql_1 = {
      'Morigin': query.pos,
      'Myear': query.year,
      'Mcategory': query.category,
      'Mname': ['like', `${major}%`],
      'Mstatus': 1
    };

    let filter = {
      city: query.city,
      is985: query.is985,
      is211: query.is211
    };

    let sql_2 = null;
    if (query.range) {
      sql_2 = `Mcutoffline BETWEEN ${min} and ${max}`;
    } else {
      sql_2 = `Mcutoffline < ${min}`;
    }

    let order = "Rscore",
        sort = 'DESC',
        page = query.page;

    let majors = await collegeModel.joinMajorAndRanking(sql_1, sql_2, order, sort, page, filter);
    query.range *= 100;
    let json = {
      query: query,
      line: line,
      count: majors.count, //结果总数
      totalPages: majors.totalPages, //总页数
      page: majors.currentPage, //当前页
      majors: majors.data //学校数组
    };
    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }
    return this.display();
  }
}
