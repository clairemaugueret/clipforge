function checkBody(body, fields) {
  return fields.every((eachField) => body[eachField]);
}

module.exports = { checkBody };
//NB: checkBody strict qui n'accepte pas 0 ou false comme valeurs valides
