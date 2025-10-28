import { authMiddleware } from '@/auth/jwt-guard';
import Elysia from 'elysia';
import z from 'zod';

type Player = {
  id: string;
  positionX: number;
  positionY: number;
};

const players = new Map<string, Player>();

export const game = new Elysia({ prefix: '/games' })
  .use(authMiddleware)
  .guard({ auth: true })
  .ws('/ws', {
    body: z.object({
      positionX: z.number(),
      positionY: z.number()
    }),
    open(ws) {
      // Adiciona o jogador com posição inicial (exemplo: 0,0)
      players.set(ws.id, { id: ws.id, positionX: 0, positionY: 0 });
      broadcastPlayers(ws);
    },


    message(ws, { positionX, positionY }) {
      players.set(ws.id, { id: ws.id, positionX, positionY });
      broadcastPlayers(ws);
    },
    close(ws) {
      players.delete(ws.id);
      broadcastPlayers(ws);

    }

  })

function broadcastPlayers(ws) {
  const payload = JSON.stringify({
    event: 'playersList',
    message: { players: Array.from(players.values()) }
  });
  for (const client of ws.server.clients) {
    if (client.readyState === 1) { // 1 = OPEN
      client.send(payload);
    }
  }
}
