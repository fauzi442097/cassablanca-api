class ResponseError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = message;
  }
}

module.exports = ResponseError;
