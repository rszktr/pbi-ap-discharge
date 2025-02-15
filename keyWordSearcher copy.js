const fs = require('fs');
const pdf = require('pdf-parse');
const path = require('path'); // Import the path module for better path handling

let dataBuffer = fs.readFileSync(`./discharge_papers/2706d6ad-48a4-4fac-9628-a7e8942aa218.pdf`);

pdf(dataBuffer).then(function (data) {
    const outputFilePath = path.join(__dirname, 'output.txt'); // Define output path

    let searchResults = []

    //Clean text
    let regexFooter = /e-MedSolution[\s\S]*?(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/gm;
    let cleanText = data.text.replace(regexFooter, "");


    // RegExps
    const regexTubeFeeding = / NG| NJ|szond|Szond/gm;
    const regexSolidFeeding = /melléeh|hozzátá|per os| ehet|eszik|etetés|szilárd/gm;
    const regexCholangitis = /cholang|cholecysti|gyulladás/gmi;
    const regexAntibiotics = /antibio| AB/gmi;
    const regexPeripancreaticFluid = /peripa|\bfolyadék(?:[^pótl][^fogy]\w*)\b/gmi;
    const regexPseudocyst = /pseudo|pszeudo|cysta|ciszta/gmi;
    const regexNecrosis = /necr|nekr/gmi;
    const regexWon = /won|walled|waled/gmi;
    const regexRespFailure = /léleg|légz|o2|oxigén|oxigen|elégtelen/gmi;
    const regexCirculatoryFailure = /kering|adren|elégtelen/gmi;
    const regexAspiration = /aspir|félrenyel|félre nyel/gmi;
    const regexDelirium = /delir|delí|pszichoti/gmi;
    const regexLC = / lc|cholecyste|epehólyag elt|epehólyag-elt|epehólyageltá/gmi;

    const regexArray = [
        { name: "Szondatáplálás", regex: regexTubeFeeding },
        { name: "Melléetetés", regex: regexSolidFeeding },
        { name: "Cholangitis, cholecystitis", regex: regexCholangitis },
        { name: "Antibiotikum", regex: regexAntibiotics },
        { name: "Peripankreatikus folyadék", regex: regexPeripancreaticFluid },
        { name: "Pszeudociszta", regex: regexPseudocyst },
        { name: "Nekrózis", regex: regexNecrosis },
        { name: "WON", regex: regexWon },
        { name: "Légzési elégtelenség", regex: regexRespFailure },
        { name: "Keringési elégtelenség", regex: regexCirculatoryFailure },
        { name: "Aspiráció", regex: regexAspiration },
        { name: "Delírium", regex: regexDelirium },
        { name: "Cholecystectomia, LC", regex: regexLC },
    ]

    // Functiom
    function findMatchInContext(text, regex) {
        const matches = [];
        let match;

        while ((match = regex.exec(text)) !== null) {
            const matchStart = match.index;
            const matchEnd = matchStart + match[0].length;

            const contextStart = Math.max(0, matchStart - 50);
            const contextEnd = Math.min(text.length, matchEnd + 50)

            let context = text.substring(contextStart, contextEnd);

            context = context.replace(/\r?\n/g, " "); // Replace newlines with spaces

            // Add "..."
            if (contextStart > 0) {
                context = "..." + context;
            }
            if (contextEnd < text.length) {
                context = context + "...";
            }

            matches.push(context);
        }

        return matches;
    }

    // Operation
    regexArray.forEach(item => {
        const contexts = findMatchInContext(cleanText, item.regex);
        
        resultObject = {
            name: item.name,
            regex: item.regex.source,
            results: contexts
        }

        searchResults.push(resultObject)

        console.log(`${item.name}:`)
        contexts.length > 0 ? console.log(contexts) : console.log("No match")
    })

    console.log(searchResults)

// 
    const textToWrite = `
    Number of pages: ${data.numpages}
${ JSON.stringify(searchResults, null, 2)}; // 2 spaces for indentation


    PDF Text: ${cleanText}
        `;

    fs.writeFile(outputFilePath, textToWrite, (err) => {
        if (err) {
            console.error("Error writing to file:", err);
        } else {
            console.log("Data written to output.txt successfully!");
        }
    });
});