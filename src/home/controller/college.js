'use strict';

import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  async indexAction() {

  }
  //学校-线差查询
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
          category: this.get('subject'), //科类: 理科 || 文科
          batch: this.get('batch'), //批次: one ||two
          scoreType: this.get('scoreType'), //分数类型: min || avg || max
          score: parseInt(this.get('score')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1 //页数: 默认 1
      };
      query.type = 'school';
    }

    let collegeModel = this.model('college'), //文件../model/college.js
        admissionModel = this.model('admissionline'); //文件../model/admissionline.js

    //sql_1语句, 总体SQL语句中的第一部分
      let sql_1 = {
        'Corigin': query.pos, //生源
        'Cyear': query.year, //年份
        'Ccategory': query.category, //文理
        'Cbatch': query.batch, //批次
        'Cstatus': 1 //有效标志位
      };


    /*
    * sql_2语句, 总体SQL语句中的第二部分: Ccutoffline | Caverage
    */

    //查询省控线 line
    let adRecord = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch);
    let line = adRecord[0].line;

    let rangeMin = parseInt(query.score) - parseInt(query.range) - parseInt(line), //最低分
        rangeMax = parseInt(query.score) + parseInt(query.range) - parseInt(line), //最高分
        //从 ../config/config.js 里读取查询的分数类型
        scoreType = this.config('schoolType.' + query.scoreType);

    //筛选分数区间的学校
    let sql_2 = `${scoreType} - ${line} >= ${rangeMin} and ${scoreType} - ${line} <= ${rangeMax}`;

    /** 其他配置项
    * order: 排序的字段
    * sort: DESC 降序， ASC 升序
    * page: 分页查询的页码
    * on: 条件对象
    */
    let order = "Ccutoffline",
        sort = 'DESC',
        page = query.page; //查询页码

    //查询
    let schools = await collegeModel.selectAll(sql_1, sql_2, order, sort, page);

    query.type = 'school';
    let json = {
      query: query, //查询参数
      line: line, //分数线
      count: schools.count, //结果总数
      totalPages: schools.totalPages, //总页数
      page: schools.currentPage, //当前页
      schools: schools.data //学校数组
    };

    this.assign(json);
    return this.display();
  }//diffrenceAction


  //学校-等位分查询
  /**
  * @return {Promise}
  *
  */
  async equipotentialAction() {
    //获取get参数
    let query = null;
    if(this.isGet()){
        query = {
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014
          category: this.get('subject'), //科类: 理科 || 文科
          scoreType: this.get('scoreType'), //分数类型: min || avg || max
          eq: parseInt(this.get('eq')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1 //页数: 默认 1
      };
      query.type = 'school';
    }

    let collegeModel = this.model('college'),
        admissionModel = this.model('admissionline');

    let min = parseInt(query.eq) - parseInt(query.range),  //最低
        max = parseInt(query.eq) + parseInt(query.range),  //最高
        scoreType = this.config('schoolType.' + query.scoreType); //参考分数

    // 获取最高、最低等位分对应的实际分
    min = await collegeModel.eqToScore(query.year, query.pos, query.category, min); //最高分
    max = await collegeModel.eqToScore(query.year, query.pos, query.category, max); //最低分


    let sql_1 = {
      'Cyear': query.year,
      'Corigin': query.pos,
      'Ccategory': query.category,
      'Cstatus': 1
    },
        sql_2 = `${scoreType} >= ${min} and ${scoreType} <= ${max}`;

    let order = 'Cequipotential',
        sort = 'DESC',
        page = query.page;
    let schools = await collegeModel.selectAll(sql_1, sql_2, order, sort, page),
        line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, null);

    let json = {
      query: query, //查询参数
      line: line, //分数线
      count: schools.count, //结果总数
      totalPages: schools.totalPages, //总页数
      page: schools.currentPage, //当前页
      schools: schools.data //学校数组
    };


    this.assign(json);
    return this.display();
  }//equipotentialAction

  //学校-位次分查询
  /**
  * @return {Promise}
  *
  */
  async rankAction() {
    //获取get参数
    let query = null;
    if(this.isGet()){
        query = {
          type: this.get('type'), //查询类型: school || major
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014
          category: this.get('subject'), //科类: 理科 || 文科
          batch: this.get('batch'), //批次: one ||two
          scoreType: this.get('scoreType'), //分数类型: min || avg || max
          score: parseInt(this.get('score')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1 //页数: 默认 1
      };
    }
    return this.fail()
  }


}
