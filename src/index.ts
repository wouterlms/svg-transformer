import {
  readFileSync,
  readdirSync,
  statSync,
  watch,
  writeFileSync,
} from 'fs'
import { join } from 'path'

import template from './template'

interface Options {
  svgFolderPath: string
  outputPath: string
}

export default (options: Options) => {
  const { svgFolderPath, outputPath } = options

  const toCamelCase = (str: string) => str.replace(/-\w/g, (x) => `${x[1].toUpperCase()}`)

  const generateObjectContent = (files: string[]) => {
    const objectContent = files.map((fileName) => {
      const fileNameWithoutExtension = fileName.split('.')[0]
      let content = readFileSync(join(svgFolderPath, fileName), 'utf-8')

      // Remove enters
      content = content.replace(/(\r\n|\n|\r)/gm, '')

      return `${toCamelCase(fileNameWithoutExtension)}: '${content}'`
    })

    return objectContent
  }

  const generateEnumContent = (files: string[]) => {
    const svgContent = files.map((fileName) => {
      const fileNameWithoutExtension = fileName.split('.')[0]
      const uppercaseFileName = fileNameWithoutExtension.replace(/-/g, '_').toUpperCase()

      return `${uppercaseFileName} = '${toCamelCase(fileNameWithoutExtension)}'`
    })

    return svgContent
  }

  const generateOutput = () => {
    const files = readdirSync(svgFolderPath)
      .filter((entry) => !statSync(join(svgFolderPath, entry)).isDirectory())

    const svgObjectContent = generateObjectContent(files)
    const svgEnumContent = generateEnumContent(files)

    const output = template(svgObjectContent, svgEnumContent)

    writeFileSync(outputPath, output)
  }

  return {
    name: 'svg-transformer',
    config(_, { command }) {
      if (command === 'serve') {
        watch(svgFolderPath, generateOutput)
      }
    },
  }
}
