import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      {
        name: 'copy-static-root-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
          const rootStaticFiles = ['ads.txt', 'robots.txt', 'sitemap.xml'];
          for (const file of rootStaticFiles) {
            const srcFile = path.resolve(__dirname, file);
            const destFile = path.resolve(distDir, file);
            if (fs.existsSync(srcFile)) {
              fs.copyFileSync(srcFile, destFile);
            }
          }
          const sharedUiSrc = path.resolve(__dirname, 'js/shared-ui.js');
          const sharedUiDestDir = path.resolve(distDir, 'js');
          if (fs.existsSync(sharedUiSrc)) {
            fs.mkdirSync(sharedUiDestDir, {recursive: true});
            fs.copyFileSync(sharedUiSrc, path.resolve(sharedUiDestDir, 'shared-ui.js'));
          }
        },
      },
    ],
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about.html'),
          privacy: path.resolve(__dirname, 'privacy.html'),
          terms: path.resolve(__dirname, 'terms.html'),
          contact: path.resolve(__dirname, 'contact.html'),
          disclaimer: path.resolve(__dirname, 'disclaimer.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
