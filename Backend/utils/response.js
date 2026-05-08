exports.ok = (res, message, data = null, code = 200) =>
  res.status(code).json({ status: "success", message, data });

exports.fail = (res, message, code = 400, data = null) =>
  res.status(code).json({ status: "error", message, data });
