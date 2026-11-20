import { Column, Entity } from 'typeorm';
// Adjust import path to the project's shared entity base classes.
import { DomainTimesEntity } from '../../common/entities/common.entities';

@Entity('REPLACE_WITH_TABLE_NAME')
export class ReplaceWithEntity extends DomainTimesEntity<ReplaceWithEntity> {
  @Column({ name: 'name' })
  name: string;
}
