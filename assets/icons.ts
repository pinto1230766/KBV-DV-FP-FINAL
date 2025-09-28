const svgIcon = `
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%233F5173'>
    <path fill-rule='evenodd' clip-rule='evenodd' d='M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4ZM5 20V10H19V20H5ZM19 8H5V6H19V8Z' fill-opacity='0.4'/>
    <path d='M15 14C15 15.6569 13.6569 17 12 17C10.3431 17 9 15.6569 9 14C9 12.3431 10.3431 11 12 11C13.6569 11 15 12.3431 15 14Z' fill='white'/>
    <path d='M7 2V5' stroke='white' stroke-width='2' stroke-linecap='round'/>
    <path d='M17 2V5' stroke='white' stroke-width='2' stroke-linecap='round'/>
</svg>`;

// The fetch logic below is for illustrative purposes to show how you would generate these.
// In a real build process, these would be pre-generated PNGs.
// Since we cannot run a build process, we'll just link to the SVG for now.
export const favicon = `data:image/svg+xml,${encodeURIComponent(svgIcon)}`;
export const appleTouchIcon = `data:image/svg+xml,${encodeURIComponent(svgIcon)}`;

// You would typically generate these PNGs during a build step.
// For this environment, we'll create simple placeholders or reference them
// by path, assuming they will be generated and placed in the public folder.
// For the purpose of making the manifest work, we'll point to non-existent files
// that should be created.
export const icon192 = '/icon-192.png';
export const icon512 = '/icon-512.png';
