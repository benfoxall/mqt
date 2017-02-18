import commonjs from 'rollup-plugin-commonjs'
import replace from 'rollup-plugin-re'

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
    })
  ],
  moduleName: 'MQT',
  format: 'umd'
}
