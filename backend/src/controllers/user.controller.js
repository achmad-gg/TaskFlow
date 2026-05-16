import * as userService from '../services/user.service.js';
import { getRecentActivity } from '../services/activity.service.js';
import { sendSuccess } from '../utils/response.utils.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.user.id);
    sendSuccess(res, user);
  } catch (err) { next(err); }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  } catch (err) { next(err); }
};

export const changePassword = async (req, res, next) => {
  try {
    await userService.changePassword(req.user.id, req.body);
    sendSuccess(res, null, 'Password changed successfully');
  } catch (err) { next(err); }
};

export const getActivity = async (req, res, next) => {
  try {
    const activity = await getRecentActivity(req.user.id, 20);
    sendSuccess(res, activity);
  } catch (err) { next(err); }
};