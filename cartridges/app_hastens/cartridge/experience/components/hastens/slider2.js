'use strict'

const Template = require('dw/util/Template')
const HashMap = require('dw/util/HashMap')
const PageRenderHelper = require('*/cartridge/experience/utilities/PageRenderHelper.js')

/**
 * @param {dw.experience.ComponentScriptContext} context
 * @returns {string}
 */
module.exports.render = function (context) {
  let model = new HashMap()
  let { body, header, showArrows } = context.content

  model.regions = PageRenderHelper.getRegionModelRegistry(context.component)

  const assets = require('*/cartridge/scripts/assets.js')
  assets.addJs('/js/hastens/slider2.js')
  assets.addCss('/css/hastens/slider2.css')

  let theme = context.content.theme ? context.content.theme.value : 'primary-1'
  let animation = context.content.animation ? context.content.animation.value : 'default'
  let adjustWidth = context.content.adjustWidth ? context.content.adjustWidth.value : 'default'

  let containerClassName = [
    'has-slider2',
    theme ? 'has-background theme--' + theme : null,
    animation === 'default' ? 'animation--fade' : null,
    'adjust-width--' + adjustWidth
  ]

  model.body = body || null
  model.header = header || null
  model.showArrows = showArrows || false
  model.containerClassName = containerClassName.filter(function (item) { return !!item }).join(' ')
  model.slider2Options = JSON.stringify({
    animation: animation
  })

  return new Template('experience/components/slider2').render(model).text
}
