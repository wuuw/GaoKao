'use strict';

import Base from './base.js';
export default class extends Base {
  init(http){
    super.init(http);
  }
  /**
  * index action
  * @return {Promise} []
  *
  **/
  async indexAction() {
    //获取前端query参数
    let query = null;
    if(this.isGet()){
        query = {
          type: this.get('type'), //查询类型: school || major
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014
          scoreType: this.get('scoreType'), //分数类型: min || avg || max
          category: this.get('subject'), //科类: 理科 || 文科
          major: this.get('major'), //专业编号: 1-10
          score: parseInt(this.get('score')), //分数: Number
          range: parseInt(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1 //页数: 默认 1
      };
    }
    if(this.isPost()) {
        query = {
          type: this.post('type'), //查询类型: school || major
          pos: this.post('pos'), //生源地: 四川省
          year: this.post('year'), //年份: 2015 || 2014
          scoreType: this.post('scoreType'), //分数类型: min || avg || max
          category: this.post('category'), //科类: 理科 || 文科
          major: this.post('major'), //专业编号: 1-10
          score: parseInt(this.post('score')), //分数: Number
          range: parseInt(this.post('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.post('page') || 1, //页数: 默认 1
          city: this.post('city'), //大学城市
          is985: this.post('is985'),
          is211: this.post('is211')
      };
    }

    /**
    *  判断查询方式 school | major
    *  返回对应组件
    *  @return {json}
    */

    //按照院校查找 query.type == 'school'
    if (query.type === 'school') {
      let collegeModel = this.model('college'), //文件../model/college.js
          admissionModel = this.model('admissionline'); //文件../model/admissionline.js
      console.log(query);
      //sql_1语句, 总体SQL语句中的第一部分
        let sql_1 = {
          'Corigin': query.pos, //生源
          'Cyear': query.year, //年份
          'Ccategory': query.category, //文理
          'Cstatus': 1 //有效标志位
        };


      /*
      * sql_2语句, 总体SQL语句中的第二部分: Ccutoffline | Caverage
      */
      let rangeMin = parseInt(query.score) - parseInt(query.range), //最低分
          rangeMax = parseInt(query.score) + parseInt(query.range), //最高分
          //从 ../config/config.js 里读取查询的分数类型
          scoreType = this.config('schoolType.' + query.scoreType);
      let sql_2 = `${scoreType} >= ${rangeMin} and ${scoreType} <= ${rangeMax}`;

      /** 其他配置项
      * order: 排序的字段
      * sort: DESC 降序， ASC 升序
      * page: 分页查询的页码
      * on: 条件对象
      */
      let order = "Ccutoffline",
          sort = 'DESC',
          page = query.page;

      /**
      *  接受前端筛选条件的Ajax请求
      *  执行Ajax请求，返回json数据
      *  @return {json}
      */


      //查询
      let schools = await admissionModel.joinCollege(sql_1, sql_2, order, sort, page);

      let json = {
        query: query, //查询参数
        count: schools.count, //结果总数
        totalPages: schools.totalPages, //总页数
        page: schools.currentPage, //当前页
        schools: schools.data //学校数组
      };
      this.assign(json);
      return this.display();

    } else {
      //按照专业查找
      let majorModel = this.model('major'),
          admissionModel = this.model('admissionline');
      let major = this.config('majors.' + (query.major - 1));
      //sql_1语句
      let sql_1 = {
        'Morigin': query.pos,
        'Myear': query.year,
        'Mcategory': query.category,
        'Mname': ['like', `%${major}%`],
        'Mstatus': 1
      };

      //sql_2语句
      let rangeMin = parseInt(query.score) - parseInt(query.range), //最低分
          rangeMax = parseInt(query.score) + parseInt(query.range), //最高分
          //从../config/config.js 里读取查询的分数类型
          scoreType = this.config('majorType.' + query.scoreType);
      let sql_2 = `${scoreType} >= ${rangeMin} and ${scoreType} <= ${rangeMax}`;

      //其他配置项
      let order = `${scoreType} - ${query.score}`,
          sort = 'DESC',
          page = query.page;

      //查询
      let majors = await admissionModel.joinMajor(sql_1, sql_2, order, sort, page);

      let json = {
        query: query,
        count: majors.count, //结果总数
        totalPages: majors.totalPages, //总页数
        page: majors.currentPage, //当前页
        majors: majors.data //学校数组
      };

      this.assign(json);
      return this.display();
    }
  }
  /**
  *  接受前端筛选条件的Ajax请求
  *  执行Ajax请求，返回json数据
  *  @return {json}
  */
}
