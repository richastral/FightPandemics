const httpStatus = require("http-status");
const APP_URL = process.env.MOCHA_URL;
const apiHelper = require("../utils/apiHelper");
const apiEndPointHelper = require("../utils/apiEndpoints");
const validator = require("../utils/validators");
const testData = require("../utils/testData");
let apiEndPoint = apiEndPointHelper.loginApiEndpoint;
let userCredentialsWithRandomEmailAndRandomPassword =
  testData.userCredentialsWithRandomEmailAndRandomPassword;
let userCredentialsWithRandomEmail = testData.userCredentialsWithRandomEmail;
let userCredentialsWithEmptyEmail = testData.userCredentialsWithEmptyEmail;
let userCredentialsWithInvalidEmailNoDomainSpecified =
  testData.userCredentialsWithInvalidEmailNoDomainSpecified;
let userCredentialsWithEmailLocalExceeding64Characters =
  testData.userCredentialsWithEmailLocalExceeding64Characters;
let userCredentialsWithEmailExceeding254Characters =
  testData.userCredentialsWithEmailExceeding254Characters;

describe("POST Login endpoint tests for user that is NOT signed in", function () {
  describe("401  - unauthorized", function () {
    it("Unauthorized error - when trying to log in without signed in", async function () {
      let response = await apiHelper.sendPOSTRequest(
        APP_URL,
        apiEndPoint,
        userCredentialsWithRandomEmailAndRandomPassword,
      );
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
        "wrongCredentials",
      );
    });
  });

  describe("429 - maximum sign in attempts", function () {
    it("Too Many Requests error - when maximum sign in attempts are exceeded", async function () {
      let response;
      for (var i = 0; i < 11; i++) {
        response = await apiHelper.sendPOSTRequest(
          APP_URL,
          apiEndPoint,
          userCredentialsWithRandomEmail,
        );
      }
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.TOO_MANY_REQUESTS,
        "Too Many Requests",
        "maxSignInAttemptsExceeded",
      );
    });
  });

  describe("Incorrect email data", function () {
    it("Empty email triggers Bad Request error", async function () {
      let response = await apiHelper.sendPOSTRequest(
        APP_URL,
        apiEndPoint,
        userCredentialsWithEmptyEmail,
      );
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.BAD_REQUEST,
        "Bad Request",
        'body.email should match format "email"',
      );
    });

    it("Invalid email syntax triggers Bad Request error", async function () {
      let response = await apiHelper.sendPOSTRequest(
        APP_URL,
        apiEndPoint,
        userCredentialsWithInvalidEmailNoDomainSpecified,
      );
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.BAD_REQUEST,
        "Bad Request",
        'body.email should match format "email"',
      );
    });

    it("Email local part bigger than 64 characters triggers Bad request error", async function () {
      let response = await apiHelper.sendPOSTRequest(
        APP_URL,
        apiEndPoint,
        userCredentialsWithEmailLocalExceeding64Characters,
      );
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.UNAUTHORIZED,
        "Unauthorized",
        "wrongCredentials",
      );
    });

    //following the rules that Auth0 are using the email needs to have 64max for the local part and an overall max of 254 chars
    it("Email domain part bigger than 189 characters. Total bigger than 254 characters triggers Bad request error", async function () {
      let response = await apiHelper.sendPOSTRequest(
        APP_URL,
        apiEndPoint,
        userCredentialsWithEmailExceeding254Characters,
      );
      validator.validateStatusCodeErrorAndMessage(
        response,
        httpStatus.BAD_REQUEST,
        "Bad Request",
        'body.email should match format "email"',
      );
    });
  });
});
