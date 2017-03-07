'use strict';
import Base from './base.js';
import url from 'url';

export default class extends Base {
  /**
   * index action
   * @return {Promise} []
   */
  indexAction(){
    //auto render template file index_index.html
    return this.display();
  }
  aboutAction(){
    return this.display();
  }
  teamAction(){
    return this.display();
  }
  resultAction(){
    return this.display();
  }
}
