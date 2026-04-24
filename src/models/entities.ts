import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Relation } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ select: false })
  password!: string;

  @OneToMany(() => Assisted, (assisted) => assisted.user)
  assisteds!: Relation<Assisted[]>
}

@Entity()
export class Assisted {  // Beneficiário
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  fullName!: string;

  @Column({ unique: true })
  cpf!: string;

  @Column("decimal")
  monthlyFamiliarMoney!: number

  @ManyToOne(() => User, (user) => user.assisteds)
  user!: Relation<User>

  @OneToMany(() => Benefit, (benefit) => benefit.assisted)
  benefits!: Relation<Benefit[]>
}

export type BenefitType = "food" | "gas" | "transport"

@Entity()
export class Benefit {  // Auxílio
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  type!: BenefitType

  @Column("decimal")
  value!: number

  @CreateDateColumn()
  createdAt!: Date

  @ManyToOne(() => Assisted, (assisted) => assisted.benefits)
  assisted!: Relation<Assisted>
}
