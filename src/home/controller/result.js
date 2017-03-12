'use strict';

import Base from './base.js';

export default class extends Base {
  init(http){
    super.init(http);
  }
  indexAction() {
    let searchType = this.http.query.type;
    this.assign('searchType', searchType);
    return this.display();
  }
}
