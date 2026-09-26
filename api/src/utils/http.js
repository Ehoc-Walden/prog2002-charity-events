'use strict';

class HttpError extends Error {
  constructor(status, message, details = null) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.details = details;
  }
}

function asyncHandler(handler) {
  return function wrappedHandler(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

module.exports = { HttpError, asyncHandler };
