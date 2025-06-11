#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const glob = require('glob');

// Helper function to parse a "key=value" string, handling quoted values.
function parseKeyValue(str) {
  const match = str.match(/^(.*?)=((["']).*?\3|[^"'].*)$/);
  if (!match) throw new Error(`Invalid format: ${str}. Expected key=value.`);
  const key = match[1].trim();
  let value = match[2].trim();
  // Strip quotes from value
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.substring(1, value.length - 1);
  }
  return { key, value };
}

// Helper function to get a nested property from an object
function getProperty(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Helper function to set a nested property in an object
function setProperty(obj, path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const target = parts.reduce((acc, part) => acc[part] = acc[part] || {}, obj);
    target[last] = value;
}

yargs(hideBin(process.argv))
  .command('find <files...>', 'Find files and display their content or specific fields', (yargs) => {
    return yargs
      .positional('files', {
        describe: 'Glob patterns for files to search',
        type: 'string',
      })
      .option('where', {
        alias: 'w',
        type: 'string',
        description: 'A condition to filter lines/items. E.g., \'T0=="some text"\'',
      })
      .option('select', {
        alias: 's',
        type: 'string',
        description: 'Comma-separated fields to display. E.g., \'T0,K0\'',
      });
  }, (argv) => {
    const filePatterns = argv.files;
    const allFiles = filePatterns.flatMap(pattern => glob.sync(pattern));
    const uniqueFiles = [...new Set(allFiles)];

    console.log(`Found ${uniqueFiles.length} files to process...`);
    let totalMatches = 0;

    uniqueFiles.forEach(filePath => {
      try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
        let matches = [];

        const whereEvaluator = argv.where ? new Function('item', `with(item) { return ${argv.where}; }`) : () => true;

        if (data && Array.isArray(data.translatedLines)) {
          data.translatedLines.forEach(line => {
            // Check top-level fields
            if (whereEvaluator({ ...line })) {
                matches.push({ ...line });
            }

            // Check nested LI items
            if (line.LI && Array.isArray(line.LI)) {
              line.LI.forEach(item => {
                if (whereEvaluator({ ...line, ...item })) {
                  matches.push({ ...line, ...item });
                }
              });
            }
          });
        }

        if (matches.length > 0) {
          console.log(`\n--- Matches in ${path.basename(filePath)} (${matches.length}) ---`);
          totalMatches += matches.length;
          
          matches.forEach(match => {
            if (argv.select) {
              const selectedFields = {};
              argv.select.split(',').forEach(field => {
                selectedFields[field] = getProperty(match, field);
              });
              console.log(selectedFields);
            } else {
              console.log(match);
            }
          });
        }
      } catch (error) {
        console.error(`\nError processing file ${filePath}:`, error);
      }
    });

    console.log(`\n--- Total matches found: ${totalMatches} ---`);
  })
  .command('update <files...>', 'Update fields in JSON files', (yargs) => {
    return yargs
      .positional('files', {
        describe: 'Glob patterns for files to update',
        type: 'string',
      })
      .option('where', {
        alias: 'w',
        type: 'string',
        description: 'A condition to filter which items to update. E.g., \'T1=="ain\\\'t"\'',
        required: true,
      })
      .option('set', {
        type: 'string',
        description: 'Set a field to a new value. E.g., \'K0="New translation"\'',
      })
      .option('replace', {
        type: 'string',
        description: 'Replace content in fields using regex. E.g., \'R0,R1:/old/new/g\'',
      })
      .option('dry-run', {
        type: 'boolean',
        description: 'Show what would be changed without actually modifying files',
        default: false,
      })
      .conflicts('set', 'replace');
  }, (argv) => {
    const filePatterns = argv.files;
    const allFiles = filePatterns.flatMap(pattern => glob.sync(pattern));
    const uniqueFiles = [...new Set(allFiles)];

    console.log(`Found ${uniqueFiles.length} files to process...`);

    uniqueFiles.forEach(filePath => {
      try {
        const rawData = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(rawData);
        let changesMade = 0;
        let logMessages = [];

        if (data && Array.isArray(data.translatedLines)) {
          data.translatedLines.forEach(line => {
            // Check top-level fields
            const lineContext = { ...line };
            const whereEvaluator = new Function('item', `with(item) { return ${argv.where}; }`);

            if (whereEvaluator(lineContext)) {
                // Apply changes to the line itself
                // (Implementation for top-level updates can be added here if needed)
            }

            // Check nested LI items
            if (line.LI && Array.isArray(line.LI)) {
              line.LI.forEach(item => {
                const itemContext = { ...line, ...item }; // Merge line and item for context
                if (whereEvaluator(itemContext)) {
                    const originalItem = JSON.stringify(item);
                    let changed = false;

                    if (argv.set) {
                        const { key, value } = parseKeyValue(argv.set);
                        setProperty(item, key, value);
                        changed = true;
                    } else if (argv.replace) {
                        const [fields, pattern, replacement, flags] = argv.replace.match(/^([^:]+):((?:\\.|[^/])+)\/((?:\\.|[^/])*)\/([gimsuy]*)$/).slice(1);
                        const regex = new RegExp(pattern, flags);
                        fields.split(',').forEach(field => {
                            const originalValue = getProperty(item, field);
                            if (typeof originalValue === 'string' && regex.test(originalValue)) {
                                setProperty(item, field, originalValue.replace(regex, replacement));
                                changed = true;
                            }
                        });
                    }
                    
                    if (changed) {
                        changesMade++;
                        logMessages.push(`- In T0: "${line.T0}", T1: "${item.T1}"`);
                        logMessages.push(`  Old: ${originalItem}`);
                        logMessages.push(`  New: ${JSON.stringify(item)}`);
                    }
                }
              });
            }
          });
        }

        if (changesMade > 0) {
          console.log(`\n[${path.basename(filePath)}] ${changesMade} changes to be applied:`);
          logMessages.forEach(log => console.log(log));
          if (!argv.dryRun) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`\nSuccessfully updated ${filePath}.`);
          } else {
            console.log(`\n(Dry Run) ${filePath} was not modified.`);
          }
        } else {
          console.log(`[${path.basename(filePath)}] No items matched the criteria.`);
        }
      } catch (error) {
        console.error(`\nError processing file ${filePath}:`, error);
      }
    });
  })
  .example(
    'node $0 find "songs/deep_*.json" --where \'T0.includes("love")\' --select T0,K0',
    'Find lines containing "love" in T0 and show their T0 and K0 fields.'
  )
  .example(
    'node $0 update "songs/deep_*.json" --where \'R0=="다이조부"\' --set \'R0="다이죠오부"\'',
    'Update R0 from "다이조부" to "다이죠오부".'
  )
  .example(
    'node $0 update "songs/deep_*.json" --where \'R1.includes("아이마쇼오")\' --replace "R1:/아이마쇼오/아이 마쇼오/g" --dry-run',
    'Preview replacing "아이마쇼오" with "아이 마쇼오" in the R1 field.'
  )
  .demandCommand(1, 'You need at least one command before moving on')
  .help()
  .alias('h', 'help')
  .strict()
  .argv; 