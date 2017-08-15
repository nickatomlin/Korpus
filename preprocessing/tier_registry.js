class tierRegistry {

    static isIgnored(type) {
        // Omit these tier types from the website, as they're ugly and mostly useless.
        // variantTypes indicates when a morpheme is a spelling variant, free variant, etc.
        // hn, "homophone number", indicates which of multiple look-alike morphemes it is.
        return (
            type === "variantTypes" ||
            type === "hn" ||
            type === "glsAppend" ||
            type === "msa"
        );
    }

    static decodeType(type) {
        /*
        // English UI text:
          switch(type) {
              case "txt": return "morpheme (text)";
              case "cf": return "morpheme (citation form)";
              case "gls": return "morpheme gloss"
              case "msa": return "part of speech";
          default: return type;
          }
        */

        // Spanish UI text:
        switch(type) {
            case "txt": return "Morfema (texto)";
            case "cf": return "Morfema (forma típico)";
            case "gls": return "Glosa de morfema";
            case "msa": return "Parte del habla";
            case "words": return "Palabra";
            case "free": return "Frase";
            default: return type;
        }
    }

    constructor(tierIDs, jsonTierIDs, isoDict) {
        this.tierIDs = tierIDs;
        this.jsonTierIDs = jsonTierIDs;
        this.nextTierIDnum = 1;
        this.isoDict = isoDict;
    }

    decodeLang(lang) {

        const desiredName = "Native name"; // or we might want to use "ISO language name"
        const lcLang = lang.toLowerCase(); // ignore capitalization when decoding

        // Override the usual iso-based decoding for some language codes
        switch(lang) {
            // case "flex-language-name-here": return "desired-decoded-name-here";
            case "con-Latn-EC": return "A'ingae";
            case "defaultLang": return "defaultLang";

            // for Spanish UI text:
            case "en": return "Inglés";

            default: // fall through
        }

        // if lang is an iso code, decode it
        if (this.isoDict.hasOwnProperty(lcLang)) {
            return this.isoDict[lcLang][desiredName];
        }

        // if lang starts with a (three-letter or two-letter) iso code, decode it
        const firstThreeLetters = lcLang.substr(0, 3);
        if (this.isoDict.hasOwnProperty(firstThreeLetters)) {
            return this.isoDict[firstThreeLetters][desiredName];
        }
        const firstTwoLetters = lcLang.substr(0, 2);
        if (this.isoDict.hasOwnProperty(firstTwoLetters)) {
            return this.isoDict[firstTwoLetters][desiredName];
        }

        // as a last resort, return without decoding
        return lang;
    }

    getTierName(lang, type) {
        /*
        // English UI text:
          return decodeLang(lang) + " " + decodeType(type);
        */

        // Spanish UI text:
        return tierRegistry.decodeType(type) + " " + this.decodeLang(lang).toLowerCase();
    }

    // if this is a new, non-ignored tier, register its ID and include it in metadata
    // if the tier is ignored, return null; else return its ID
    // used global vars: tierIDs, jsonOut.metadata["tier IDs"], nextTierIDnum
    maybeRegisterTier(lang, type) {
        if (tierRegistry.isIgnored(type)) {
            return null;
        }
        if (!this.tierIDs.hasOwnProperty(lang)) {
            this.tierIDs[lang] = {};
        }
        if (!this.tierIDs[lang].hasOwnProperty(type)) {
            const tierID = "T" + (this.nextTierIDnum++).toString();
            this.tierIDs[lang][type] = tierID;
            this.jsonTierIDs[tierID] = this.getTierName(lang, type);
        }
        return this.tierIDs[lang][type];
    }
}

module.exports = {
    tierRegistry: tierRegistry
};
