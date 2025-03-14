const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path'); // Import the path module for better path handling

let dataBuffer = fs.readFileSync(`./discharge_papers/szd001.pdf`);

pdf(dataBuffer).then(function (data) {

    // ... (your existing console.log statements)

    const outputFilePath = path.join(__dirname, 'output.txt'); // Define output path

    // Create a string with the data you want to write
    const textToWrite = `
Number of pages: ${data.numpages}
Number of rendered pages: ${data.numrender}
PDF Info: ${JSON.stringify(data.info, null, 2)}  // Pretty-print JSON
PDF Metadata: ${JSON.stringify(data.metadata, null, 2)} // Pretty-print JSON
PDF.js Version: ${data.version}
PDF Text: ${data.text}
`;

    let singleRegexSearch = (regexValue) => {
        const searchResult = data.text.match(regexValue)
        return searchResult ? searchResult[1] : 'No match found.'
    }

    let getSpecificSegment = (regexStart, regexEnd) => {

        const multilineRegex = new RegExp(`(?<=(${regexStart.source}))(.*?)(?=(${regexEnd.source}))`, 'sm'); // 's' and 'm' flags
        const multilineMatch = data.text.match(multilineRegex);

        if (multilineMatch) {
            const capturedMultilineText = multilineMatch[2];
            return capturedMultilineText.trim(); // Trim whitespace
        } else {
            return "No match found.";
        }

    }

    const regexPatientName = /Beteg neve\.\.\.:(.*?)(?=KBA\.)/; // Non-greedy matching
    const regexSegmentLabResults = { start: /Vizsgálatok/, end: /Epikrízis/ }


    let patientName = singleRegexSearch(regexPatientName)

    // Find CRP values
    let segmentLab = getSpecificSegment(regexSegmentLabResults.start, regexSegmentLabResults.end)

    function removePrintedByDates(text) {
        const regex = /Nyomtatva:.*?(\d{4}\.\d{2}\.\d{2})/gs; // Regex to find dates after "Nyomtatva:"
        return text.replace(regex, ""); // Replace matches with empty string
      }

    segmentLab = removePrintedByDates(segmentLab)

    const matches2 = Array.from(segmentLab.matchAll(/CRP\s*([\d.]+)\s*mg\/L/g), match => parseFloat(match[1]));

    // Create Date segments
    const crpValues2 = {};
    for (const match of segmentLab.matchAll(/(\d{4}\.\d{2}\.\d{2})\s+[\s\S]*?CRP\s*([\d.]+)\s*mg\/L/g)) {
        const date = match[1];
        const crpValue = parseFloat(match[2]); // Parse to float
    
        crpValues2[date] = crpValues2[date] || []; // Initialize array if date doesn't exist
        crpValues2[date].push(crpValue);
    }
    
    console.log(crpValues2);

    console.log(`Max. CRP: ${Math.max(...Object.values(crpValues2).flat())}`)




    fs.writeFile(outputFilePath, textToWrite, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("Data written to output.txt successfully!");
        }
    });

    fs.appendFile(outputFilePath, segmentLab, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("Data written to output.txt successfully!");
        }
    })
});

module.exports = {
    keyWordSearcher: keyWordSearcher
}