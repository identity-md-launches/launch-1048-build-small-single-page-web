export default {
  base: './',
  build: { target: 'es2022', assetsInlineLimit: 0 },
  plugins: [{
    name: 'development-csp',
    apply: 'serve',
    // Vite development injects styles and uses a WebSocket for hot updates.
    // The committed production export retains the restrictive local-only CSP.
    transformIndexHtml(html: string) {
      return html.replace(/\s*<meta http-equiv="Content-Security-Policy"[^>]*>/, '');
    },
  }],
};
