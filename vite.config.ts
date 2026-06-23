import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // --- Case-Insensitive Path Resolver Helper ---
  const findCaseSensitivePath = (base: string, relativePath: string): string | null => {
    const segments = relativePath.split(/[/\\]/);
    let currentPath = base;

    for (const segment of segments) {
      if (!segment) continue;
      try {
        if (!fs.existsSync(currentPath)) return null;
        const files = fs.readdirSync(currentPath);
        const match = files.find(f => f.toLowerCase() === segment.toLowerCase());
        if (!match) return null;
        currentPath = path.join(currentPath, match);
      } catch {
        return null;
      }
    }
    return currentPath;
  };

  // --- Temporary Debug Diagnostics for Case Sensitivity on Vercel ---
  console.log("------------------ VERCEL BUILD PROCESS DIAGNOSTICS ------------------");
  console.log("process.cwd():", process.cwd());
  console.log("__dirname:", __dirname);
  try {
    const rootFiles = fs.readdirSync(process.cwd());
    console.log("Root directory contents:", rootFiles);
    
    // Check for src directory casing
    const srcDirName = rootFiles.find(name => name.toLowerCase() === 'src');
    if (srcDirName) {
      console.log(`Found Src directory named: "${srcDirName}"`);
      console.log(`"${srcDirName}" contents:`, fs.readdirSync(path.join(process.cwd(), srcDirName)));
    } else {
      console.log("No directory named 'src' or 'Src' found in root.");
    }

    // Check for admin directory casing
    const adminDirName = rootFiles.find(name => name.toLowerCase() === 'admin');
    if (adminDirName) {
      console.log(`Found Admin directory named: "${adminDirName}"`);
      console.log(`"${adminDirName}" contents:`, fs.readdirSync(path.join(process.cwd(), adminDirName)));
    } else {
      console.log("No directory named 'admin' or 'Admin' found in root.");
    }
  } catch (err: any) {
    console.log("Diagnostics failure:", err.message);
  }
  console.log("----------------------------------------------------------------------");

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
    let resolved: string | null = null;
    for (const f of files) {
      resolved = findCaseSensitivePath(process.cwd(), f);
      if (resolved) break;
    }
    if (resolved) {
      inputs[key] = resolved;
    } else {
      console.warn(`[Vite Build Warning]: Page entry for "${key}" was not found on filesystem and skipped dynamically.`);
    }
  }

  // A custom resolver plugin to prevent Vercel case sensitivity errors in files & modules (e.g., /src/app.js)
  const caseInsensitiveResolverPlugin = {
    name: 'case-insensitive-resolver',
    resolveId(source: string, importer: string | undefined) {
      if (source.startsWith('/') || source.startsWith('.') || source.includes('src/') || source.includes('admin/')) {
        // Clean leading slash and any bundle queries
        const cleaned = source.split('?')[0].replace(/^\//, '');
        if (cleaned.startsWith('src/') || cleaned.startsWith('admin/') || cleaned.includes('/src/') || cleaned.includes('/admin/')) {
          const relativePath = cleaned.includes('src/') 
            ? cleaned.substring(cleaned.indexOf('src/')) 
            : cleaned.substring(cleaned.indexOf('admin/'));
          
          const resolved = findCaseSensitivePath(process.cwd(), relativePath);
          if (resolved) {
            return resolved;
          }
        }
      }
      return null;
    }
  };

  return {
    plugins: [caseInsensitiveResolverPlugin, react(), tailwindcss()],
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
