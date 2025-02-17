const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const terser = require('terser')
const rollup = require('rollup')
const configs = require('./configs')

const DIST_DIR = 'dist'

if (fs.existsSync(DIST_DIR)) {
  fs.rmSync(DIST_DIR, { recursive: true })
}
fs.mkdirSync(DIST_DIR)

build(Object.keys(configs).map((key) => configs[key]))

async function build(builds) {
  for (const entry of builds) {
    try {
      await buildEntry(entry)
    } catch (err) {
      logError(err)
    }
  }
}

async function buildEntry(config) {
  const output = config.output
  const { file, banner } = output
  const isProd = /(min|prod)\.js$/.test(file)

  try {
    let bundle = await rollup.rollup(config)
    let {
      output: [{ code }]
    } = await bundle.generate(output)

    return isProd
      ? write(file, await minify(banner, code), true)
      : write(file, code)
  } catch (err) {
    throw new Error(err)
  }
}

async function minify(banner, code) {
  const output = await terser.minify(code, {
    toplevel: true,
    output: {
      ascii_only: true
    },
    compress: {
      pure_funcs: ['makeMap']
    }
  })
  return (banner || '') + output.code
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    function report(extra) {
      console.log(
        blue(path.relative(process.cwd(), dest)) +
          ' ' +
          getSize(code) +
          (extra || '')
      )
      resolve()
    }

    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err)
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err)
          report(` (gzipped: ${getSize(zipped)})`)
        })
      } else {
        report()
      }
    })
  })
}

function getSize(code) {
  return (code.length / 1024).toFixed(2) + 'kb'
}

function logError(e) {
  console.error(e)
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`
}
