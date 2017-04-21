'use strict';
/**
 * db config
 * @type {Object}
 */
export default {
  type: 'mysql',
  adapter: {
    mysql: {
      host: '127.0.0.1',
      port: '',
      database: 'referencesystem',
      user: 'root',
      password: '123456',
      prefix: 'ref_',
      encoding: 'utf8',
      nums_per_page: 20
    }
  }
};
