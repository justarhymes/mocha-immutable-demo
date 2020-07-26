const Immutable = require("immutable");

function flattenErrors(errors) {
  return errors
    .toSet()
    .flatten()
    .map(error => error + ".")
    .join(" ");
}

function nestedErrors(errors) {
  return errors.map(error => {
    if (Immutable.Map.isMap(error)) {
      return nestedErrors(error);
    } else {
      return flattenErrors(error);
    }
  });
}

function transformErrors(errors, ...fields) {
  return errors.map((error, field) => {
    if (fields.includes(field)) {
      return nestedErrors(error);
    } else {
      return flattenErrors(error);
    }
  });
}

module.exports = transformErrors;
