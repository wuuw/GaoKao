'use strict';

import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  //学校-线差查询   Action
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
          score: parseInt(this.get('score')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1, //页数: 默认 1

          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211')
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

    //为Ajax处理筛选请求时添加地址、工程等字段
    sql_1 = this.filter(query, sql_1);
    console.log(sql_1);
    /*
    * sql_2语句, 总体SQL语句中的第二部分: Ccutoffline | Caverage
    */

    // 查询省控线 line
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch);
    console.log(line);
    //分差区间
    let rangeMin = parseInt(query.score) - parseInt(query.range) - line, //最低分
        rangeMax = parseInt(query.score) + parseInt(query.range) - line, //最高分
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
    //传递图表所用省控线

    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }

    return this.display();
  }//diffrenceAction


  //学校-等位分查询  Action
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
          category: this.get('category'), //科类: 理科 || 文科
          batch: this.get('batch'), //批次: 本科第一批 || 本科第二批
          eq: parseInt(this.get('eq')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1, //页数: 默认 1

          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211')
      };
      query.type = 'school';
    }

    let collegeModel = this.model('college'),
        admissionModel = this.model('admissionline');

    let min = parseInt(query.eq) - parseInt(query.range),  //最低
        max = parseInt(query.eq) + parseInt(query.range);  //最高


    let sql_1 = {
      'Cyear': query.year,
      'Corigin': query.pos,
      'Ccategory': query.category,
      'Cbatch': query.batch,
      'Cequipotential': ['BETWEEN', min, max],
      'Cstatus': 1
    };
    //为Ajax处理筛选请求时添加地址、工程等字段
    sql_1 = this.filter(query, sql_1);


    let order = 'Cequipotential',
        sort = 'DESC',
        page = query.page;
    let schools = await collegeModel.selectAll(sql_1, null, order, sort, page),
        line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch);

    let json = {
      query: query, //查询参数
      line: line, //分数线
      count: schools.count, //结果总数
      totalPages: schools.totalPages, //总页数
      page: schools.currentPage, //当前页
      schools: schools.data //学校数组
    };
    //传递图表所用省控线

    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }

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
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014 || 2016
          category: this.get('category'), //科类: 理科 || 文科
          rank: parseInt(this.get('rank')), //分数: Number
          range: parseFloat(this.get('range')), //波动区间: %5 || %10 || %15 || %20
          page: this.get('page') || 1, //页数: 默认 1

          //filter
          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211')
      };
      console.log(query);
      query.type = 'school';
      //range百分比转换为数值
      query.range /= 100;
    }
    //model
    let rankingModel = this.model('ranking'),
        collegeModel = this.model('college'),
        admissionModel = this.model('admissionline');
    //计算最大、最小排名
    let rankMax = query.rank * (1 + query.range),
        rankMin = query.rank * (1 - query.range);

    //通过排名，在ranking表中得到最低、最高分
    let max = await rankingModel.rankToScore(query.year, query.pos,  query.category, rankMin),
        min = await rankingModel.rankToScore(query.year, query.pos,  query.category, rankMax);

    //在college表中查找调档线分数在[min, max]间的学校
    let sql_1 = {
      'Ccutoffline': ['BETWEEN', min, max],
      'Cyear': query.year,
      'Corigin': query.pos,
      'Ccategory': query.category,
      'Cstatus': 1
    };

    //为Ajax处理筛选请求时添加地址、工程等字段
    sql_1 = this.filter(query, sql_1);




    let order = 'Rbegin',
        sort = 'ASC',
        page = query.page;

    let schools = await rankingModel.joinCollege(sql_1, null, order, sort, page),
        line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, null);
    //range数值转为百分比
    query.range *= 100;

    let json = {
      query: query, //查询参数
      line: line, //省控线
      count: schools.count, //结果总数
      totalPages: schools.totalPages, //总页数
      page: schools.currentPage, //当前页
      schools: schools.data //学校数组
    };
    //传递图表所用省控线
    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }


    return this.display();
  }


  /**
  * 高校详情页面
  * @return {Promise}
  */
  async detailAction() {
    let id = this.get('id');

    //查询学校基本信息

    return this.display();
  }
}
