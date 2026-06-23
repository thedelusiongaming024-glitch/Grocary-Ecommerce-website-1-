import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Safe helper to find the first case-insensitive existing path on disk, preventing build failures
  const getExistingPath = (possiblePaths: string[]) => {
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return p;
      }
    }
    return null;
  };

  const pages = {
    main: ['index.html'],
    shop: ['shop.html'],
    product: ['product.html'],
    cart: ['cart.html'],
    checkout: ['checkout.html'],
    orderTracking: ['order-tracking.html', 'Order-tracking.html', 'ordertracking.html'],
    wishlist: ['wishlist.html'],
    login: ['login.html'],
    dashboard: ['dashboard.html'],
    about: ['about.html'],
    contact: ['contact.html'],
    blog: ['blog.html'],
    faq: ['faq.html'],
    privacyAndPolicy: ['privacy-and-policy.html'],
    termsAndCondition: ['terms-and-condition.html'],
    returnPolicy: ['return-policy.html'],
    refundPolicy: ['refund-policy.html'],
    shippingPolicy: ['shipping-policy.html'],
    admin: ['admin/index.html', 'Admin/index.html', 'admin/Index.html', 'Admin/Index.html']
  };

  const inputs: Record<string, string> = {};

  for (const [key, files] of Object.entries(pages)) {
    const resolved = getExistingPath(files.map(f => path.resolve(__dirname, f)));
    if (resolved) {
      inputs[key] = resolved;
    } else {
      console.warn(`[Vite Build Warning]: Page entry for "${key}" was not found on filesystem and skipped dynamically.`);
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: inputs
      }
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
