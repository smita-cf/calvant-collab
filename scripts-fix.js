// const fs = require("fs");
// const path = require("path");

// const pages = [
//   {
//     file: "app/iso-27001/page.js",
//     path: "/iso-27001",
//     title: "ISO 27001 Compliance | CalVant",
//     desc: "Streamline your ISO 27001 certification journey with CalVant.",
//     component: "ISO_27001",
//     from: "@/modules/dashboard/FrameWorks/ISO_27001",
//     h1: "ISO 27001 Compliance | CalVant",
//   },
//   {
//     file: "app/iso-27701/page.js",
//     path: "/iso-27701",
//     title: "ISO 27701 Compliance | CalVant",
//     desc: "Privacy Information Management with ISO 27701 on CalVant.",
//     component: "ISO_27701",
//     from: "@/modules/dashboard/FrameWorks/ISO_27701",
//     h1: "ISO 27701 Compliance | CalVant",
//   },
//   {
//     file: "app/iso-42001/page.js",
//     path: "/iso-42001",
//     title: "ISO 42001 AI Management | CalVant",
//     desc: "Manage AI risks and compliance with ISO 42001 using CalVant.",
//     component: "ISO_42001",
//     from: "@/modules/dashboard/FrameWorks/ISO_42001",
//     h1: "ISO 42001 AI Management | CalVant",
//   },
//   {
//     file: "app/ksa-pdpl/page.js",
//     path: "/ksa-pdpl",
//     title: "KSA PDPL Compliance | CalVant",
//     desc: "Saudi Arabia Personal Data Protection Law compliance with CalVant.",
//     component: "KSA_PDPL",
//     from: "@/modules/dashboard/FrameWorks/KSA_PDPL",
//     h1: "KSA PDPL Compliance | CalVant",
//   },
//   {
//     file: "app/soc2/page.js",
//     path: "/soc2",
//     title: "SOC 2 Compliance | CalVant",
//     desc: "Automate your SOC 2 compliance program with CalVant.",
//     component: "SOC2",
//     from: "@/modules/dashboard/FrameWorks/SOC2",
//     h1: "SOC 2 Compliance | CalVant",
//   },
//   {
//     file: "app/blog/page.js",
//     path: "/blog",
//     title: "Compliance & Security Blog | CalVant",
//     desc: "Latest insights on compliance, security and data privacy from CalVant.",
//     component: "BlogPage",
//     from: "@/static-pages/blog",
//     h1: "Compliance & Security Blog | CalVant",
//   },
//   {
//     file: "app/gdpr/page.js",
//     path: "/gdpr",
//     title: "GDPR Compliance | CalVant",
//     desc: "Achieve GDPR compliance with CalVant automated tools and frameworks.",
//     component: "GDPR",
//     from: "@/modules/dashboard/FrameWorks/GDPR",
//     h1: "GDPR Compliance | CalVant",
//   },
//   {
//     file: "app/privacy/page.js",
//     path: "/privacy",
//     title: "Privacy Policy | CalVant",
//     desc: "CalVant privacy policy and data handling practices.",
//     component: "FooterContentPage",
//     from: "@/footer-pages/FooterContentPage",
//     h1: "Privacy Policy | CalVant",
//     props: ' type="privacy"',
//   },
//   {
//     file: "app/security/page.js",
//     path: "/security",
//     title: "Security | CalVant",
//     desc: "How CalVant keeps your data secure.",
//     component: "FooterContentPage",
//     from: "@/footer-pages/FooterContentPage",
//     h1: "Security | CalVant",
//     props: ' type="security"',
//   },
//   {
//     file: "app/terms/page.js",
//     path: "/terms",
//     title: "Terms of Service | CalVant",
//     desc: "CalVant terms of service and usage policies.",
//     component: "FooterContentPage",
//     from: "@/footer-pages/FooterContentPage",
//     h1: "Terms of Service | CalVant",
//     props: ' type="terms"',
//   },
// ];

// pages.forEach(
//   ({ file, path: pagePath, title, desc, component, from, h1, props = "" }) => {
//     const content = `import dynamic from 'next/dynamic';
// import { getPageMetadata } from '@/utils/getPageMetadata';

