'use strict';
/**
 * logic
 * @param  {} []
 * @return {}     []
 */
export default class extends think.logic.base {
  /**
   * index action logic
   * @return {} []
   */
  indexAction(){

  }

  differenceAction() {
  }

  equipotentialAction() {
    let rule = {
      pos: 'required',
      year: 'required',
      subject: 'required',
      eq: 'required',
      range: 'required'
    }
    let flag = this.validate(rule);
    if (!flag) {
      return this.fail("服务验证错误，请核对数据重试", this.errors());
    }
  }

}
