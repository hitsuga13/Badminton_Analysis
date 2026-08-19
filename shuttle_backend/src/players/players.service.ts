import { Injectable } from '@nestjs/common';

export interface Player {
  id: number;
  name: string;
  category: string;
  hand: string;
  age: number;
  heightCm: number;
  weightKg: number;
  rank: number;
  form: number[];
}

@Injectable()
export class PlayersService {
  private players: Player[] = [
    {
      id: 1,
      name: 'Lee Chong Wei',
      category: 'Professional',
      hand: 'Right',
      age: 28,
      heightCm: 170,
      weightKg: 65,
      rank: 1,
      form: [1, 1, 0, 1, 0],
    },
  ];

  findAll(): Player[] {
    return this.players;
  }
  create(data: Omit<Player, 'id' | 'rank'>): Player {
    const newPlayer: Player = {
      ...data,
      id: Date.now(),
      rank: this.players.length + 1,
    };
    this.players.push(newPlayer);
    return newPlayer;
  }

  update(id: number, data: Partial<Player>): Player | null {
    const index = this.players.findIndex((p) => p.id === id);
    if (index === -1) return null;
    this.players[index] = { ...this.players[index], ...data };
    return this.players[index];
  }

  remove(id: number): void {
    this.players = this.players.filter((p) => p.id !== id);
  }
}
