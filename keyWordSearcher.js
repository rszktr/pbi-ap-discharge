let cleanUpText = (dataBuffer) => {
    let regexFooter = /e-MedSolution[\s\S]*?(\d{4}\.\d{2}\.\d{2} \d{2}:\d{2})/gm;
    return dataBuffer.text.replace(regexFooter, "");
}


let keyWordSearcher = (cleanText) => {

    let searchResults = []


    // RegExps
    const regexTubeFeeding = / NG| NJ|szond|Szond/gm;
    const regexSolidFeeding = /melléeh|hozzátá|per os| ehet|eszik|etetés|szilárd/gmi;
    const regexCholangitis = /cholang|cholecysti|gyulladás/gmi;
    const regexAntibiotics = /antibio| AB/gmi;
    const regexPeripancreaticFluid = /peripa|\bfolyadék(?:[^pótl][^fogy]\w*)\b/gmi;
    const regexPseudocyst = /pseudo|pszeudo|cyst|ciszt/gmi;
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

    // Function
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

}


module.exports = {
    keyWordSearcher: keyWordSearcher,
    cleanUpText: cleanUpText
}