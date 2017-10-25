/**
 * @copyright 2017-present, Charlike Mike Reagent <olsten.larck@gmail.com>
 * @license Apache-2.0
 */

const fs = require('fs');
const zlib = require('zlib');
const pify = require('pify');

const stat = pify(fs.stat);

module.exports = function gzip (options) {
  const opts = Object.assign({ minSize: 0 }, options);

  return {
    name: 'just-gzip',

    onwrite: (details) => {
      // fallbacks for Rollup < 0.48
      const fp = details.file || details.dest;

      return new Promise((resolve, reject) => {
        // eslint-disable-next-line consistent-return
        stat(fp).then((stats) => {
          if (opts.minSize && opts.minSize > stats.size) {
            return Promise.resolve();
          }
          const outStream = fs.createWriteStream(`${fp}.gz`).once('error', reject);
          const gzipStream = zlib.createGzip(opts).once('error', reject);

          fs
            .createReadStream(fp)
            .once('error', reject)
            .pipe(gzipStream)
            .once('error', reject)
            .pipe(outStream)
            .once('error', reject)
            .on('close', () => resolve());
        });
      });
    },
  };
};
