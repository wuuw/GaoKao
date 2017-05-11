'use strict';
import axios from 'axios';

export default class extends think.controller.base {
  /**
   * some base method in here
   */

   //查询图表所用的省控线
   /**
   * @return {Object}
   *
   */
   async getLineForTable(pos, category) {
     let admissionModel = this.model('admissionline');
     let lineForChart = await admissionModel.where({'Aorigin':pos, 'Acategory': category}).order('Ayear ASC, Aminimunline DESC').field('Ayear as year, Aminimunline as line').select();

     return lineForChart;
   }

   filter(query, sql) {
     if (query.is985 === 'true') {
       sql['Cproject'] = '985、211';
     } else if(query.is211 === 'true') {
       sql['Cproject'] = '211';
     }

     if (query.city) {
       if (query.city !== '所有地区') {
         sql['Caddress'] = query.city;
       }
     }
     return sql;
   }

   schoolTips(id) {
     //axios请求
     return axios.get(`http://kaoshi.edu.sina.com.cn/college/c/${id}.shtml`)
   }

   schoolIntor(id) {
     //axios请求
     return axios.get(`http://kaoshi.edu.sina.com.cn/college/c/overview/${id}.shtml`)
   }
}
