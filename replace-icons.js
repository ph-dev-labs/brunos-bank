const fs = require('fs');
const path = require('path');

const emojiMap = {
  "🏠": "home",
  "↗️": "call_made",
  "📋": "receipt_long",
  "💰": "payments",
  "💳": "credit_card",
  "🔔": "notifications",
  "👤": "person",
  "⚙️": "settings",
  "⚡️": "bolt",
  "📧": "mail",
  "🎉": "celebration",
  "✅": "check_circle",
  "🌙": "dark_mode",
  "☀️": "light_mode",
  "👥": "group",
  "🏦": "account_balance",
  "⬇️": "download",
  "📥": "download",
  "✕": "close",
  "✓": "check",
  "✗": "close",
  "🚪": "logout"
};

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(path.join(__dirname, 'app'), []);
files.push(path.join(__dirname, 'lib/email.ts'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // For the layout.tsx sidebar which we already handled manually with span tag
  // We can just rely on the map for anything else, but we need to inject the span tag 
  // for all raw emojis in the JSX text, or strings.
  
  // Actually, replacing an emoji with `<span className="material-symbols-outlined align-middle">icon</span>` 
  // only works inside JSX. Inside strings (like `title: "Money Received 💰"`), it will break if not careful, 
  // or it will just render the raw string if it's sent via email or API.
  
  // For API routes and email templates, we can just remove the emojis or keep them, 
  // but if we replace them, we should do it correctly. 
  
  // Since this is a bit risky for string literals vs JSX, I'll only replace emojis inside JSX 
  // where we can safely insert the span, or I will just manually do the main ones.
});
