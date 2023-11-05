import { User } from 'src/user/entity/user.entity';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
} from 'typeorm';

@Entity()
export class RefreshToken {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: false })
    user_id: string;

    @Column({ nullable: false, unique: true })
    refresh_token: string;

    @Column({ nullable: false })
    expires_at: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

}