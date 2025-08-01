import { Injectable } from "@nestjs/common";
import axios from 'axios';

@Injectable()
export class ZoomAuthService{
    async getAccessToken(client_id:string,client_secret:string,client_account_id:string): Promise<string> {
    const res = await axios.post(
      'https://zoom.us/oauth/token',
      null,
      {
        params: {
          grant_type: 'account_credentials',
          account_id: client_account_id,
        },
        auth: {
          username: client_id,
          password: client_secret,
        },
      },
    );
    return res.data.access_token;
  }
}