const fs = require('fs');
let code = fs.readFileSync('src/components/tech-update-card.tsx', 'utf8');

// Add props correctly
code = code.replace(
  'className="glass-card rounded-xl border border-white/5 card-hover animate-fade-in-up"',
  'className={`glass-card rounded-xl border-y border-r border-white/5 border-l-[4px] \${config.borderColor} card-hover animate-fade-in-up relative group lg:pl-5`}'
);

const timelineDot = `      {/* Timeline dot */}
      <div className="absolute -left-[29px] top-6 z-10 hidden lg:block">
        <div
          className={\`h-3 w-3 rounded-full border-2 border-card \${config.bgColor.replace('/10', '')} \${isNew ? 'animate-pulse-live' : ''}\`}
        />
      </div>

      <div className="p-4 sm:p-5">`;

code = code.replace('      <div className="p-4 sm:p-5">', timelineDot);

fs.writeFileSync('src/components/tech-update-card.tsx', code);
console.log("Updated tech-update-card layout");
