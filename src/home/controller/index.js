'use strict';
import Base from './base.js';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  aboutAction(){
    return this.display();
  }
  teamAction(){
    return this.display();
  }
}
