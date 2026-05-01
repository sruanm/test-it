import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    isAdmin!: boolean

    @Column({ unique: true })
    email!: string

    @Column({ select: false })
    password!: string
}

@Entity()
export class Event {
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    title!: string

    @Column()
    description!: string

    @Column()
    date!: string

    @Column('int')
    maxLimit!: number

    @ManyToOne(() => User, { nullable: false })
    organizer!: Relation<User>
}

@Entity()
export class Confirmation {
    @PrimaryGeneratedColumn()
    id!: number

    @ManyToOne(() => User, { nullable: false })
    user!: Relation<User>

    @ManyToOne(() => Event, { nullable: false })
    event!: Relation<Event>
}