// referensi: https://github.com/windicss/windicss/blob/bcd50d877e62630f191602ddeabd9f677cc6d90c/src/cli/index.ts

import { Processor } from 'windicss/lib'
import { HTMLParser, CSSParser } from 'windicss/utils/parser'

export default function(html) {
  // console.log(StyleSheet)
  // Get windi processor
  const processor = new Processor()
  // let styleSheets = ['']

  let styleBlock

  const block = html.match(/(?<=<style lang=['"]windi["']>)[\s\S]*(?=<\/style>)/);
  if (block && block.index) {
    const css = html.slice(block.index, block.index + block[0].length);
    const parser = new CSSParser(css, processor);
    // return parser.parse() // ini
    styleBlock = parser.parse()
    // console.log(JSON.stringify(parser.parse()))
    // styleSheets[0] = styleSheets[0].extend(parser.parse());
  }

  // Parse all classes and put into one line to simplify operations
  const htmlClasses = new HTMLParser(html)
    .parseClasses()
    .map(i => i.result)
    .join(' ')


  // Generate preflight based on the html we input
  const preflightSheet = processor.preflight(html)

  // return preflightSheet // ini

  // Process the html classes to an interpreted style sheet
  const interpretedSheet = processor.interpret(htmlClasses).styleSheet

  // Build styles
  const APPEND = false
  const MINIFY = false

  // const styles = interpretedSheet/*.extend(preflightSheet, APPEND)*/.extend(styleBlock, APPEND).build(MINIFY) // diubah ke css, nggak pakai preflight
  const styles = interpretedSheet.extend(preflightSheet, APPEND).extend(styleBlock, APPEND).extend(styleBlock, APPEND).extend(styleBlock, APPEND).build(MINIFY) // diubah ke css
  // const styles = interpretedSheet.extend(preflightSheet, APPEND).extend(styleBlock, APPEND) // masih bentuk class Windi

  return styles
}