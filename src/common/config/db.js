'use strict';

/**
 * mysql config
 * @type {Object}
 */

export default {
  type: 'mysql',
  adapter: {
    mysql: {
      // host: '192.168.2.222',
      host: '127.0.0.1',
      port: '3306',
      database: 'referencesystem_new',
      user: 'root',
      password: '123456',
      prefix: 'ref_',
      encoding: 'utf8',
      nums_per_page: 20
    }
  }
};
