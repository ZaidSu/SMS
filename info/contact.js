(function () {
  "use strict";
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("contact-status");
  var submit = document.getElementById("contact-submit");
  var key = "smsContactRequests";

  function escText(value) { return String(value || "").trim(); }
  function show(message, ok) {
    status.style.display = "block";
    status.style.background = ok ? "#ecfdf5" : "#fef2f2";
    status.style.color = ok ? "#166534" : "#991b1b";
    status.style.border = "1px solid " + (ok ? "#bbf7d0" : "#fecaca");
    status.textContent = message;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var firstName = escText(document.getElementById("contact-first").value);
    var lastName = escText(document.getElementById("contact-last").value);
    var school = escText(document.getElementById("contact-school").value);
    var email = escText(document.getElementById("contact-email").value);
    var phone = escText(document.getElementById("contact-phone").value);
    var interest = document.getElementById("contact-interest").value;
    var message = escText(document.getElementById("contact-message").value);

    if (!firstName || !lastName || !school || !email) {
      show("Please complete your name, school, and email.", false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      show("Please enter a valid email address.", false);
      return;
    }

    var request = {
      id: "REQ-" + Date.now().toString(36).toUpperCase(),
      firstName: firstName,
      lastName: lastName,
      school: school,
      email: email,
      phone: phone,
      interest: interest,
      message: message,
      status: "New",
      createdAt: new Date().toISOString()
    };

    try {
      var existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.unshift(request);
      localStorage.setItem(key, JSON.stringify(existing.slice(0, 100)));
    } catch (error) {
      show("Your browser blocked local demo storage. Please enable site storage and try again.", false);
      return;
    }

    submit.innerHTML = '<i class="fa-solid fa-check"></i> Request Saved';
    submit.disabled = true;
    show("Thanks — this demo request was saved successfully in the browser. Email delivery will be connected during the Supabase backend phase.", true);
    form.reset();
    setTimeout(function () {
      submit.disabled = false;
      submit.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
    }, 1800);
  });
})();
