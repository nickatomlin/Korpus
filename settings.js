function T2() {
	var a=document.getElementById("show-T2").checked;
	var b = document.getElementsByClassName("T2");
	if (a == true) {
		for (var i=0; i<b.length; i++) {
			b[i].style.display = "flex";
		}
	}
	else {
		for (var i=0; i<b.length; i++) {
			b[i].style.display = "none";
		}
	}
}