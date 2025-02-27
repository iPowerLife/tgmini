/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Отключаем оптимизацию изображений и другие продвинутые функции
  images: {
    unoptimized: true,
  },
  // Отключаем SSR
  unstable_runtimeJS: true,
  unstable_JsPreload: false,
}

module.exports = nextConfig

