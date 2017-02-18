import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-re'
import buble from 'rollup-plugin-buble';

export default {
  entry: 'index.js',
  dest: 'build/mqt.js',
  plugins: [
    commonjs(),

    // fix a couple of problems with "use strict"
    replace({
      patterns: [
        {
          test: 'Paho = {}',
          replace: 'var Paho = {}',
        },
        {
          test: '		wireMessage = new',
          replace: '		var wireMessage = new'
        }
      ]
    }),
    buble({
      exclude: [ 'node_modules/**' ]
    })
  ],
  moduleName: 'MQT',
  format: 'umd'
}
