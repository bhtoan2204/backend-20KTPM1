import { Logger, OnModuleInit, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { NestGateway } from "@nestjs/websockets/interfaces/nest-gateway.interface";
import { Server, Socket } from "socket.io";
import { TokenPayload } from "src/auth/interface/tokenPayload.interface";
import { JwtStrategy } from "src/auth/strategies/jwt.strategy";
import { Notification } from "src/utils/schema/notification.schema";
import { NotificationService } from "./notification.service";
import { NotificationDto } from "./dto/notification.dto";

export interface socketMetaPayload extends TokenPayload {
    socketId: string;
}

@WebSocketGateway({
    namespace: 'notification',
    cors: { origin: '*', },
})
export class NotificationGateway implements OnModuleInit {
    @WebSocketServer() server: Server;
    socketMap = new Map<string, socketMetaPayload>();

    constructor(
        private readonly notificationService: NotificationService,
        private readonly jwtService: JwtService,) { }


    async onModuleInit() {
        this.server.on('connection', async (socket) => {
            try {
                const token = socket.handshake.headers.authorization.split(' ')[1];
                if (!token) throw new UnauthorizedException('Token not found');
                const payload = await this.jwtService.verifyAsync(token) as TokenPayload;
                if (!payload) throw new UnauthorizedException('Token not found');
                const socketId = socket.id;
                this.socketMap.set(payload._id, { socketId, ...payload });

                console.log(this.socketMap)
                return socketId;
            }
            catch (error) {
                console.error('Error handling connection:', error.message);
                socket.disconnect(true);
            }
        });
    }

    async emitNotification(notification: NotificationDto, userId: string) {
        const socketMeta = this.socketMap.get(userId);
        const notif = await this.notificationService.create(notification);
        if (socketMeta) {
            this.server.to(socketMeta.socketId).emit('notification', notification);
        }
        else {
            console.log('User not online');
        }
    }

    @SubscribeMessage('currentUser')
    async currentUser(client: Socket) {
        client.emit('currentUser', Array.from(this.socketMap.values()));
    }

}