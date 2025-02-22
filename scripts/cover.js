/**
 * Butterfly
 * ramdom cover
 */

'use strict'

var front = require('hexo-front-matter');
var fs = require('hexo-fs');

hexo.extend.filter.register('before_post_render', function (data) {
  const { config } = this
  if (data.cover) {
    return data
  }
  if (config.post_asset_folder) {
    const imgTestReg = /\.(png|jpe?g|gif|svg|webp)(\?.*)?$/
    const topImg = data.top_img
    const cover = data.cover
    if (topImg && topImg.indexOf('/') === -1 && imgTestReg.test(topImg)) data.top_img = data.path + topImg
    if (cover && cover.indexOf('/') === -1) data.cover = data.path + cover
  }

  data.cover = data.cover || randomCover()
  let postStr = data.raw.split('\n')
  postStr.splice(2,0, 'cover : ' + data.cover)
  fs.writeFileSync(data.full_source,postStr.join('\n'), 'utf-8');
  return data
})

function randomCover () {
  const theme = hexo.theme.config
  let cover
  let num

  if (theme.cover && theme.cover.default_cover) {
    if (!Array.isArray(theme.cover.default_cover)) {
      cover = theme.cover.default_cover
      return cover
    } else {
      num = Math.floor(Math.random() * theme.cover.default_cover.length)
      cover = theme.cover.default_cover[num]
      return cover
    }
  } else {
    cover = theme.default_top_img || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    return cover
  }
}
