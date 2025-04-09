import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add custom styles from the design reference
const style = document.createElement('style');
style.textContent = `
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb {
    background: #c5c5c5;
    border-radius: 4px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
  
  /* Progressive loading animation */
  @keyframes placeHolderShimmer {
    0% { background-position: -800px 0 }
    100% { background-position: 800px 0 }
  }
  
  .animated-loading {
    animation-duration: 1.5s;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-name: placeHolderShimmer;
    background: linear-gradient(to right, #f6f6f6 8%, #f0f0f0 18%, #f6f6f6 33%);
    background-size: 800px 104px;
    position: relative;
  }

  /* Oak Bay color system - can be used with Tailwind utilities */
  :root {
    --oak-blue-50: #e6f1f9;
    --oak-blue-100: #cce3f3;
    --oak-blue-200: #99c7e7;
    --oak-blue-300: #66abdb;
    --oak-blue-400: #338fcf;
    --oak-blue-500: #0056a6;
    --oak-blue-600: #004e95;
    --oak-blue-700: #003d73;
    --oak-blue-800: #002b52;
    --oak-blue-900: #001a31;
    
    --oak-green-50: #e8efe7;
    --oak-green-100: #d1dfcf;
    --oak-green-200: #a3bfa0;
    --oak-green-300: #769e70;
    --oak-green-400: #587e51;
    --oak-green-500: #4e7e3e;
    --oak-green-600: #467138;
    --oak-green-700: #37582c;
    --oak-green-800: #273f1f;
    --oak-green-900: #182613;
    
    --oak-gold-50: #fdf8e9;
    --oak-gold-100: #fbf1d3;
    --oak-gold-200: #f7e3a7;
    --oak-gold-300: #f3d57c;
    --oak-gold-400: #efc750;
    --oak-gold-500: #e2b33d;
    --oak-gold-600: #cca137;
    --oak-gold-700: #9f7d2b;
    --oak-gold-800: #72591f;
    --oak-gold-900: #463613;
  }

  body {
    font-family: 'Open Sans', sans-serif;
  }
  
  h1, h2, h3, h4, h5, h6, .font-heading {
    font-family: 'Montserrat', sans-serif;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
