// MIT License
// Copyright (c) 2020 Luis Espino

function reflex_agent(location, state) {
	if (state == "DIRTY") return "CLEAN";
	else if (location == "A") return "RIGHT";
	else if (location == "B") return "LEFT";
}

function test(states) {
	var location = states[0];
	var state = states[0] == "A" ? states[1] : states[2];
	var action_result = reflex_agent(location, state);
	document.getElementById("log").innerHTML += "<br>Location: ".concat(location).concat(" | Action: ").concat(action_result);
	if (action_result == "CLEAN") {
		if (location == "A") states[1] = "CLEAN";
		else if (location == "B") states[2] = "CLEAN";
	}
	else if (action_result == "RIGHT") states[0] = "B";
	else if (action_result == "LEFT") states[0] = "A";
	setTimeout(function () { test(states); }, 2000);
}

var states = ["A", "DIRTY", "DIRTY"];

window.setInterval(dirtthings, Math.floor(Math.random() * 15000) + 8000);

function dirtthings() {
	states[1] = Math.round(Math.random() * 1) == 0 ? "CLEAN" : "DIRTY";
	states[2] = Math.round(Math.random() * 1) == 0 ? "CLEAN" : "DIRTY";
	console.log("Working "+ states[1]+" "+states[2]);
}

test(states);
