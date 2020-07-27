(function () {
  let file = "";
  let isFile = false;
  let dataReaded = "";
  let fileDom = document.querySelector('#file');
  let formCareer = document.getElementById(`form-career`);
  let formData = {};

  // get all data in form and return object
  function getFormData(form) {
    console.log("getFormData");
    var elements = form.elements;
    var honeypot;
    isFile = fileDom.hasOwnProperty('files');
    if (isFile) {
      file = fileDom.files[0];
    }
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
    fields.forEach(function (name) {
      var element = elements[name];
      if (elements[name].getAttribute("type") === "checkbox") {
        formData[name] = elements[name].checked;
      } else if (isFile) {
        formData[name] = "aaaaa";
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

  function handleFormSubmit(event) {
    console.log("handleFormSubmit");// handles form submit without any jquery
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
    console.log('ENCODED', data);
    console.log('DATA', encoded);
    xhr.send(encoded);
    disableAllButtons(form);
    disableAllInputs(form);
  }

  function loaded() {
    console.log("loaded");
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  }

  function disableAllButtons(form) {
    console.log("disableAllButtons");
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function disableAllInputs(form) {
    console.log("disableAllInputs");
    let checkbox = form.querySelector(".accept-1");
    let inputs = form.querySelectorAll("input, select, textarea");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].disabled = true;
    }
    if (checkbox) {
      checkbox.checked = false;
    }

    if (isFile) {
      fileRemove();
    }
  }

  function fileAdd() {
    console.log("fileAdd");
    let filePlaceholder = formCareer.querySelector('.file-name');
    fileDom.parentNode.classList.add('is-file');
    filePlaceholder.innerHTML = fileDom.files[0].name;
  };

  function fileRemove() {
    console.log("fileRemove");
    fileDom.parentNode.classList.remove('is-file');
    fileDom.value = "";
  }

  async function processFile(file) {
    try {
      dataReaded = await new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => {
          resolve(reader.result);
          console.log(reader.result);
        };
        reader.onerror = reject;
      });
    } catch (err) {
      console.log('fetch failed', err);
    }
  }

  fileDom.addEventListener("change", function () {
    let i = true;
    if (i) {
      fileAdd();
      processFile(file).then((res) => console.log(res));
      i = false;
    } else if (!document.getElementById(`form-career`).files) {
      fileAdd();
    }
  });
  document.addEventListener("DOMContentLoaded", loaded, false);
  if (!!formCareer) {
    let close = formCareer.querySelector('.close');
    fileDom.addEventListener('click', function (event) {
    }, true);
    close.addEventListener('click', function (event) {
      fileRemove();
      event.preventDefault();
    }, true);
  }
})();