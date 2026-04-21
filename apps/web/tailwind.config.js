/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require('@sellio/config/tailwind/preset')],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
};
