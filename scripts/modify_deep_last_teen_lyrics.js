import fs from 'fs';

const filePath = './songs/deep_last_teen.json';

try {
  let rawData = fs.readFileSync(filePath, 'utf-8');
  let songData = JSON.parse(rawData);

  if (songData && Array.isArray(songData.translatedLines)) {
    let changesMade = false;
    songData.translatedLines.forEach(line => {
      if (line.T0 === "いつからで") {
        if (line.K0 !== "언제부터고,") {
          line.K0 = "언제부터고,";
          changesMade = true;
          console.log('Modified K0 for T0: "いつからで" to "언제부터고,"');
        }
      } else if (line.T0 === "いつまでなの?") {
        if (line.K0 !== "언제까지인 걸까?") {
          line.K0 = "언제까지인 걸까?";
          changesMade = true;
          console.log('Modified K0 for T0: "いつまでなの?" to "언제까지인 걸까?"');
        }
      }
    });

    if (changesMade) {
      fs.writeFileSync(filePath, JSON.stringify(songData, null, 2), 'utf-8');
      console.log(`Successfully updated ${filePath}`);
    } else {
      console.log(`No changes needed for ${filePath}. K0 values are already as desired.`);
    }
  } else {
    console.error('Error: Could not find translatedLines array in the JSON data.');
  }
} catch (error) {
  console.error('Error processing the file:', error);
} 