import { ok } from '../utils/errors.js';
import { createCashier, listCashiers, updateCashier } from '../services/user.service.js';

export async function postCreateCashier(req, res, next) {
  try {
    const { username, password, displayName } = req.body || {};
    const user = await createCashier({ username, password, displayName });
    res.status(201).json(ok({ user }));
  } catch (err) {
    next(err);
  }
}

export async function getCashiers(req, res, next) {
  try {
    const users = await listCashiers();
    res.status(200).json(ok({ users }));
  } catch (err) {
    next(err);
  }
}

export async function patchCashier(req, res, next) {
  try {
    const user = await updateCashier(req.params.id, req.body || {});
    res.status(200).json(ok({ user }));
  } catch (err) {
    next(err);
  }
}