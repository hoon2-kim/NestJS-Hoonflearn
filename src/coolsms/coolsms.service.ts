import { Injectable } from '@nestjs/common';
import coolsms, { Message } from 'coolsms-node-sdk';

@Injectable()
export class CoolsmsService extends coolsms {
  constructor() {
    super(process.env.COOLSMS_API_KEY, process.env.COOLSMS_API_SECRET);
  }

  async sendSMS(phone: string, token: string) {
    const message: Message = {
      to: phone,
      from: process.env.COOLSMS_SENDER,
      text: `[Hoonflearn] 인증번호 : ${token} 입니다. 3분 내에 입력해주세요.`,
      autoTypeDetect: false,
      type: 'SMS',
    };

    const qqq = this.sendOne(message);

    console.log(qqq);

    return qqq;
  }
}