// export async function generateMetadata() {
//   return getPageMetadata('${pagePath}', {
//     title: '${title}',
//     description: '${desc}',
//     alternates: { canonical: 'https://calvant.com${pagePath}' },
//   });
// }

// const ${component} = dynamic(() => import('${from}'), { ssr: false });

// export default function Page() {
//   return (
//     <>
//       <h1 style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap' }}>
//         ${h1}
//       </h1>
//       <${component}${props} />
//     </>
//   );
// }
// `;

//     fs.writeFileSync(path.resolve(file), content, "utf8");
//     console.log(`✅ Fixed: ${file}`);
//   },
// );

// console.log("\n🎉 All pages updated!");


// const fs = require('fs');
// const path = require('path');
// const { execSync } = require('child_process');

// const result = execSync('git ls-files src/').toString();
// const files = result.split('\n').filter(f => f.endsWith('.js') || f.endsWith('.jsx'));

// let fixedCount = 0;

// files.forEach(filePath => {
//   const fullPath = path.resolve(filePath);
//   if (!fs.existsSync(fullPath)) return;

//   let content = fs.readFileSync(fullPath, 'utf8');

//   if (!content.includes('<Link')) return;

//   // Remove ALL existing Link imports anywhere in the file
//   content = content.replace(/import Link from ['"]next\/link['"];\n?/g, '');

//   // Find "use client" anywhere in the file
//   const useClientMatch = content.match(/^([\s\S]*?)(["']use client["'];?\n?)/m);

//   if (useClientMatch) {
//     // Put "use client" first, then Link import, then rest
//     const before = content.substring(0, content.indexOf(useClientMatch[2]));
//     const after = content.substring(content.indexOf(useClientMatch[2]) + useClientMatch[2].length);
//     content = '"use client";\nimport Link from \'next/link\';\n' + before + after;
//   } else {
//     // No "use client" - add Link at top
//     content = "import Link from 'next/link';\n" + content;
//   }

//   fs.writeFileSync(fullPath, content, 'utf8');
//   console.log(`✅ Fixed: ${filePath}`);
//   fixedCount++;
// });

// console.log(`\n🎉 Fixed ${fixedCount} files`);

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const result = execSync('git ls-files src/').toString();
const files = result.split('\n').filter(f =>
  f.endsWith('.js') || f.endsWith('.jsx') || f.endsWith('.ts') || f.endsWith('.tsx')
);

let fixedCount = 0;

files.forEach(filePath => {
  const fullPath = path.resolve(filePath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');

  // Skip if useRouter is not used at all
  if (!content.includes('useRouter')) return;

  // Skip if import already exists
  if (content.includes("from 'next/navigation'") || content.includes('from "next/navigation"')) {
    // Check if useRouter is actually in the import
    const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*["']next\/navigation["']/);
    if (importMatch && importMatch[1].includes('useRouter')) return;

    // next/navigation exists but useRouter not included — add it
    content = content.replace(
      /import\s*\{([^}]+)\}\s*from\s*["']next\/navigation["']/,
      (match, imports) => {
        const trimmed = imports.trim();
        return `import { useRouter, ${trimmed} } from "next/navigation"`;
      }
    );
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`🔧 Added useRouter to existing import: ${filePath}`);
    fixedCount++;
    return;
  }

  // No next/navigation import at all — need to add it
  const lines = content.split('\n');

  // Find "use client" line index
  const useClientIndex = lines.findIndex(line =>
    /^["']use client["'];?$/.test(line.trim())
  );

  const importLine = `import { useRouter } from "next/navigation";`;

  if (useClientIndex !== -1) {
    console.log(`   📍 "use client" found at line ${useClientIndex + 1} in ${filePath}`);
    // Insert import right after "use client"
    lines.splice(useClientIndex + 1, 0, importLine);
  } else {
    // No "use client" — insert at top of file
    lines.unshift(importLine);
  }

  fs.writeFileSync(fullPath, lines.join('\n'), 'utf8');
  console.log(`✅ Fixed: ${filePath}`);
  fixedCount++;
});

console.log(`\n🎉 Fixed ${fixedCount} files`);