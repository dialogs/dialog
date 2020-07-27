(function () {
  let file;

  // get all data in form and return object
  function getFormData(form) {
    var elements = form.elements;
    var honeypot;

    var fields = Object.keys(elements).filter(function (k) {
      if (elements[k].name === "honeypot") {
        honeypot = elements[k].value;
        return false;
      }
      return true;
    }).map(function (k) {
      if (elements[k].name !== undefined) {
        return elements[k].name;
      } else if (elements[k].length > 0) {
        return elements[k].item(0).name;
      }
    }).filter(function (item, pos, self) {
      return self.indexOf(item) === pos && item;
    });

    let formData = {};
    fields.forEach(function (name) {
      var element = elements[name];
      if (elements[name].getAttribute("type") === "checkbox") {
        formData[name] = elements[name].checked;
      } else if (!elements[name].value) {
        formData[name] = undefined;
      } else {
        formData[name] = element.value;
      }
      // when our element has multiple items, get their values
      if (element.length) {
        var data = [];
        for (var i = 0; i < element.length; i++) {
          var item = element.item(i);
          if (item.checked || item.selected) {
            data.push(item.value);
          }
        }
        formData[name] = data.join(', ');
      }
    });
    formData.formDataNameOrder = JSON.stringify(fields);
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default


    return {data: formData, honeypot: honeypot};
  }

  let formCareer = document.getElementById(`form-career`);

  function fileRemove() {
    let fileInput = formCareer.querySelector('[name="file"]');
    fileInput.value = '';
    fileInput.parentNode.classList.remove('is-file');
  }

  function readerStart(formData, file) {
    const reader = new FileReader();
    file = file.files[0];
    reader.readAsBinaryString(file);
    reader.onload = function () {
      formData["file"] = "data:" + file.type + ";base64," + btoa(reader.result);
      return function (e) {
        console.log(file);
        console.log(e.target.result);
      };
    };
    console.log(formData["file"]);
  }

  function handleFormSubmit(event) {  // handles form submit without any jquery
    event.preventDefault();           // we are submitting via xhr below
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;
    form.classList.add('submit-started');
    // If a honeypot field is filled, assume it was done so by a spam bot.
    if (formData.honeypot) {
      return false;
    }

    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        form.reset();
        form.classList.remove('submit-started');
        form.classList.add('submit-ended');
      }
    };
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function (k) {
      return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');

    xhr.send(encoded);
    disableAllButtons(form);
    disableAllInputs(form);
  }

  function loaded() {
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  }

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function disableAllInputs(form) {
    let checkbox = form.querySelector(".accept-1");
    let inputs = form.querySelectorAll("input, select");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    if (checkbox) {
      checkbox.checked = false;
    }
    if (file) {
      fileRemove();
    }
  }

  document.addEventListener("DOMContentLoaded", loaded, false);

  if (formCareer) {
    let close = formCareer.querySelector('.close');
    close.addEventListener('click', function (e) {
      fileRemove();
      e.preventDefault();
    }, true);
  }
})();