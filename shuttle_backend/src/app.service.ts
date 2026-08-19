import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Buat apa tu kawan';
  }
  getMatches(): string {
    return 'Match result';
  }
}
