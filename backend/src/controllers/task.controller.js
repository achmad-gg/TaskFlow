import * as taskService from '../services/task.service.js';
import {
  sendSuccess,
  sendPaginated,
} from '../utils/response.utils.js';

export const getTasks = async (req, res, next) => {
  try {
    const { tasks, total, page, limit } = await taskService.getTasks(
      req.user.id,
      req.validatedQuery || req.query
    );
    sendPaginated(res, tasks, { total, page, limit });
  } catch (err) {
    next(err);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id, req.user.id);
    sendSuccess(res, task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.user.id, req.body);
    sendSuccess(res, task, 'Task created', 201);
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.user.id,
      req.body
    );
    sendSuccess(res, task, 'Task updated');
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id, req.user.id);
    sendSuccess(res, null, 'Task deleted');
  } catch (err) {
    next(err);
  }
};

export const getStats = async (req, res, next) => {
  try {
    const stats = await taskService.getTaskStats(req.user.id);
    sendSuccess(res, stats);
  } catch (err) {
    next(err);
  }
};