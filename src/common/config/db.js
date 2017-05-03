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
      host: '192.168.2.222',
      port: '3306',

      database: 'referencesystem',
      // database: 'referencesystem',

      user: 'root',
      password: '123456',
      prefix: 'ref_',
      encoding: 'utf8',
      nums_per_page: 20
    }
  }
};
