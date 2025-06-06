const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'songs', 'deep_no_regret.json');

const corrections = [
  {
    targetT0: "怒鳴りあいはおろか",
    targetT1: "怒鳴りあい",
    targetXE: "彼らはよく怒鳴りあいをする。",
    oldXK: "그들은 자주 싸움을 한다.",
    newXK: "그들은 자주 고함치며 다툰다."
  },
  {
    targetT0: "しないタイプだけど",
    targetT1: "だけど",
    targetXE: "子供だけど、意見は一人前だ。",
    oldXK: "어린애지만, 의견은 어른 몫이다.",
    newXK: "어린애지만, 의견은 어른스러워."
  }
];

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let data = JSON.parse(rawData);
  let changesMade = 0;

  if (data && Array.isArray(data.translatedLines)) {
    data.translatedLines.forEach(line => {
      if (line.LI && Array.isArray(line.LI)) {
        line.LI.forEach(item => {
          corrections.forEach(correction => {
            if (line.T0 === correction.targetT0 &&
                item.T1 === correction.targetT1 &&
                item.XE === correction.targetXE &&
                item.XK === correction.oldXK) {
              console.log(`- Updating XK for T0: "${line.T0}", T1: "${item.T1}", XE: "${item.XE}"`);
              console.log(`  Old XK: "${item.XK}"`);
              item.XK = correction.newXK;
              console.log(`  New XK: "${item.XK}"`);
              changesMade++;
            }
          });
        });
      }
    });

    if (changesMade > 0) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`\nSuccessfully updated ${filePath} with ${changesMade} change(s).`);
    } else {
      console.log(`No changes needed for ${filePath}. Check if the T0, T1, XE, and oldXK values are correct or if the XK is already updated.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array or data structure is not as expected.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 