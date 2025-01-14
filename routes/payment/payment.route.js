import express from 'express'
import { createOrder, getStatus } from '../../controllers/payment/payment.controller.js';

const router=express.Router()

router.route('/create-order').post(createOrder);
router.route('/status').post(getStatus)

export default router;
