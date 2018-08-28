/* functions for accessing data within ELAN's .pfsx format (except parsed to JSON).
The functions return reasonable results even when the parse of the .pfsx file is null,
to allow for use even if the pfsx file is missing from data/elan_files
or even if the pfsx file failed to parse. */

function getPrefList(listName, jsonData) {
  if (jsonData == null || jsonData['preferences'] == null || jsonData['preferences']['prefList'] == null) {
    // jsonData==null or jsonData['preferences']==null means there wasn't a valid pfsx file.
    // jsonData['preferences']['prefList']==null means there are e.g. tier color preferences, 
    //     but all the list-type preferences are still set to the defaults.
    
    return [];
  }
  let prefLists = jsonData['preferences']['prefList'];
  for (let prefList of prefLists) {
    if (prefList['$'] == null) {
      // this shouldn't happen, but just skip this prefList and move to the next one 
      continue;
    }
    if (prefList['$']['key'] == listName) {
      
      return prefList['String'] || []; // assume all prefLists are lists of strings
    }
  }
  
  return [];
}

function getTierOrder(jsonData) {
  return getPrefList('MultiTierViewer.TierOrder', jsonData);
}

function getHiddenTiers(jsonData) {
  return getPrefList('MultiTierViewer.HiddenTiers', jsonData) || [];
}

module.exports = {
  getTierOrder : getTierOrder,
  getHiddenTiers : getHiddenTiers,
}