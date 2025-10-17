'use strict';

function successResponse(res, data, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
  });
}

function errorResponse(res, errorCode, message, statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code: errorCode,
      message,
      details,
    },
  });
}

module.exports = {
  successResponse,
  errorResponse,
};