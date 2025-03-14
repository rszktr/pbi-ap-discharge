// Modules
const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path');

// Local modules
const keyWordSearcher = require("./keyWordSearcher")

// Variables
let fileName = 'szd001'
let pathString = `./discharge_papers/${fileName}.pdf`

// Scan pdf
let dataBuffer = fs.readFileSync(pathString);

// Create txt file, run functions, write to txt file
pdf(dataBuffer).then(function (data) {

    let cleanText = keyWordSearcher.cleanUpText(data)
    keyWordSearcher.keyWordSearcher(cleanText)

    // Define output path
    const outputFilePath = path.join(__dirname, `${fileName}.txt`);

    // Create a string with the data you want to write
    const textToWrite = `
Number of pages: ${data.numpages}
Number of rendered pages: ${data.numrender}
PDF Text: ${data.text}
`;

    // Write string to txt file
    fs.writeFile(outputFilePath, textToWrite, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("Data written to output.txt successfully!");
        }
    });

    // fs.appendFile(outputFilePath, segmentLab, (err) => {
    //     if (err) {
    //         console.error("Error writing to file:", err);
    //     } else {
    //         console.log("Data written to output.txt successfully!");
    //     }
    // })

})


