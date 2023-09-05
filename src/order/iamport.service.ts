import {
  BadRequestException,
  HttpException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IamportService {
  async getIamportToken() {
    try {
      const result = await axios.post(`https://api.iamport.kr/users/getToken`, {
        imp_key: process.env.IAMPORT_REST_KEY,
        imp_secret: process.env.IAMPORT_REST_SECRET_KEY,
      });

      return result.data.response.access_token;
    } catch (error) {
      if (error.response.status === 401) {
        throw new UnauthorizedException(error.response.data.message); // imp_key, imp_secret 인증에 실패한 경우
      }
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }

  async getPaymentData(imp_uid: string, totalPrice: number) {
    try {
      const token = await this.getIamportToken();

      const result = await axios.get(
        `https://api.iamport.kr/payments/${imp_uid}`,
        { headers: { Authorization: token } },
      );

      if (totalPrice !== result?.data?.response?.amount) {
        throw new BadRequestException('금액이 변조 되었습니다.');
      }

      return result?.data?.response;
    } catch (error) {
      throw new HttpException(error.response?.message, error.status);
    }
  }
}

// @Injectable()
// export class IamportService {
//   async getPaymentData(access_token: string, imp_uid: string) {
//     try {
//       const paymentData = await axios({
//         url: `https://api.iamport.kr/payments/${imp_uid}`,
//         method: 'get',
//         headers: { Authorization: access_token },
//       });

//       return paymentData;
//     } catch (error) {
//       if (error.response.status === 401) {
//         throw new UnauthorizedException(error.response.data.message); // Token이 전달되지 않았거나 유효하지 않은 경우
//       }
//       if (error.response.status === 404) {
//         throw new NotFoundException(error.response.data.message); // 유효하지 않은 imp_uid
//       }
//       throw new HttpException(
//         error.response.data.message,
//         error.response.status,
//       );
//     }
//   }

//   async getIamportToken(): Promise<string> {
//     try {
//       const token = await axios({
//         url: 'https://api.iamport.kr/users/getToken',
//         method: 'post',
//         headers: { 'Content-Type': 'application/json' },
//         data: {
//           imp_key: process.env.IAMPORT_REST_KEY,
//           imp_secret: process.env.IAMPORT_REST_SECRET_KEY,
//         },
//       });
//       return token.data.response.access_token;
//     } catch (error) {
//       console.log(error);

//   if (error.response.status === 401) {
//     throw new UnauthorizedException(error.response.data.message); // imp_key, imp_secret 인증에 실패한 경우
//   }
//   throw new HttpException(
//     error.response.data.message,
//     error.response.status,
//   );
//     }
//   }

//   async cancelPaymentData(
//     access_token: string,
//     imp_uid: string,
//     // amount: number,
//   ) {
//     try {
//       const cancelData = await axios({
//         url: `https://api.iamport.kr/payments/cancel`,
//         method: 'post',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: access_token,
//         },
//         data: {
//           imp_uid,
//           //   amount,
//         },
//       });

//       const result = cancelData.data;

//       console.log(result);
//       return result;
//     } catch (error) {
//       if (error.response.status === 401) {
//         throw new UnauthorizedException(error.response.data.message);
//       }

//       throw new HttpException(
//         error.response.data.message,
//         error.response.status,
//       );
//     }
//   }
// }
