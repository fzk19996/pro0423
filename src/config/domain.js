import { getMainDomain } from 'lib/tool';
const byProxy = process.env.NODE_ENV === 'development';

// domain
export const domain = byProxy ? '' : `//tour-manage${getMainDomain()}`;
// 资源
export const ImgDomain = `//t1.focus-img.cn`; // 图片资源域名
export const DefaultPhotoDomain = 'http://t.focus-res.cn/front-end/image/focus-default-img/front-pc/'; // 默认图片
export const DefaultPhoto120x90 = 'default-120-90.png'; // 默认图片尺寸
export const DefaultPhoto220x165 = 'default-220-165.png'; // 默认图片尺寸
export const DefaultPreviewVideo = `/sh220x165sh/focus-op/test/4f29e14c15717c1b27c8d4721a6c99b3.png`; // 点击预览视频

