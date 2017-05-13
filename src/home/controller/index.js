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
  searchAction() {
    return this.display();
  }
}
