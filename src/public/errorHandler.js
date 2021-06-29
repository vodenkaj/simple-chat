const form = document.querySelector(".login");

form.onsubmit = (e) => {
	e.preventDefault();
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "/login");
	xhr.onload = e => {
		if (xhr.status == 200)
			window.location.href = e.target.response;
		else
			alert(e.target.response);
	};
	xhr.send(`username=${form.getElementsByTagName("input")[0].value}`);
};
