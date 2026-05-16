import * as adminService from '../services/admin.service.js';
import { sendSuccess, sendPaginated } from '../utils/response.utils.js';

export const getUsers = async (req, res, next) => {
  try {
    const { users, total, page, limit } = await adminService.getAllUsers(req.query);
    sendPaginated(res, users, { total, page, limit });
  } catch (err) { next(err); }
};

export const toggleUser = async (req, res, next) => {
  try {
    const user = await adminService.toggleUserStatus(req.params.id, req.user.id);
    sendSuccess(res, user, `User ${user.isActive ? 'activated' : 'deactivated'}`);
  } catch (err) { next(err); }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const stats = await adminService.getPlatformStats();
    sendSuccess(res, stats);
  } catch (err) { next(err); }
};