// function T2() {
// 	var a = document.getElementById("show-T2").checked;
// 	var b = document.getElementsByClassName("T2");
// 	if (a == true) {
// 		for (var i=0; i<b.length; i++) {
// 			b[i].style.display = "table-row";
// 		}
// 	}
// 	else {
// 		for (var i=0; i<b.length; i++) {
// 			b[i].style.display = "none";
// 		}
// 	}
// }

// I/P: tier_id, a string like "T1" or "T15"
// O/P: a list of DOM elements with corresponding tier IDs
// Status: tested, working
// function getElementsByTierID(tier_id) {
// 	var tiers = document.querySelectorAll("[data-tier]");
// 	var output = [];
// 	for (var i=0; i<tiers.length; i++) {
// 		var current_tier = tiers[i];
// 		if (current_tier.getAttribute("data-tier") == tier_id) {
// 			output.push(current_tier);
// 		}
// 	}
// 	return output;
// }

// function changeTierVisibility(tier_id) {
// 	var elements = getElementsByTierID(tier_id);
// 	console.log("CALLED");
// 	for (var i=0; i<elements.length; i++) {
// 		if (elements[i].style.display == "none") {
// 			elements[i].style.display = "table-row";
// 		}
// 		else {
// 			elements[i].style.display = "none";
// 		}
// 	}
// // }