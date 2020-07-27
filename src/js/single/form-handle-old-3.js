(function () {
  let file = "";
  let isFile = false;
  let fileDom = document.querySelector('#file');
  let formCareer = document.getElementById(`form-career`);
  let formData = {};

  // get all data in form and return object
  async function getFormData(form) {
    self = this;
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
    fields.forEach(function (name) {
      var element = elements[name];
      if (elements[name].getAttribute("type") === "checkbox") {
        formData[name] = elements[name].checked;
      } else if (name === file) {
        delete formData.file;
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
    formData.formDataNameOrder = JSON.stringify(fields.filter(f => f !== "file"));
    if (getIsFile()) {
      console.log(fileDom);
      console.log('getFile()', getFile());
      file = getFile();
      let result = await processFile(file);
      formData.formFile = await result;
    }
    formData.formGoogleSheetName = form.dataset.sheet || "responses"; // default sheet name
    formData.formGoogleSendEmail = form.dataset.email || ""; // no email by default
    return {data: formData, honeypot: honeypot};
  }

  async function handleFormSubmit(event) {
    event.preventDefault();           // we are submitting via xhr below
    var form = event.target;
    var formData = await getFormData(form);
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
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4 && xhr.status === 200) {
        form.reset();
        form.classList.remove('submit-started');
        form.classList.add('submit-ended');
      }
    };
    // url encode form data for sending as post data
    var encoded = Object.keys(data).map(function (k) {
      if (encodeURIComponent(k) !== "file") {
        console.log(encodeURIComponent(k));
        console.log(encodeURIComponent(data[k]));
        console.log("--------------------------");
        return encodeURIComponent(k) + "=" + encodeURIComponent(data[k]);
      }
    }).join('&');
    console.log(encoded)
    // xhr.send(encoded);
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

  function getFile() {
    return getIsFile() ? fileDom.files[0] : "";
  };

  function getIsFile() {
    return fileDom.value === "" ? false : true;
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

  // async function readFile(file) {
  //   try {
  //     const newf = new Promise((resolve, reject) => {
  //       let reader = new FileReader();
  //       reader.readAsBinaryString(file);
  //       reader.onload = () => {
  //         resolve(["data:" + file.type + ";base64," + btoa(reader.result)]);
  //         console.log(["data:" + file.type + ";base64," + btoa(reader.result)]);
  //       };
  //       reader.onerror = reject;
  //     });
  //   }
  //
  //   try {
  //     let reader = new FileReader();
  //     reader.readAsBinaryString(file);
  //     reader.onload = () => {
  //       newfile = await;
  //       "data:" + file.type + ";base64," + btoa(reader.result);
  //       console.log(["data:" + file.type + ";base64," + btoa(reader.result)]);
  //     };
  //     const newfile = await fetch(url);
  //     console.log(await response.text());
  //   } catch (err) {
  //     console.log('fetch failed', err);
  //   }
  // }

  function readFileAsync(file) {
    return new Promise((resolve, reject) => {
      let reader = new FileReader();

      reader.onload = () => {
        resolve(reader.result);
      };

      reader.onerror = reject;

      reader.readAsDataURL(file);
    });
  }

  async function processFile(file) {
    try {
      let contentBuffer = await readFileAsync(file);
      return contentBuffer;
    } catch (err) {
      console.log(err);
    }
  }

  document.addEventListener("DOMContentLoaded", loaded, false);

  if (!!formCareer) {
    fileDom.addEventListener("change", function () {
      isFile = fileDom.hasOwnProperty('files');
      let isFirstIteration = true;
      if (isFirstIteration) {
        fileAdd();
        file = fileDom.files[0];
        isFirstIteration = false;
      } else if (!isFile) {
        fileAdd();
      }
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