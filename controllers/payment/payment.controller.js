import axios from 'axios'
import crypto from 'crypto'
import { request } from 'http';
import { type } from 'os';
import { v4 as uuidv4 } from 'uuid';

const MERCHANT_KEY="618fa17f-c54c-4aff-9f5b-8e10b3e835f2";
const MERCHANT_ID="M22SBE31INURY";
const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";
const prod_status_URL = "https://api.phonepe.com/apis/hermes/pg/v1/status";
const redirectUrl = "https://aws.education.blackgrapesgroup.com/api/v1/payment/status";
const successUrl = "https://education.blackgrapesgroup.com/payment-success";
const failureUrl = "https://education.blackgrapesgroup.com/payment-failure";

export const  createOrder=async(req,res)=>{
      const{name,mobileNumber,amount}=req.body
      const orderId=uuidv4();

      const paymentPayload={
        merchantId:MERCHANT_ID,
        merchantUserId:name,
        mobileNumber:mobileNumber,
        amount:amount*100,
        merchantTransactionId:orderId,
        redirectUrl:`${redirectUrl}/?id=${orderId}`,
        redirectMode:'POST',
        paymentInstrument:{
            type:'PAY_PAGE'
        }
      }

      const payload=Buffer.from(JSON.stringify(paymentPayload).toString('base64'));
      const keyIndex=1;
      const string=payload + 'pg/v1/pay'+MERCHANT_KEY;
      const sha256=crypto.createHash('sha256').update(string).digest('hex');
      const checksum=sha256 + '###' +keyIndex;

      const option ={
        method:'POST',
        url:prod_URL,
        headers:{
            accept:'application/json',
            "Content-Type":"application/json",
            "X-VERIFY":checksum
        },
        data:{
            request:payload
        }
      }

      try {
        const response=await axios.request(option);
        console.log(response.data.data.instrumentResponse.redirectInfo.url);
        res.status(200).json({msg:"OK",url:response.data.data.instrumentResponse.redirectInfo.url});
        
      } catch (error) {
        console.log("Error in payment", error);
        res.status(500).json({ error: 'Failed to initiate payment' });
      }
}

export const getStatus=async(req,res)=>{

    const merchantTransactionId=req.query.id

    const keyIndex=1;
    const string=`pg/v1/status/${MERCHANT_ID}/${merchantTransactionId}`+MERCHANT_KEY;
    const sha256=crypto.createHash('sha256').update(string).digest('hex')
    const checksum=sha256+"###"+keyIndex;

    const option={
        method:"GET",
        url:`${prod_status_URL}/${MERCHANT_ID}/${merchantTransactionId}`,
        headers:{
            accept:"application/json",
            "Content-Type":"application/json",
            "X-VERIFY":checksum,
            "X-MERCHANT-ID":MERCHANT_ID
        }
    }

    try {
        const response=await axios.request(option);
        if (response.data.success === true) {
            return res.redirect(successUrl);
          } else {
            return res.redirect(failureUrl);
          }
        
    } catch (error) {
        console.error("errro in status check:",error)
        res.status(500).json({error: 'Failed to check payment status'})
    }
}