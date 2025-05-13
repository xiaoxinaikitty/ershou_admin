/**
 * 图片URL处理工具类
 * 用于统一处理图片URL，自动替换为正确的baseUrl
 */
export default class ImageUrlUtil {
  // 当前服务器的baseUrl，与vite.config.ts中的proxy target保持一致
  static readonly currentBaseUrl = 'http://192.168.0.104:8080';

  /**
   * 处理图片URL
   * @param url 原始图片URL
   * @returns 处理后的图片URL
   */
  static processImageUrl(url: string | undefined): string {
    if (!url || url.trim() === '') {
      return '';
    }

    // 处理相对路径
    if (url.startsWith('/')) {
      return `${this.currentBaseUrl}${url}`;
    }

    // 处理包含localhost的URL
    if (url.includes('http://localhost:8080')) {
      return url.replace('http://localhost:8080', this.currentBaseUrl);
    }

    // 处理包含固定IP的URL
    if (url.includes('192.168.200.30:8080')) {
      return url.replace('http://192.168.200.30:8080', this.currentBaseUrl);
    }

    // 其他包含固定IP的可能性
    const regExp = new RegExp('http://192\\.168\\.\\d+\\.\\d+:8080');
    if (regExp.test(url)) {
      return url.replace(regExp, this.currentBaseUrl);
    }

    // 如果没有需要处理的情况，返回原URL
    return url;
  }
} 