import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ActivityCategory } from '../constants/activity';
import { User } from './user';

@Entity('activity_templates')
export class ActivityTemplate {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: number;

  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ length: 64 })
  name!: string;

  @Column({ type: 'enum', enum: ActivityCategory })
  category!: ActivityCategory;

  @Column({ name: 'sub_type', length: 64 })
  subType!: string;

  @Column({ length: 32 })
  unit!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  note!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt!: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
