(function () {
  let file = "";
  let isFile = false;
  let fileDom = document.querySelector('#file');
  let dataDiv = document.querySelector('#data');
  let checkbox = document.querySelectorAll("[type='checkbox']");
  let formCareer = document.getElementById(`form-career`);

  if (checkbox) {
    checkbox.forEach(function (el) {
      el.value = el.checked;
      el.addEventListener('change', function () {
        el.value = el.checked;
      });
    });
  }


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
        // special case for Edge's html collection
      } else if (elements[k].length > 0) {
        return elements[k].item(0).name;
      }
    }).filter(function (item, pos, self) {
      return self.indexOf(item) == pos && item;
    });
    var formData = {};
    fields.forEach(function (name) {
      var element = elements[name];

      // singular form elements just have one value
      formData[name] = element.value === "" ? undefined : element.value;

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
    formData.formDataNameOrder = JSON.stringify(fields.filter(f => f !== "file"));
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default
    return {data: formData, honeypot: honeypot};
  }

  function handleFormSubmit(event) {
    event.preventDefault();
    var form = event.target;
    var formData = getFormData(form);
    var data = formData.data;
    form.classList.add('submit-started');
    if (formData.honeypot) {
      return false;
    }
    disableAllButtons(form);
    var url = form.action;
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        form.reset();
        form.classList.remove('submit-started');
        form.classList.add('submit-ended');
      }
    };
    var encoded = Object.keys(data).map(function (k) {
      console.log(encodeURIComponent(k));
      console.log(encodeURIComponent(data[k]));
      console.log("--------------------------");
      return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
    }).join('&');
    console.log(encoded);
    xhr.send(encoded);
    disableAllButtons(form);
    disableAllInputs(form);
  }

  function loaded() {
    // bind to the submit event of our form
    var forms = document.querySelectorAll("form.gform");
    for (var i = 0; i < forms.length; i++) {
      forms[i].addEventListener("submit", handleFormSubmit, false);
    }
  };

  document.addEventListener("DOMContentLoaded", loaded, false);

  function disableAllButtons(form) {
    var buttons = form.querySelectorAll("button");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].disabled = true;
    }
  }

  function disableAllInputs(form) {
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
    let filePlaceholder = formCareer.querySelector('.file-name');
    fileDom.parentNode.classList.add('is-file');
    filePlaceholder.innerHTML = fileDom.files[0].name;
  };

  function fileRemove() {
    fileDom.parentNode.classList.remove('is-file');
    fileDom.value = "";
  }

  if (!!formCareer) {
    fileDom.addEventListener("change", function () {
      file = fileDom.files[0];
      var file = this.files[0];
      var fr = new FileReader();
      fr.fileName = file.name;
      fr.onload = function (e) {
        e.target.result;
        let html = '<input type="hidden" name="data" value="' + e.target.result.replace(/^.*,/, '') + '" >';
        html += '<input type="hidden" name="mimetype" value="' + e.target.result.match(/^.*(?=;)/)[0] + '" >';
        html += '<input type="hidden" name="filename" value="' + e.target.fileName + '" >';
        dataDiv.innerHTML = html;
      };
      fr.readAsDataURL(file);
      fileAdd();
    });
    let close = formCareer.querySelector('.close');
    fileDom.addEventListener('click', function (event) {
    }, true);
    close.addEventListener('click', function (event) {
      fileRemove();
      event.preventDefault();
    }, true);
  }
})();