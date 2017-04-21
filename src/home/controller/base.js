'use strict';

export default class extends think.controller.base {
  /**
   * some base method in here
   */
   indexAction(){
     return this.display();
   }

   //查询图表所用的省控线
   /**
   * @return {Object}
   *
   */
   async getLineForTable(pos, category) {
     let admissionModel = this.model('admissionline');
     let lineForChart = await admissionModel.where({'origin':pos, 'category': category}).order('Ayear ASC, Aminimunline DESC').field('Ayear as year, Aminimunline as line').select();

     return lineForChart;
   }
   
}
