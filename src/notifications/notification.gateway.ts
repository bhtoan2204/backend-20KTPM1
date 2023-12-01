import { OnModuleInit, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { TokenPayload } from "src/auth/interface/tokenPayload.interface";
import { NotificationService } from "./notification.service";
import { NotificationDto } from "./dto/notification.dto";
import { WsJwtAuthGuard } from "src/utils/guard/authenticate/ws-jwt-auth.guard";
import { WsCurrentUser } from "src/utils/decorator/current-user.decorator";
import { User } from "src/utils/schema/user.schema";

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
                this.socketMap.set(socketId, { socketId, ...payload });

                return socketId;
            }
            catch (error) {
                console.error('Error handling connection:', error.message);
                socket.disconnect(true);
            }
        });
    }

    async handleDisconnect(client: Socket) {
        const socketId = client.id;
        this.socketMap.delete(socketId);
        console.log(`Client disconnected: ${socketId}`);
    }

    @SubscribeMessage('newNotification')
    @UseGuards(WsJwtAuthGuard)
    async emitNotification(@ConnectedSocket() client: Socket, @WsCurrentUser() user: User, @MessageBody() notification: NotificationDto) {
        try {
            const notifications = await this.notificationService.createNotification(user._id, notification);
            const receiverSocket = Array.from(this.socketMap.values()).find((socket) => socket._id === notification.receiver_id);
            if (receiverSocket) {
                this.server.to(receiverSocket.socketId).emit('onNotification', notification);
            }
            else {
                return { message: 'Receiver not online' };
            }
        }
        catch (error) {
            client.disconnect(true);
            throw error;
        }
    }

}