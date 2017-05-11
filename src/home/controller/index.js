'use strict';
import Base from './base.js';
import fs from 'fs';
export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction() {
    return this.display();
  }
  aboutAction() {
    return this.display();
  }
  teamAction() {
    return this.display();
  }
  searchAction() {
    return this.display();
  }
  saveAction() {
    let All = JSON.parse(fs.readFileSync(__dirname + '/schoolID.json').toString());

    for (let i = 1; i < 31; i++) {
      for (let j in All.data[i].college) {
        // console.log(j, All.data[i].college[j]);
        this.model('college').query(`insert into ref_collegeID(id, Cname) value (${j}, '${All.data[i].college[j]}')`);
      }
    }

    return this.display();
  }
}
