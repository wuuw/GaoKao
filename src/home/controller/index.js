'use strict';
import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */

  async testAction() {
    let collegeModel = this.model('college');

    let record = await collegeModel.where("Cyear = 2014").field('Ccutoffline as min, Cequipotential as eq').select();

    let data = [];

    record.forEach(item => {
      data.push({min: item.min, eq: item.eq});
    });

    let json = {
      data: data
    };

    this.assign(json);
    
    return this.display();
  }

  aboutAction() {
    return this.display();
  }
  teamAction() {
    return this.display();
  }
}
