const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, userService, tokenService } = require('../services');

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const refreshTokens = catchAsync(async (req, res) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

const startSession = catchAsync(async (req, res) => {
  const { token: idenaAuthToken, address } = req.body;
  const nonce = await authService.startSession(idenaAuthToken, address);
  res.send({ success: true, data: { nonce } });
});

const authenticate = catchAsync(async (req, res) => {
  const { token: idenaAuthToken, signature } = req.body;
  const { userAddress, nonce } = await authService.getIdenaAuthDoc(idenaAuthToken);
  const authenticated = authService.verifyAuthenticated(nonce, userAddress, signature);
  await authService.updateIdenaAuthDoc(idenaAuthToken, authenticated);
  res.send({ success: true, data: { authenticated } });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  startSession,
  authenticate,
};
