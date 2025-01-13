import express from 'express'
import { createOrder, getStatus } from '../../controllers/payment/payment.controller';
const router=express.Router()

router.route('/create-router').post(createOrder);
router.route('/status').post(getStatus)

export default router;
