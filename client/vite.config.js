import { defineConfig } from 'vite';
import react from "@vitejs/plugin-react-swc";

export default ({ mode }) => {
  const config = {
    plugins: [react()],
      proxy: {
        port:1338,
        '/backend-api': {
          target: "http://localhost:1338",
          changeOrigin: true,
          // rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
  };
  return defineConfig(config);
};

