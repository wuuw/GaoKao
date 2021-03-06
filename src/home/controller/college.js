'use strict';

import Base from './base.js';
import cheerio from 'cheerio';

export default class extends Base {
  init(http){
    super.init(http);
  }

  /**
  * 学校-线差查询
  * @return {Promise}
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
          score: parseFloat(this.get('score')), //分数: Number
          range: parseFloat(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1, //页数: 默认 1
          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211'),
          hit: Number(this.get('hit'))
      };
      query.type = 'school_dif';
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

    //为Ajax处理筛选请求时添加地区、工程、命中年份等字段
    sql_1 = this.filter(query, sql_1);
    /*
    * sql_2语句, 总体SQL语句中的第二部分: Ccutoffline | Caverage
    */

    // 查询省控线 line
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch);

    //分差区间
    let rangeMin = (query.score) - (query.range), //最低分
        rangeMax = (query.score) + (query.range), //最高分
        //从 ../config/config.js 里读取查询的分数类型
        scoreType = this.config('schoolType.' + query.scoreType);

    //筛选分数区间的学校
    let sql_2 = null;
    if (query.range)
      sql_2 = `${scoreType} - ${line} >= ${rangeMin} and ${scoreType} - ${line} <= ${rangeMax}`;
    else
      sql_2 = `${scoreType} - ${line} <= ${query.score}`;
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
    let schools = null,
        json = null;
    if (query.hit > 0) {
      if (rangeMin == rangeMax) {
        rangeMin = 0;
      }
      schools = await this.model('college').query(`call college_general(${query.hit}, '${query.scoreType}', ${rangeMin}, ${rangeMax}, '${query.category}', '${query.batch}', '${query.pos}','${sql_1.Cproject[1]}','${sql_1.Caddress[1]}',${(query.page-1)*20},20,@total)`);

      let count = await this.model('college').query('select @total');

      json = {
        query: query, //查询参数
        count: count[0]['@total'], //结果总数
        totalPages: Math.ceil(count[0]['@total']/20), //总页数
        page: query.page, //当前页
        schools: schools[0] //学校数组
      };
    } else {
      schools = await collegeModel.selectAll(sql_1, sql_2, order, sort, page);
      json = {
        query: query, //查询参数
        line: line, //分数线
        count: schools.count, //结果总数
        totalPages: schools.totalPages, //总页数
        page: schools.currentPage, //当前页
        schools: schools.data //学校数组
      };
    }

    //传递图表所用省控线
    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }
    return this.display();
  }//diffrenceAction
  /**
  * 学校-等位分查询
  * @return {Promise}
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
          eq: parseFloat(this.get('eq')), //分数: Number
          range: parseFloat(this.get('range')), //波动区间: 5 || 10 || 15 || 20
          page: this.get('page') || 1, //页数: 默认 1
          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211'),
          hit: Number(this.get('hit'))
      };
      query.type = 'school_eq';
    }

    let collegeModel = this.model('college'),
        admissionModel = this.model('admissionline');

    let min = (query.eq) - (query.range),  //最低
        max = (query.eq) + (query.range);  //最高


    let sql_1 = {
      'Cyear': query.year,
      'Corigin': query.pos,
      'Ccategory': query.category,
      'Cbatch': query.batch,
      'Cequipotential': ['BETWEEN', min, max],
      'Cstatus': 1
    };
    //为Ajax处理筛选请求时添加地区、工程等字段
    sql_1 = this.filter(query, sql_1);

    //区间选择不限
    if (!query.range) {
      sql_1.Cequipotential = {'<': query.eq}
    }

    let order = 'Cequipotential',
        sort = 'DESC',
        page = query.page;

    //查询
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, query.batch),
        schools = null,
        json = null;

    if (query.hit > 0) {
      if (min == max) {
        min = 100;
      }
      schools = await this.model('college').query(`call college_general(${query.hit}, 'eq', ${min}, ${max}, '${query.category}', '${query.batch}', '${query.pos}','${sql_1.Cproject[1]}','${sql_1.Caddress[1]}',${(query.page-1)*20},20,@total)`);

      let count = await this.model('college').query('select @total');

      json = {
        query: query, //查询参数
        count: count[0]['@total'], //结果总数
        totalPages: Math.ceil(count[0]['@total']/20), //总页数
        page: query.page, //当前页
        schools: schools[0] //学校数组
      };
    } else {
      schools = await collegeModel.selectAll(sql_1, null, order, sort, page)
      json = {
        query: query, //查询参数
        line: line, //分数线
        count: schools.count, //结果总数
        totalPages: schools.totalPages, //总页数
        page: schools.currentPage, //当前页
        schools: schools.data //学校数组
      };
    }

    if (this.isAjax('get')) this.success(json);
    if (this.isGet()) {
      this.assign(json);
      this.assign({lineForChart: await this.getLineForTable(query.pos, query.category)});
    }

    return this.display();
  }//equipotentialAction
  /**
  * 学校-位次分查询
  * @return {Promise}
  */

  async rankAction() {
    //获取get参数
    let query = null;
    if(this.isGet()){
        query = {
          pos: this.get('pos'), //生源地: 四川省
          year: this.get('year'), //年份: 2015 || 2014 || 2016
          category: this.get('category'), //科类: 理科 || 文科
          rank: parseFloat(this.get('rank')), //分数: Number
          range: parseFloat(this.get('range')), //波动区间: %5 || %10 || %15 || %20
          page: this.get('page') || 1, //页数: 默认 1
          //filter
          city: this.get('city'),
          is985: this.get('is985'),
          is211: this.get('is211'),
          hit: Number(this.get('hit'))
      };
      query.type = 'school_rank';
      //range百分比转换为数值
      query.range /= 100;
    }
    //model
    let rankingModel = this.model('ranking'),
        collegeModel = this.model('college'),
        admissionModel = this.model('admissionline');
    //计算最大、最小排名
    let rankMax = Math.min(query.rank * (1 + query.range), 280000),
        rankMin = Math.min(query.rank * (1 - query.range), 280000);

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
    //区间不限
    if (!query.range) {
      sql_1.Ccutoffline = {'<': min}
    }

    //为Ajax处理筛选请求时添加地区、工程等字段
    sql_1 = this.filter(query, sql_1);

    let order = 'Rbegin',
        sort = 'ASC',
        page = query.page;

    //查询
    let line = await admissionModel.getProvinceLine(query.year, query.pos, query.category, null),
        schools = null,
        json = null;

    if (query.hit > 0) {
      if (rankMin == rankMax) {
        rankMax = 300000;
      }
      schools = await this.model('college').query(`call college_general(${query.hit}, 'rank', ${rankMin}, ${rankMax}, '${query.category}', '%%', '${query.pos}','${sql_1.Cproject[1]}','${sql_1.Caddress[1]}',${(query.page-1)*20},20,@total)`);

      let count = await this.model('college').query('select @total');
      json = {
        query: query, //查询参数
        count: count[0]['@total'], //结果总数
        totalPages: Math.ceil(count[0]['@total']/20), //总页数
        page: query.page, //当前页
        schools: schools[0] //学校数组
      };
    } else {
      schools = await rankingModel.joinCollege(sql_1, null, order, sort, page)
      //range数值转为百分比
      query.range *= 100;
      json = {
        query: query, //查询参数
        line: line, //省控线
        count: schools.count, //结果总数
        totalPages: schools.totalPages, //总页数
        page: schools.currentPage, //当前页
        schools: schools.data //学校数组
      };
    }

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
    let schoolData = {
      id: id
    };
    //查询院校历史分数线
    let school_line_record = await this.model('college').where({'CcollegeID':id,'Cstatus': 1}).order('Cbatch ASC, Cyear ASC').field('Cname as school_name, Caddress as location, Ccutoffline as min, Caverage as avg, Cbatch as batch, Cyear as year').select();



      console.log(id);
      //查询专业历史分数
      let school_name = await this.model('college').where(`CcollegeID = ${id}`).limit(1).select();
      school_name = school_name[0].Cname;


      let major2014,
          major2015,
          major2016;

      major2014 = await this.model('major').where(`Cname='${school_name}' and Myear=2014`).where({'Mname': ['IN', this.config('majors')]}).field('Mcutoffline as min, Maverage as avg, Mhighest as max, Mname as major').order('Mname ASC').select();
      major2015 = await this.model('major').where(`Cname='${school_name}' and Myear=2015`).where({'Mname': ['IN', this.config('majors')]}).field('Mcutoffline as min, Maverage as avg, Mhighest as max, Mname as major').order('Mname ASC').select();
      major2016 = await this.model('major').where(`Cname='${school_name}' and Myear=2016`).where({'Mname': ['IN', this.config('majors')]}).field('Mcutoffline as min, Maverage as avg, Mhighest as max, Mname as major').order('Mname ASC').select();

      let majorList = [],
          min2014 = [],
          avg2014 = [],
          max2014 = [],

          min2015 = [],
          avg2015 = [],
          max2015 = [],

          min2016 = [],
          avg2016 = [],
          max2016 = [];

      major2014.forEach(function(item) {
        if (majorList.indexOf(item.major) < 0) {
          majorList.push(item.major);
        }
        min2014.push(item.min);
        avg2014.push(item.avg);
        max2014.push(item.max);
      })
      major2015.forEach(function(item) {
        if (majorList.indexOf(item.major) < 0) {
          majorList.push(item.major);
        }
        min2015.push(item.min);
        avg2015.push(item.avg);
        max2015.push(item.max);
      })
      major2016.forEach(function(item) {
        if (majorList.indexOf(item.major) < 0) {
          majorList.push(item.major);
        }
        min2016.push(item.min);
        avg2016.push(item.avg);
        max2016.push(item.max);
      });

      let MajorData = {
        majorList: majorList,
        min2016: min2016,
        avg2016: avg2016,
        max2016: max2016,
        min2015: min2015,
        avg2015: avg2015,
        max2015: max2015,
        min2014: min2014,
        avg2014: avg2014,
        max2014: max2014
      }
      if (this.isAjax('post')) {
        this.success(MajorData)
      }

    //从新浪教育爬取
    let brief = this.schoolTips(id),
        intro = this.schoolIntor(id);

    brief.then(res=>{


      let $ = cheerio.load(res.data);
      //name & tips
      schoolData.school_name = school_name;
      schoolData.tips = [$('.collegeNameTips:nth-child(1)').text(), $('.collegeNameTips:nth-child(2)').text(), $('.collegeNameTips:nth-child(3)').text(), $('.collegeNameTips:nth-child(4)').text()];
      //info
      schoolData.location = $('.middleContent.clearfix div.black14:nth-child(1)').text();
      schoolData.belong = $('.middleContent.clearfix div.black14:nth-child(2)').text();
      schoolData.acs = $('.middleContent.clearfix div.black14:nth-child(3)').text();
      schoolData.master = $('.middleContent.clearfix div.black14:nth-child(4)').text();
      schoolData.doctor = $('.middleContent.clearfix div.black14:nth-child(7)').text();
      schoolData.ess = $('.middleContent.clearfix div.black14:nth-child(6)').text();
      schoolData.type = $('.middleContent.clearfix div.black14:nth-child(5)').text();
      //将数据库中查询的院校结果中，与新浪网上同名的记录筛选出来

      //intro
      intro.then(res => {
        //学校简介
        let $ = cheerio.load(res.data);
        schoolData.intro = $('.contentMain p').map(function() {
          return $(this).text() || '暂无资料。';
        });
        //本一线
        let schoolLine_1 = school_line_record.filter(item => {
          return item.school_name === schoolData.school_name && item.batch === '本科第一批';
        });
        //本二线
        let schoolLine_2 = school_line_record.filter(item => {
          return item.school_name === schoolData.school_name && item.batch === '本科第二批';
        });
        //学校本一线 && 本二线
        schoolData.schoolLine_1 = schoolLine_1;
        schoolData.schoolLine_2 = schoolLine_2;

        let fullProv = schoolLine_1[0].location || schoolLine_2[0].location;

        if (fullProv == '内蒙古自治区') {
          fullProv = '内蒙古';
        } else if (fullProv == '黑龙江省') {
          fullProv = '黑龙江';
        } else {
          fullProv = fullProv.slice(0, 2);
        }
        schoolData.prov = fullProv;

        this.assign('school', schoolData);

        if (this.isAjax('get')) {
          let data = [];
          data.push(schoolData.schoolLine_1);
          data.push(schoolData.schoolLine_2);
          this.success(data);
        }
        return this.display();
      });
    })
  }

  async nullAction() {
    return this.display();
  }
}
